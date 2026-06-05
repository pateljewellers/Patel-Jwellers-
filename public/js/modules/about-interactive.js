/**
 * LIQUID GLASS WATER REVEAL — About Hero
 * WebGL-powered subtle water distortion + ripple cursor effect
 *
 * Fixes applied in this version:
 *  1. Subtle effect tuning — gentle distortion, no nausea-inducing displacement.
 *  2. bfcache reinit — listens to `pageshow` (persisted) and `visibilitychange`
 *     so the effect re-initialises every time the page is revisited, not just
 *     on the first cold load.
 *  3. Proper destroy() — tears down the RAF loop, ResizeObserver, event
 *     listeners, and WebGL resources before each re-init so nothing leaks.
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
   Key tuning knobs (all deliberately small for an elegant result):
     WATER_STR  — overall FBM wave displacement (UV units)
     RIPPLE_STR — displacement per ripple ring
     ABERR_MAX  — max chromatic split at lens edge (UV units)
     SPEC_POW   — specular highlight sharpness
     SPEC_STR   — specular highlight brightness
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
    return (uv - 0.5) * s + 0.5;
  }

  void main() {
    vec2  uv      = v_uv;
    vec2  fragPx  = uv * u_res;
    vec2  mousePx = u_mouse * u_res;
    float dist    = length(fragPx - mousePx);

    /* Smooth circular reveal — soft inner falloff */
    float mask = smoothstep(u_radius, u_radius * 0.38, dist) * u_active;

    /* ── Subtle layered water displacement ──
       Two slow FBM fields at offset phases produce gently drifting
       waves without any jarring direction.                            */
    float t   = u_time * 0.14;                /* very slow drift      */
    float asp = u_res.x / u_res.y;
    vec2  wu  = vec2(uv.x * asp, uv.y) * 2.0; /* lower frequency      */

    float n1  = fbm(wu + vec2( t * 0.38,  t * 0.26));
    float n2  = fbm(wu + vec2(-t * 0.30 + 3.7, t * 0.22 + 1.9));

    /* Scale distortion to UV space — WATER_STR keeps it very gentle  */
    vec2 wDist = vec2(n1, n2) * WATER_STR * mask;

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
      wDist   += dir * wave * RIPPLE_STR * mask;
    }

    /* ── Sample texture with cover-fit and distortion ── */
    vec2 baseUV   = coverUV(uv, u_res, u_texSize);
    vec2 sampleUV = clamp(baseUV + wDist, 0.001, 0.999);
    vec4 texCol   = texture2D(u_tex, sampleUV);

    /* ── Minimal chromatic aberration — glass edge only ──
       Increases toward lens perimeter, invisible at lens centre.     */
    float edgeF = smoothstep(u_radius * 0.30, u_radius * 0.60, dist) * u_active;
    float aberr = edgeF * ABERR_MAX;
    texCol.r = texture2D(u_tex, clamp(sampleUV + vec2(aberr, 0.0),  0.001, 0.999)).r;
    texCol.b = texture2D(u_tex, clamp(sampleUV - vec2(aberr, 0.0),  0.001, 0.999)).b;

    /* ── Subtle specular — water surface wet sheen ── */
    float spec = pow(max(n1 * 0.5 + 0.5, 0.0), SPEC_POW) * SPEC_STR * mask;

    /* ── Thin lens-edge highlight ring ── */
    float rw  = u_radius * 0.055;
    float rim = smoothstep(u_radius, u_radius - rw, dist)
              * smoothstep(u_radius - rw * 2.2, u_radius - rw, dist);
    vec3 rimCol = vec3(0.09, 0.04, 0.03) * rim * u_active; /* dim rim */

    /* ── Compose ── */
    vec3 dark  = vec3(0.031, 0.031, 0.031);
    vec3 water = texCol.rgb + spec;
    vec3 color = mix(dark, water, mask) + rimCol;

    gl_FragColor = vec4(color, 1.0);
  }
