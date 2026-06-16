/**
 * LIQUID GLASS WATER REVEAL — About Hero & Brand Heritage Reveals
 * WebGL-powered subtle water distortion + ripple cursor effect
 * Plus scroll-triggered stats and reveals for the Home Brand Story.
 *
 * Patel Jewellers Mehsanawala
 */

/* ─── Module-level handle so destroy() can reach the running instance ─── */
let _instance = null;

/* ════════════════════════════════════════════════════════════════════════
   GLSL — Vertex Shader
════════════════════════════════════════════════════════════════════════ */
const VS = /* glsl */`
  attribute vec2 a_pos;
  varying   vec2 v_uv;
  void main() {
    v_uv        = a_pos * 0.5 + 0.5;
    gl_Position = vec4(a_pos, 0.0, 1.0);
  }
`;

/* ════════════════════════════════════════════════════════════════════════
   GLSL — Fragment Shader
════════════════════════════════════════════════════════════════════════ */
const FS = /* glsl */`
  precision highp float;

  #define WATER_STR  0.0032   /* whisper-level wave displacement        */
  #define RIPPLE_STR 0.0015   /* barely-there ripple push               */
  #define ABERR_MAX  0.0005   /* nearly invisible chromatic hint        */
  #define SPEC_POW   22.0     /* very tight specular lobe               */
  #define SPEC_STR   0.022    /* faint wet sheen only                   */

  uniform sampler2D u_tex;
  uniform vec2      u_res;       /* canvas physical size (w DPR)       */
  uniform vec2      u_texSize;   /* image natural dimensions           */
  uniform vec2      u_mouse;     /* cursor 0-1, Y flipped for GL       */
  uniform float     u_time;
  uniform float     u_radius;    /* reveal radius in canvas px         */
  uniform float     u_active;    /* animated 0..1 reveal strength      */
  uniform float     u_lightTheme; /* 1.0 = light, 0.0 = dark            */

  uniform vec2      u_rpos[6];
  uniform float     u_rage[6];   /* age in seconds; <0 = inactive      */

  varying vec2 v_uv;

  /* ── Gradient noise ── */
  vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)),
             dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453);
  }
  float vnoise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(dot(hash2(i),             f),
          dot(hash2(i+vec2(1,0)), f-vec2(1,0)), u.x),
      mix(dot(hash2(i+vec2(0,1)), f-vec2(0,1)),
          dot(hash2(i+vec2(1,1)), f-vec2(1,1)), u.x), u.y);
  }

  /* 4-octave FBM — keeps frame budget low while looking organic */
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * vnoise(p);
      p  = p * 2.1 + vec2(1.31, 1.73);
      a *= 0.5;
    }
    return v;
  }

  /* background-size: cover equivalent */
  vec2 coverUV(vec2 uv, vec2 can, vec2 tex) {
    float ca = can.x / can.y, ta = tex.x / tex.y;
    vec2 s = (ca > ta) ? vec2(1.0, ta / ca) : vec2(ca / ta, 1.0);
    float yAlign = (u_lightTheme > 0.5) ? 0.15 : 0.5;
    vec2 offset = vec2(0.0);
    if (ca > ta) {
      offset.y = (0.5 - yAlign) * (1.0 - s.y);
    }
    return (uv - 0.5) * s + 0.5 + offset;
  }

  void main() {
    vec2  uv      = v_uv;
    vec2  fragPx  = uv * u_res;
    vec2  mousePx = u_mouse * u_res;
    float dist    = length(fragPx - mousePx);

    /* Smooth circular reveal — soft radial gradient falloff all the way to center */
    float mask = smoothstep(u_radius, 0.0, dist) * u_active;

    /* Default visibility on left and right sides (curved falloff towards center) */
    float defaultVisibility = pow(abs(uv.x - 0.5) * 2.0, 3.0) * 0.35;
    float finalMask = clamp(mask + defaultVisibility, 0.0, 1.0);

    /* ── Subtle layered water displacement ──
       Two slow FBM fields at offset phases produce gently drifting
       waves without any jarring direction.                            */
    float t   = u_time * 0.14;                /* very slow drift      */
    float asp = u_res.x / u_res.y;
    vec2  wu  = vec2(uv.x * asp, uv.y) * 2.0; /* lower frequency      */

    float n1  = fbm(wu + vec2( t * 0.38,  t * 0.26));
    float n2  = fbm(wu + vec2(-t * 0.30 + 3.7, t * 0.22 + 1.9));

    /* Scale distortion to UV space — WATER_STR keeps it very gentle  */
    vec2 wDist = vec2(n1, n2) * WATER_STR * finalMask;

    /* ── Expanding ring ripples ──
       Each ripple is a single sine wave propagating outward.
       RIPPLE_STR is small so they feel like a shimmer, not a quake.  */
    float rSpd = min(u_res.x, u_res.y) * 0.14; /* px/sec propagation  */
    for (int i = 0; i < 6; i++) {
      float age = u_rage[i];
      if (age < 0.0 || age > 1.6) continue;

      vec2  rp   = u_rpos[i] * u_res;
      float rd   = length(fragPx - rp);
      float ring = rd - age * rSpd;

      /* Very narrow oscillation, rapid time decay, tight spatial drop */
      float wave = sin(ring * 0.28)
                 * exp(-age  * 4.8)           /* fast time decay        */
                 * exp(-rd   / (u_radius * 0.9));

      vec2 dir = (rd > 0.5) ? normalize(fragPx - rp) : vec2(0.0, 1.0);
      wDist   += dir * wave * RIPPLE_STR * finalMask;
    }

    /* ── Sample texture with cover-fit and distortion ── */
    vec2 baseUV   = coverUV(uv, u_res, u_texSize);
    vec2 sampleUV = clamp(baseUV + wDist, 0.001, 0.999);
    vec4 texCol   = texture2D(u_tex, sampleUV);

    /* ── Minimal chromatic aberration — glass edge only ──
       Increases toward lens perimeter, invisible at lens centre.     */
    float edgeF = smoothstep(0.0, u_radius, dist) * u_active;
    float aberr = edgeF * ABERR_MAX;
    texCol.r = texture2D(u_tex, clamp(sampleUV + vec2(aberr, 0.0),  0.001, 0.999)).r;
    texCol.b = texture2D(u_tex, clamp(sampleUV - vec2(aberr, 0.0),  0.001, 0.999)).b;

    /* ── Subtle specular — water surface wet sheen ── */
    float spec = pow(max(n1 * 0.5 + 0.5, 0.0), SPEC_POW) * SPEC_STR * finalMask;

    /* ── Compose ── */
    float g = uv.x * 0.966 - uv.y * 0.259;
    float tGrad = clamp((g + 0.259) / 1.225, 0.0, 1.0);
    vec3 col0, col1, col2, col3;
    if (u_lightTheme > 0.5) {
      col0 = vec3(0.831, 0.722, 0.659); // #D4B8A8
      col1 = vec3(0.918, 0.851, 0.804); // #EAD9CD
      col2 = vec3(0.961, 0.929, 0.894); // #F5EDE4
      col3 = vec3(0.980, 0.969, 0.949); // #FAF7F2
    } else {
      col0 = vec3(0.082, 0.051, 0.055); // #150D0E (0%)
      col1 = vec3(0.098, 0.059, 0.063); // #190F10 (40%)
      col2 = vec3(0.122, 0.071, 0.075); // #1F1214 (70%)
      col3 = vec3(0.071, 0.039, 0.043); // #120A0B (100%)
    }
    vec3 light;
    if (tGrad < 0.4) {
      light = mix(col0, col1, tGrad / 0.4);
    } else if (tGrad < 0.7) {
      light = mix(col1, col2, (tGrad - 0.4) / 0.3);
    } else {
      light = mix(col2, col3, (tGrad - 0.7) / 0.3);
    }
    vec3 water = texCol.rgb + spec;
    vec3 color = mix(light, water, finalMask);

    gl_FragColor = vec4(color, 1.0);
  }
`;