`;

/* ════════════════════════════════════════════════════════════════════════
   INIT — creates a self-contained instance with its own cleanup method
════════════════════════════════════════════════════════════════════════ */
function initWaterEffect() {
  const section  = document.getElementById('about-hero');
  if (!section) return null;

  const canvas   = document.getElementById('about-water-canvas');
  const resetBtn = document.getElementById('about-reset-btn');
  const spotBg   = document.getElementById('about-spotlight-bg');

  const prefersRM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!canvas || prefersRM) { initCSSFallback(section, spotBg, canvas, resetBtn); return null; }

  /* ── WebGL context ── */
  const gl = canvas.getContext('webgl', {
    alpha: false,
    antialias: false,
    preserveDrawingBuffer: false,
    powerPreference: 'high-performance',
  });
  if (!gl) { initCSSFallback(section, spotBg, canvas, resetBtn); return null; }

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
  if (!vert || !frag) { initCSSFallback(section, spotBg, canvas, resetBtn); return null; }

  const prog = gl.createProgram();
  gl.attachShader(prog, vert); gl.attachShader(prog, frag);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn('[WaterReveal] Link error:', gl.getProgramInfoLog(prog));
    initCSSFallback(section, spotBg, canvas, resetBtn); return null;
  }

  /* ── Quad geometry ── */
  const quadBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1,
  ]), gl.STATIC_DRAW);

  /* ── Uniform locations ── */
  const U = {
    tex:     gl.getUniformLocation(prog, 'u_tex'),
    res:     gl.getUniformLocation(prog, 'u_res'),
    texSize: gl.getUniformLocation(prog, 'u_texSize'),
    mouse:   gl.getUniformLocation(prog, 'u_mouse'),
    time:    gl.getUniformLocation(prog, 'u_time'),
    radius:  gl.getUniformLocation(prog, 'u_radius'),
    active:  gl.getUniformLocation(prog, 'u_active'),
    rpos:    gl.getUniformLocation(prog, 'u_rpos[0]'),
    rage:    gl.getUniformLocation(prog, 'u_rage[0]'),
  };
  const A_POS = gl.getAttribLocation(prog, 'a_pos');

  /* ── Load background texture ── */
  let texture = null, texW = 1, texH = 1, texReady = false;
  const bgStyle  = spotBg ? spotBg.style.backgroundImage : '';
  const srcMatch = bgStyle.match(/url\(['"]?(.+?)['"]?\)/);
  const imgSrc   = srcMatch ? srcMatch[1] : '/images/about/diamonds_hero.png';

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    texW = img.naturalWidth; texH = img.naturalHeight;
    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    texReady = true;
    startLoop();
  };
  img.onerror = () => initCSSFallback(section, spotBg, canvas, resetBtn);
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
    gl.uniform1f(U.active,  activeVal);
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
    if (e.target.closest('#about-reset-btn')) return;
    if (!isPlaying) {
      isPlaying = true; isHovered = false;
      section.classList.add('is-playing');
      if (resetBtn) { resetBtn.style.opacity = '1'; resetBtn.style.pointerEvents = 'auto'; }
      startLoop();
    }
  };
  const onReset = (e) => {
    e.stopPropagation();
    isPlaying = false;
    section.classList.remove('is-playing');
    if (resetBtn) { resetBtn.style.opacity = '0'; resetBtn.style.pointerEvents = 'none'; }
    startLoop();
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
  if (resetBtn) resetBtn.addEventListener('click', onReset);

  /* ── Destroy — tears everything down cleanly ── */
  function destroy() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    if (ro)    ro.disconnect();
    if (touchInterval) clearInterval(touchInterval);

    section.removeEventListener('mousemove',  onMove);
    section.removeEventListener('mouseenter', onEnter);
    section.removeEventListener('mouseleave', onLeave);
    section.removeEventListener('click',      onClick);
    if (resetBtn) resetBtn.removeEventListener('click', onReset);

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
    if (resetBtn) { resetBtn.style.opacity = '0'; resetBtn.style.pointerEvents = 'none'; }
  }

  return { destroy };
}

/* ════════════════════════════════════════════════════════════════════════
   CSS FALLBACK — original LERP spotlight (no WebGL)
════════════════════════════════════════════════════════════════════════ */
function initCSSFallback(section, spotBg, canvas, resetBtn) {
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
    if (e.target.closest('#about-reset-btn')) return;
    if (!section.classList.contains('is-playing')) {
      section.classList.add('is-playing');
      section.classList.remove('mouse-active');
      hovered = false; cancelAnimationFrame(raf);
      if (resetBtn) { resetBtn.style.opacity = '1'; resetBtn.style.pointerEvents = 'auto'; }
    }
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      section.classList.remove('is-playing');
      resetBtn.style.opacity = '0'; resetBtn.style.pointerEvents = 'none';
    });
  }
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

  /* Only initialise if the about-hero section exists on this page */
  if (!document.getElementById('about-hero')) return;

  _instance = initWaterEffect();
}

/* Cold page load */
document.addEventListener('DOMContentLoaded', bootstrap);

/* bfcache restore (browser back/forward button) */
window.addEventListener('pageshow', (e) => {
  /* `persisted` = true means the page was served from bfcache,
     meaning DOMContentLoaded did NOT fire — we must re-bootstrap. */
  if (e.persisted) bootstrap();
});

/* Tab becomes visible again after being hidden
   (covers some soft-navigation / SPA patterns) */
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    /* Only re-init if the section exists but no active instance */
    if (document.getElementById('about-hero') && !_instance) {
      _instance = initWaterEffect();
    }
  }
});