/* ════════════════════════════════════════════════════════════════════════
   INIT WATER EFFECT — creates a self-contained WebGL instance
════════════════════════════════════════════════════════════════════════ */
function initWaterEffect() {
  const section  = document.getElementById('about-hero') || document.getElementById('about-brand');
  if (!section) return null;

  const canvas   = document.getElementById('about-water-canvas');
  const spotBg   = document.getElementById('about-spotlight-bg');
  const imgFrame = section.querySelector('.hs-brand__img-frame');

  const isLightTheme = section.classList.contains('about-hero-immersive') ||
                       window.matchMedia('(prefers-color-scheme: light)').matches;

  const prefersRM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!canvas || prefersRM) { initCSSFallback(section, spotBg, canvas); return null; }

  /* ── WebGL context ── */
  const gl = canvas.getContext('webgl', {
    alpha: false,
    antialias: false,
    preserveDrawingBuffer: false,
    powerPreference: 'high-performance',
  });
  if (!gl) { initCSSFallback(section, spotBg, canvas); return null; }

  /* ── Compile shader ── */
  function compileShader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('[WaterReveal] Shader error:', gl.getShaderInfoLog(s));
      gl.deleteShader(s); return null;
    }
    return s;
  }
  const vert = compileShader(gl.VERTEX_SHADER,   VS);
  const frag = compileShader(gl.FRAGMENT_SHADER, FS);
  if (!vert || !frag) { initCSSFallback(section, spotBg, canvas); return null; }

  const prog = gl.createProgram();
  gl.attachShader(prog, vert); gl.attachShader(prog, frag);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn('[WaterReveal] Link error:', gl.getProgramInfoLog(prog));
    initCSSFallback(section, spotBg, canvas); return null;
  }

  /* ── Quad geometry ── */
  const quadBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1,
  ]), gl.STATIC_DRAW);

  /* ── Uniform locations ── */
  const U = {
    tex:        gl.getUniformLocation(prog, 'u_tex'),
    res:        gl.getUniformLocation(prog, 'u_res'),
    texSize:    gl.getUniformLocation(prog, 'u_texSize'),
    mouse:      gl.getUniformLocation(prog, 'u_mouse'),
    time:       gl.getUniformLocation(prog, 'u_time'),
    radius:     gl.getUniformLocation(prog, 'u_radius'),
    active:     gl.getUniformLocation(prog, 'u_active'),
    lightTheme: gl.getUniformLocation(prog, 'u_lightTheme'),
    rpos:       gl.getUniformLocation(prog, 'u_rpos[0]'),
    rage:       gl.getUniformLocation(prog, 'u_rage[0]'),
  };
  const A_POS = gl.getAttribLocation(prog, 'a_pos');

  /* ── Load background texture ── */
  let texture = null, texW = 1, texH = 1, texReady = false;
  const bgStyle  = spotBg ? spotBg.style.backgroundImage : '';
  const srcMatch = bgStyle.match(/url\(['"]?(.+?)['"]?\)/);
  const imgSrc   = srcMatch ? srcMatch[1] : '/images/about/brand_heritage.png';

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    texW = img.naturalWidth; texH = img.naturalHeight;
    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    texReady = true;
    startLoop();
  };
  img.onerror = () => initCSSFallback(section, spotBg, canvas);
  img.src = imgSrc;

  /* Mark WebGL active — CSS hides the fallback spotlight */
  section.classList.add('has-webgl');

  /* ── Resize ── */
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  function resize() {
    const r = section.getBoundingClientRect();
    canvas.width  = r.width  * DPR;
    canvas.height = r.height * DPR;
    canvas.style.width  = r.width  + 'px';
    canvas.style.height = r.height + 'px';
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();
  const ro = ('ResizeObserver' in window) ? new ResizeObserver(resize) : null;
  if (ro) ro.observe(section);

  /* ── State ── */
  const MAX_R   = 6;
  const ripples = Array.from({ length: MAX_R }, () => ({ x: 0.5, y: 0.5, age: -1 }));
  let rippleHead   = 0;
  let lastRippleMs = 0;

  let mouse     = { x: 0.5, y: 0.5 };
  let target    = { x: 0.5, y: 0.5 };
  let prevMouse = { x: 0.5, y: 0.5 };
  let isHovered = false, isPlaying = false;
  let activeVal = 0.0;
  let rafId     = null;
  const startTime   = performance.now();
  let   prevTs      = performance.now();

  function spawnRipple(nx, ny) {
    ripples[rippleHead] = { x: nx, y: ny, age: 0 };
    rippleHead = (rippleHead + 1) % MAX_R;
  }

  /* ── Render ── */
  function render(now) {
    rafId = null;
    if (!texReady) { rafId = requestAnimationFrame(render); return; }

    const t  = (now - startTime) * 0.001;
    const dt = Math.min((now - prevTs) * 0.001, 0.05);
    prevTs = now;

    /* Exponential cursor smoothing */
    const lf = 1.0 - Math.pow(0.03, dt);
    mouse.x += (target.x - mouse.x) * lf;
    mouse.y += (target.y - mouse.y) * lf;

    /* Velocity-based ripple spawning — gentle threshold */
    const vel = Math.hypot(
      (mouse.x - prevMouse.x) / dt,
      (mouse.y - prevMouse.y) / dt
    );
    if (isHovered && !isPlaying && vel > 0.12 && now - lastRippleMs > 220) {
      spawnRipple(mouse.x, mouse.y);
      lastRippleMs = now;
    }
    prevMouse.x = mouse.x; prevMouse.y = mouse.y;

    /* Age ripples */
    for (const r of ripples) { if (r.age >= 0) r.age += dt; }

    /* Animate reveal strength */
    const targetActive = (isHovered && !isPlaying) ? 1.0 : 0.0;
    activeVal += (targetActive - activeVal) * (1.0 - Math.pow(0.006, dt));

    /* Build ripple uniform arrays */
    const rposArr = new Float32Array(MAX_R * 2);
    const rageArr = new Float32Array(MAX_R);
    for (let i = 0; i < MAX_R; i++) {
      rposArr[i*2]   = ripples[i].x;
      rposArr[i*2+1] = 1.0 - ripples[i].y; // flip Y for GL
      rageArr[i]     = ripples[i].age;
    }

    /* ── Draw ── */
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    gl.enableVertexAttribArray(A_POS);
    gl.vertexAttribPointer(A_POS, 2, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(U.tex, 0);

    gl.uniform2f(U.res,     canvas.width, canvas.height);
    gl.uniform2f(U.texSize, texW, texH);
    gl.uniform2f(U.mouse,   mouse.x, 1.0 - mouse.y);
    gl.uniform1f(U.time,    t);
    gl.uniform1f(U.radius,  Math.min(canvas.width, canvas.height) * 0.28);
    gl.uniform1f(U.active,      activeVal);
    gl.uniform1f(U.lightTheme,  isLightTheme ? 1.0 : 0.0);
    gl.uniform2fv(U.rpos, rposArr);
    gl.uniform1fv(U.rage, rageArr);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    /* Keep loop alive only while needed */
    if (activeVal > 0.002 || targetActive > 0) {
      rafId = requestAnimationFrame(render);
    }
  }

  function startLoop() {
    if (!rafId) rafId = requestAnimationFrame(render);
  }

  /* ── Mouse / Touch events (stored for later removal) ── */
  const hasHover = window.matchMedia('(hover: hover)').matches;
  let touchInterval = null;

  const onMove = (e) => {
    const r = section.getBoundingClientRect();
    target.x = (e.clientX - r.left) / r.width;
    target.y = (e.clientY - r.top)  / r.height;
  };
  const onEnter = (e) => {
    isHovered = true;
    const r = section.getBoundingClientRect();
    target.x = mouse.x = (e.clientX - r.left) / r.width;
    target.y = mouse.y = (e.clientY - r.top)  / r.height;
    spawnRipple(mouse.x, mouse.y);
    startLoop();
  };
  const onLeave = () => {
    isHovered = false;
    startLoop();
  };
  const onClick = (e) => {
    if (isPlaying) {
      isPlaying = false;
      section.classList.remove('is-playing');
      startLoop();
    } else {
      isPlaying = true;
      isHovered = false;
      section.classList.add('is-playing');
      startLoop();
    }
  };

  if (hasHover) {
    section.addEventListener('mousemove',  onMove,  { passive: true });
    section.addEventListener('mouseenter', onEnter, { passive: true });
    section.addEventListener('mouseleave', onLeave, { passive: true });
  } else {
    /* Touch: gentle ambient drift + random ripples */
    target.x = mouse.x = 0.5; target.y = mouse.y = 0.45;
    isHovered = true;
    touchInterval = setInterval(() => {
      if (isPlaying) return;
      const nx = 0.25 + Math.random() * 0.5;
      const ny = 0.25 + Math.random() * 0.5;
      spawnRipple(nx, ny);
      target.x = nx; target.y = ny;
    }, 950);
    startLoop();
  }

  section.addEventListener('click', onClick);

  // 3D Parallax frame tilt event listeners
  if (imgFrame && !prefersRM) {
    imgFrame.addEventListener('mousemove', (e) => {
      const rect = imgFrame.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const normX = (x / rect.width) * 2 - 1;
      const normY = (y / rect.height) * 2 - 1;
      const tiltX = -normY * 12; // 12 degrees max tilt
      const tiltY = normX * 12;
      imgFrame.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.04, 1.04, 1.04)`;
    }, { passive: true });

    imgFrame.addEventListener('mouseleave', () => {
      imgFrame.style.transform = '';
    }, { passive: true });
  }

  // Bind legacy timeline interactive triggers inside water effect to access closures
  const tabs = section.querySelectorAll('.timeline-tab');
  const panes = section.querySelectorAll('.hs-brand__pane');

  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.stopPropagation();
      const chapter = tab.dataset.chapter;

      // Update tabs active state
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Update panes active state
      panes.forEach(pane => {
        if (pane.dataset.chapter === chapter) {
          pane.classList.add('active');
          // Re-trigger stats counter animations in the active pane
          const counters = pane.querySelectorAll('.hs-counter');
          counters.forEach(c => {
            c.textContent = '0';
            animateCounter(c);
          });
        } else {
          pane.classList.remove('active');
        }
      });

      // Spawn a wave of WebGL water ripples on timeline change!
      for (let i = 0; i < 4; i++) {
        setTimeout(() => {
          spawnRipple(0.5 + (Math.random() - 0.5) * 0.12, 0.45 + (Math.random() - 0.5) * 0.12);
          startLoop();
        }, i * 140);
      }
    });
  });

  /* ── Destroy — tears everything down cleanly ── */
  function destroy() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    if (ro)    ro.disconnect();
    if (touchInterval) clearInterval(touchInterval);

    section.removeEventListener('mousemove',  onMove);
    section.removeEventListener('mouseenter', onEnter);
    section.removeEventListener('mouseleave', onLeave);
    section.removeEventListener('click',      onClick);

    /* Clean up WebGL resources */
    if (texture) gl.deleteTexture(texture);
    gl.deleteBuffer(quadBuf);
    gl.deleteShader(vert);
    gl.deleteShader(frag);
    gl.deleteProgram(prog);

    /* Remove has-webgl flag so next init starts fresh */
    section.classList.remove('has-webgl');

    /* Reset canvas opacity in case is-playing was active */
    section.classList.remove('is-playing');
  }

  return { destroy };
}

/* ════════════════════════════════════════════════════════════════════════
   CSS FALLBACK — original LERP spotlight (no WebGL)
════════════════════════════════════════════════════════════════════════ */
function initCSSFallback(section, spotBg, canvas) {
  if (canvas)  canvas.style.display = 'none';
  if (spotBg)  spotBg.style.display = 'block';
  section.classList.remove('has-webgl');

  let mx = 0, my = 0, tx = 0, ty = 0;
  let hovered = false, raf = null;

  const update = () => {
    mx += (tx - mx) * 0.12; my += (ty - my) * 0.12;
    section.style.setProperty('--mouse-x', `${mx}px`);
    section.style.setProperty('--mouse-y', `${my}px`);
    const glow = document.getElementById('about-cursor-glow');
    if (glow) { glow.style.left = `${mx}px`; glow.style.top = `${my}px`; }
    if (hovered && !section.classList.contains('is-playing'))
      raf = requestAnimationFrame(update);
  };

  section.addEventListener('mousemove', (e) => {
    const r = section.getBoundingClientRect();
    tx = e.clientX - r.left; ty = e.clientY - r.top;
  }, { passive: true });

  section.addEventListener('mouseenter', (e) => {
    hovered = true; section.classList.add('mouse-active');
    const r = section.getBoundingClientRect();
    tx = e.clientX - r.left; ty = e.clientY - r.top; mx = tx; my = ty;
    cancelAnimationFrame(raf); raf = requestAnimationFrame(update);
  }, { passive: true });

  section.addEventListener('mouseleave', () => {
    hovered = false; section.classList.remove('mouse-active');
    cancelAnimationFrame(raf);
  }, { passive: true });

  section.addEventListener('click', (e) => {
    if (section.classList.contains('is-playing')) {
      section.classList.remove('is-playing');
    } else {
      section.classList.add('is-playing');
      section.classList.remove('mouse-active');
      hovered = false; cancelAnimationFrame(raf);
    }
  });
}

/* ════════════════════════════════════════════════════════════════════════
   BRAND HERITAGE SECTION — Venetian Spa-Style Scroll Animations
   Uses Intersection Observer API for fade-in-up and counter animations.
════════════════════════════════════════════════════════════════════════ */

/* ─── Utility: ease function ─── */
function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/* ─── Counter Animation ─── */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  if (isNaN(target)) return;

  const duration = 1800; // ms
  const start = performance.now();

  function tick(now) {
    const elapsed = Math.min(now - start, duration);
    const progress = easeOutExpo(elapsed / duration);
    const value = Math.round(progress * target);

    // Format with commas for large numbers
    el.textContent = value >= 1000
      ? value.toLocaleString('en-IN')
      : String(value);

    if (elapsed < duration) requestAnimationFrame(tick);
    else el.textContent = target >= 1000 ? target.toLocaleString('en-IN') : String(target);
  }

  requestAnimationFrame(tick);
}

/* ─── Intersection Observer: scroll-triggered reveals (re-triggers every entry) ─── */
function initBrandScrollReveals() {
  const section = document.querySelector('#about-brand');
  if (!section) return;

  const els = section.querySelectorAll('.hs-reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const el = entry.target;

        if (entry.isIntersecting) {
          // Animate in with the element's own delay
          const delay = parseInt(el.dataset.delay || 0, 10);
          setTimeout(() => {
            el.classList.add('is-visible');

            // Re-trigger counters any time the stats panel re-enters
            if (el.classList.contains('hs-brand__stats') || el.closest('.hs-brand__stats')) {
              const counters = section.querySelectorAll('.hs-counter');
              counters.forEach((c) => animateCounter(c));
            }
          }, delay);
        } else {
          // Reset so the animation replays on the next entry
          el.classList.remove('is-visible');
        }
      });
    },
    {
      rootMargin: '0px 0px -5% 0px',
      threshold: 0.05,
    }
  );

  els.forEach((el) => observer.observe(el));
}

/* ─── Section-level entrance: drop from top / rise from bottom ─── */
function initBrandSectionEntrance() {
  const section = document.getElementById('about-brand');
  if (!section) return;

  // Track scroll direction
  let lastScrollY = window.scrollY;
  let scrollDirection = 'down';
  window.addEventListener('scroll', () => {
    const current = window.scrollY;
    scrollDirection = current > lastScrollY ? 'down' : 'up';
    lastScrollY = current;
  }, { passive: true });

  const ENTER_DIST = 70;  // px the section travels on entry
  const DURATION   = '0.75s';
  const EASE       = 'cubic-bezier(0.22, 1, 0.36, 1)';

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Direction when entering: scrolling down → drop from above; up → rise from below
          const startY = scrollDirection === 'down' ? -ENTER_DIST : ENTER_DIST;

          // Snap to start position (no transition)
          section.style.transition = 'none';
          section.style.opacity    = '0';
          section.style.transform  = `translateY(${startY}px)`;

          // One rAF to flush the snap, then animate to resting position
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              section.style.transition = `opacity ${DURATION} ${EASE}, transform ${DURATION} ${EASE}`;
              section.style.opacity    = '1';
              section.style.transform  = 'translateY(0)';
            });
          });
        } else {
          // Section left viewport — instantly hide so it's ready to animate again
          section.style.transition = 'none';
          section.style.opacity    = '0';
          section.style.transform  = 'translateY(0)';
        }
      });
    },
    // Fire as soon as any sliver of the section enters the viewport
    { threshold: 0.02, rootMargin: '0px' }
  );

  observer.observe(section);
}

/* ─── Stagger delay for stats row when it enters viewport ─── */
function initStatsReveal() {
  const statsRow = document.querySelector('.hs-brand__stats');
  if (!statsRow) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        // Counters
        const counters = statsRow.querySelectorAll('.hs-counter');
        counters.forEach((c) => {
          // Small stagger per counter
          const idx = Array.from(counters).indexOf(c);
          setTimeout(() => animateCounter(c), idx * 180);
        });

        observer.unobserve(statsRow);
      });
    },
    { rootMargin: '-10% 0px', threshold: 0.3 }
  );

  observer.observe(statsRow);
}

/* ════════════════════════════════════════════════════════════════════════
   BOOTSTRAP — handles every way the page can become active:
     1. Cold load         → DOMContentLoaded
     2. Back/Forward nav  → pageshow (persisted = true)
     3. Tab refocus       → visibilitychange (hidden → visible)
════════════════════════════════════════════════════════════════════════ */
function bootstrap() {
  /* Destroy any previously running instance first */
  if (_instance) { _instance.destroy(); _instance = null; }

  /* 1. Initialise water reveal effect if it exists on this page */
  if (document.getElementById('about-brand') || document.getElementById('about-hero')) {
    _instance = initWaterEffect();
  }

  /* 2. Initialise brand-story scroll reveals and section entrance */
  if (document.getElementById('about-brand')) {
    initBrandSectionEntrance();
    initBrandScrollReveals();
    initStatsReveal();
  }
}

/* Cold page load */
document.addEventListener('DOMContentLoaded', bootstrap);

/* bfcache restore (browser back/forward button) */
window.addEventListener('pageshow', (e) => {
  if (e.persisted) bootstrap();
});

/* Tab becomes visible again after being hidden */
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    bootstrap();
  }
});
