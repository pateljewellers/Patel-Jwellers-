/**
 * Pratha Collection Immersive Experience — Core Frontend Script
 * raw WebGL custom fragment shader + EJS interactive page controllers
 */

document.addEventListener('DOMContentLoaded', () => {
  // Ensure we are on the pratha collection special page
  if (!document.body.classList.contains('page-temple-bangles')) return;

  initLoadingSequence();
  initWebGLVortex();
  initInteractiveShowcase();
  initCustomStudio();
});

/* ==========================================================================
   1. Sacred Mandala Loading Sequence
   ========================================================================== */
function initLoadingSequence() {
  const loader = document.getElementById('temple-loader');
  const percentageLabel = document.getElementById('loader-percentage');
  const statusLabel = document.getElementById('loader-status-text');
  const heroContent = document.getElementById('portal-hero-content');

  if (!loader || !percentageLabel || !statusLabel) return;

  // Curated premium status script milestones
  const milestones = [
    { limit: 20, text: "MELTING 22-KARAT PURE GOLD ORE..." },
    { limit: 45, text: "SHAPING SACRED PRATHA CONTOURS..." },
    { limit: 68, text: "CHISELLING GAJA LAKSHMI DETAILS..." },
    { limit: 85, text: "GRANULATING GAJRA RIMS & EMBELLISHMENTS..." },
    { limit: 98, text: "POLISHING ROYAL ANTIQUE PATINA..." },
    { limit: 100, text: "UNVEILING THE PRATHA SANCTUARY..." }
  ];

  let currentPercent = 0;

  // Count progress smoothly
  const interval = setInterval(() => {
    // Add variable increments for realistic feel
    const increment = Math.floor(Math.random() * 3) + 1;
    currentPercent = Math.min(100, currentPercent + increment);
    
    // Format to 2-digits
    percentageLabel.innerText = String(currentPercent).padStart(2, '0') + '%';
    loader.setAttribute('aria-valuenow', currentPercent);

    // Update crafting captions based on thresholds
    const activeMilestone = milestones.find(m => currentPercent <= m.limit);
    if (activeMilestone && statusLabel.innerText !== activeMilestone.text) {
      statusLabel.style.opacity = 0;
      setTimeout(() => {
        statusLabel.innerText = activeMilestone.text;
        statusLabel.style.opacity = 1;
      }, 150);
    }

    if (currentPercent >= 100) {
      clearInterval(interval);
      
      // Accelerate mandala spin on load complete
      const outerMandala = loader.querySelector('.outer-spin');
      const innerMandala = loader.querySelector('.inner-spin');
      if (outerMandala) outerMandala.style.animationDuration = '1.5s';
      if (innerMandala) innerMandala.style.animationDuration = '0.9s';

      // Gracefully transition out loader, scale up portal view
      setTimeout(() => {
        loader.classList.add('fade-out');
        if (heroContent) {
          heroContent.classList.add('loaded');
        }
      }, 600);
    }
  }, 35);
}

/* ==========================================================================
   2. WebGL Cosmic Swirl / Portal Fire Vortex
   ========================================================================== */
function initWebGLVortex() {
  const canvas = document.getElementById('fire-vortex-canvas');
  if (!canvas) return;

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) {
    console.error("WebGL not supported by this browser. Falling back to background gradients.");
    return;
  }

  // Vertex Shader source (two-triangle screen-filling quad)
  const vsSource = `
    attribute vec2 position;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  // Fragment Shader source (Fractal Swirling Crimson & Gold Fire Noise)
  const fsSource = `
    precision mediump float;
    
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform vec2 u_mouse;

    // Hash function for pseudo-random nodes
    float hash(vec2 p) {
      p = fract(p * vec2(127.1, 311.7));
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    // 2D smooth noise interpolation
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
        u.y
      );
    }

    // Fractal Brownian Motion (fBm) combining noise octaves
    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      vec2 shift = vec2(100.0);
      // Rotation matrix to reduce axial bias in textures
      mat2 rot = mat2(0.87758, 0.47942, -0.47942, 0.87758);
      for (int i = 0; i < 4; ++i) {
        v += a * noise(p);
        p = rot * p * 2.0 + shift;
        a *= 0.5;
      }
      return v;
    }

    void main() {
      // 1. Center normalize coordinates: (-1 to 1 bounds on shorter axis)
      vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
      
      float r = length(uv);
      float theta = atan(uv.y, uv.x);

      // 2. Mouse coordinates interaction
      vec2 mouseUV = (u_mouse.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
      float distToMouse = length(uv - mouseUV);
      float mouseInfluence = smoothstep(0.4, 0.0, distToMouse);

      // 3. Swirling Coordinate distortion (Polar coordinate spiral winding)
      float swirlFactor = 1.6 / (r + 0.15);
      float distorted_theta = theta + swirlFactor * 0.35 - u_time * 0.4;
      
      // Inject interactive mouse coordinates turbulence
      distorted_theta += sin(u_time * 2.5 + distorted_theta) * mouseInfluence * 0.06;

      vec2 swirledUV = vec2(cos(distorted_theta), sin(distorted_theta)) * r;

      // 4. Generate dynamic noise plasma layers
      // Layer A: Rapid spiral lines
      float noiseLayerA = fbm(swirledUV * 4.2 + vec2(r * 1.5 - u_time * 0.7));
      // Layer B: Subtle turbulent plumes
      float noiseLayerB = fbm(swirledUV * 7.8 - u_time * 1.1);
      
      float totalNoise = mix(noiseLayerA, noiseLayerB, 0.45);

      // 5. Apply Radial Falloffs
      // Soft transition fade out at screen edges
      float edgeFadeOut = smoothstep(1.3, 0.55, r);
      
      // Compute final flame vortex density
      float density = totalNoise * edgeFadeOut * 1.25;

      // 6. Color Mapping (Pearl Light Theme: Pearl White to Swirling Liquid & Antique Gold)
      // Ambient pearl light backdrop
      vec3 finalColor = vec3(0.965, 0.957, 0.933); 

      // Soft Champagne Gold Swirls
      vec3 goldGlow = vec3(0.93, 0.84, 0.65);
      finalColor = mix(finalColor, goldGlow, smoothstep(0.08, 0.45, density));

      // Antique Golden Swirls
      vec3 antiqueGold = vec3(0.85, 0.72, 0.45);
      finalColor = mix(finalColor, antiqueGold, smoothstep(0.38, 0.75, density));

      // Soft Crimson Swirl Highlight (Rose Gold feel)
      vec3 softCrimson = vec3(0.78, 0.45, 0.48);
      finalColor = mix(finalColor, softCrimson, smoothstep(0.58, 0.95, density));

      // Fade to pure pearl white in the center eye zone for absolute text readability
      float centerContrastEye = smoothstep(0.12, 0.42, r);
      finalColor = mix(vec3(0.965, 0.957, 0.933), finalColor, centerContrastEye);

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;

  // Shader Compiler Helper
  function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("Shader compilation failed: ", gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  // Compile Shaders
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
  if (!vertexShader || !fragmentShader) return;

  // Link Program
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program linking failed: ", gl.getProgramInfoLog(program));
    return;
  }
  gl.useProgram(program);

  // Setup Screen Quad Vertex buffer
  const positionAttributeLocation = gl.getAttribLocation(program, "position");
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  const positions = [
    -1, -1,
     1, -1,
    -1,  1,
    -1,  1,
     1, -1,
     1,  1,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

  // Get Uniform locations
  const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
  const timeUniformLocation = gl.getUniformLocation(program, "u_time");
  const mouseUniformLocation = gl.getUniformLocation(program, "u_mouse");

  // Interaction vectors
  let mouseX = canvas.width / 2;
  let mouseY = canvas.height / 2;
  let targetMouseX = mouseX;
  let targetMouseY = mouseY;

  // Capture mouse move coords relative to canvas
  window.addEventListener('mousemove', (e) => {
    targetMouseX = e.clientX;
    targetMouseY = canvas.height - e.clientY; // Flip WebGL Y coordinate
  });

  // Touch controls support
  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      targetMouseX = e.touches[0].clientX;
      targetMouseY = canvas.height - e.touches[0].clientY;
    }
  }, { passive: true });

  // Handle Resize responsive
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Animation Loop
  function render(time) {
    const elapsedSeconds = time * 0.001;

    // Interpolate mouse coordinates for fluid dampening
    mouseX += (targetMouseX - mouseX) * 0.08;
    mouseY += (targetMouseY - mouseY) * 0.08;

    // Upload Uniforms
    gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
    gl.uniform1f(timeUniformLocation, elapsedSeconds);
    gl.uniform2f(mouseUniformLocation, mouseX, mouseY);

    // Draw full-screen quad
    gl.clearColor(0.965, 0.957, 0.933, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

/* ==========================================================================
   3. Interactive Showcase Hotspot Controller
   ========================================================================== */
function initInteractiveShowcase() {
  const btnStart = document.getElementById('btn-start-experience');
  const btnExplore = document.getElementById('btn-explore-catalogue');
  const btnClose = document.getElementById('btn-close-experience');
  
  const heroContent = document.getElementById('portal-hero-content');
  const overlay = document.getElementById('immersive-experience-overlay');
  
  const hotspots = document.querySelectorAll('.hotspot-trigger');
  const detailCards = document.querySelectorAll('.detail-card');
  const bangleImg = document.querySelector('.bangle-showcase-img');

  if (!overlay || !hotspots || !detailCards) return;

  // Zoom definitions depending on which jewelry hotspot is targeted
  // 1. Core Kada Collection Database
  const kadaData = {
    lakshmi: {
      eyebrow: "— SIGNATURE KADA MASTERPIECE",
      title: "Gaja Lakshmi Kada",
      image: "/images/collections/C.jpg",
      zooms: {
        deity: { scale: 1.35, x: 2, y: 2 },
        gajra: { scale: 1.45, x: 5, y: -45 },
        kundan: { scale: 1.4, x: 10, y: 50 },
        default: { scale: 1.0, x: 0, y: 0 }
      },
      hotspots: {
        1: { left: "48%", top: "48%", label: "Inspect Deity Filigree", target: "deity" },
        2: { left: "45%", top: "18%", label: "Inspect Gajra Beading", target: "gajra" },
        3: { left: "54%", top: "76%", label: "Inspect Kundan Gem Setting", target: "kundan" }
      },
      cards: {
        default: {
          title: "Divine Legacy in 22K Gold",
          desc: "Handcrafted for brides carrying ancient royal heritage, this Kada is forged by master goldsmiths over 120 hours. It depicts sacred motifs surrounded by intricate filigree and floral embellishments that embody fertility and wealth.",
          purity: "22K BIS Hallmarked",
          craft: "Nakashi Repousse"
        },
        deity: {
          title: "Goddess Lakshmi Nakashi",
          desc: "The central panel features a detailed repousse carving of Goddess Lakshmi seated on a lotus (Nakashi craft). Hand-chiselled from pure gold sheet, the sculpture captures perfect anatomical symmetry and divine posture, offering blessings of abundance.",
          purity: "Nakashi Hand-Chiselling",
          craft: "Gaja Lakshmi"
        },
        gajra: {
          title: "Gajra Beaded Borders",
          desc: "The outer borders are reinforced with micro-soldered gold beads forming a traditional Gajra pattern. Every individual gold sphere is fused to the main rim using historical granular techniques, ensuring a rich texture that captures ambient light.",
          purity: "Gajra Granules",
          craft: "Dual Rim Alignment"
        },
        kundan: {
          title: "Kundan & Polki Gem Inlay",
          desc: "Sparsely decorated with select uncut gemstones bedded in premium refined clay (Kundan). The settings protect the antique polki diamonds and rubies, giving them their historical royal crimson glow, complementing the pure gold luster.",
          purity: "Kundan Rubies & Polki",
          craft: "Pure Gold Foil Inlay"
        }
      }
    },
    peacock: {
      eyebrow: "— HANDCRAFTED ROYAL ARCHIVE",
      title: "Mayura Peacock Kada",
      image: "/images/collections/peacock_kada.png",
      zooms: {
        deity: { scale: 1.45, x: -35, y: -5 },
        gajra: { scale: 1.4, x: -5, y: -45 },
        kundan: { scale: 1.4, x: 42, y: 35 },
        default: { scale: 1.0, x: 0, y: 0 }
      },
      hotspots: {
        1: { left: "22%", top: "48%", label: "Inspect Peacock Terminals", target: "deity" },
        2: { left: "48%", top: "18%", label: "Inspect Ruby Eye settings", target: "gajra" },
        3: { left: "78%", top: "66%", label: "Inspect Pavé Feathers", target: "kundan" }
      },
      cards: {
        default: {
          title: "Mayura Majesty in Pure Gold",
          desc: "An ornate double-headed temple kada representing symmetry and sacred beauty. Forged in heavy 22K gold, this masterwork captures two facing peacocks (Mayura) sharing a crimson ruby medallion, representing eternal fidelity and grace.",
          purity: "22K BIS Hallmarked",
          craft: "Meenakari & Enamelling"
        },
        deity: {
          title: "Intricate Peacock Carving",
          desc: "The dual peacock terminals are detailed using historical chasing tools. Every tiny neck feather is micro-engraved by hand, leading to the majestic bills holding a central gold bead, demonstrating the highest standard of Royal jewelry.",
          purity: "Royal Chasing Craft",
          craft: "Mayura Terminals"
        },
        gajra: {
          title: "Cabochon Ruby Settings",
          desc: "Studded with selected glowing cabochon rubies reflecting deep crimson hues. Hand-set within traditional collets, the stones mimic the natural eyes and crest of the sacred peacock, offering a brilliant, fire-like contrast to the gold backdrop.",
          purity: "Natural Rubies",
          craft: "Collet Hand-Setting"
        },
        kundan: {
          title: "Pavé Polki Diamond Feathers",
          desc: "The bracelet band curves out into beautiful, stylized wing feathers layered with pavé-set polki diamonds. The stones are secured in secure gold settings, capturing and magnifying light with ancient, vintage luster.",
          purity: "Pavé Uncut Polki",
          craft: "Gold Foil Wing Setting"
        }
      }
    },
    lion: {
      eyebrow: "— VALOR & EMPIRE COLLECTION",
      title: "Simha Vyala Kada",
      image: "/images/collections/lion_kada.png",
      zooms: {
        deity: { scale: 1.35, x: 0, y: -5 },
        gajra: { scale: 1.4, x: 45, y: -38 },
        kundan: { scale: 1.45, x: -35, y: 40 },
        default: { scale: 1.0, x: 0, y: 0 }
      },
      hotspots: {
        1: { left: "50%", top: "48%", label: "Inspect Lion Terminals", target: "deity" },
        2: { left: "78%", top: "22%", label: "Inspect Chiselled Mane", target: "gajra" },
        3: { left: "24%", top: "72%", label: "Inspect Kundan Band", target: "kundan" }
      },
      cards: {
        default: {
          title: "Imperial Simha Kada Heritage",
          desc: "A bold statement of royal power, this Kada features two facing lion head terminals (Simha). Hand-forged by hereditary goldsmiths, it honors ancient Indian armor ornaments worn by kings as a symbol of courage and strength.",
          purity: "22K BIS Hallmarked",
          craft: "Nakashi Repousse"
        },
        deity: {
          title: "Lion Head Terminals (Simha)",
          desc: "The double lion head terminals display high anatomical detail. Chiselled out of solid gold plates, the fierce expressions are adorned with glowing ruby teeth and emerald crowns, invoking historical royal protection.",
          purity: "Repousse Chiselling",
          craft: "Simha Vyala Heads"
        },
        gajra: {
          title: "Filigree Mane Sculpting",
          desc: "The lion's mane cascades into detailed concentric waves, meticulously constructed using micro-twisted gold wire (filigree). Every scroll is soldered using precise flame torches, creating a glorious three-dimensional relief texture.",
          purity: "Filigree Filaments",
          craft: "Gold Wire Welding"
        },
        kundan: {
          title: "Kundan Diamond Band Inlay",
          desc: "The main body of the Kada is decorated with traditional Kundan settings. Uncut polki diamonds and deep emeralds are set inside flat gold foils, forming a geometric checkerboard design that curves around the wrist.",
          purity: "Polki & Pure Emeralds",
          craft: "Flat Foil Kundan Inlay"
        }
      }
    },
    floral: {
      eyebrow: "— CELESTIAL NATURE ARCHIVE",
      title: "Devi Floral Kada",
      image: "/images/gallery/gold-bangles.jpg",
      zooms: {
        deity: { scale: 1.4, x: -5, y: -2 },
        gajra: { scale: 1.45, x: 10, y: -45 },
        kundan: { scale: 1.4, x: -10, y: 48 },
        default: { scale: 1.0, x: 0, y: 0 }
      },
      hotspots: {
        1: { left: "48%", top: "50%", label: "Inspect Floral Vines", target: "deity" },
        2: { left: "55%", top: "18%", label: "Inspect Gold Strands", target: "gajra" },
        3: { left: "45%", top: "78%", label: "Inspect Goldsmith Polish", target: "kundan" }
      },
      cards: {
        default: {
          title: "Traditional Devi Bangle Ensemble",
          desc: "A classic floral gold kada decorated with traditional creepers and flower buds (Lata motifs). Hand-assembled, it layers three concentric rows of micro-beaded wire and mirror-polished gold plates, bringing old-world Indian wedding grace to life.",
          purity: "22K BIS Hallmarked",
          craft: "Filigree & Granules"
        },
        deity: {
          title: "Hand-Engraved Flower Vines (Lata)",
          desc: "The central core is detailed with delicate hand-engravings depicting scrolling vines and blooming jasmine flowers. The recesses are finished with deep antique patina to emphasize the high-dimensional reliefs.",
          purity: "Hand-Chasing Chisel",
          craft: "Lata Creeper motifs"
        },
        gajra: {
          title: "Twisted Gold Filigree Strands",
          desc: "Flanking the central vine are dual lines of tightly twisted gold wire. Each line is formed by twisting two micro-fine gold threads together, creating a rope-like border that mirrors historical archaeological jewelry.",
          purity: "Rope Filigree",
          craft: "Double Thread Twist"
        },
        kundan: {
          title: "Mirror Goldsmith Polish",
          desc: "The gold plates are finished using specialized jewelry compounds and velvet wheel polishing. The process yields a soft, warm luster that reflects ambient skin tones and candle light, producing a romantic glowing aura.",
          purity: "Velvet Wheel Polish",
          craft: "High-Luster Glossing"
        }
      }
    }
  };

  let activeKada = 'lakshmi';
  let zoomConfig = { ...kadaData.lakshmi.zooms };

  // Launch immersive screen
  function openExperience() {
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    if (heroContent) heroContent.style.opacity = '0';
    switchKadaDesign('lakshmi');
  }

  // Close immersive screen
  function closeExperience() {
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
    if (heroContent) heroContent.style.opacity = '1';
    resetShowcase();
  }

  // Reset detail showcase to general overview
  function resetShowcase() {
    hotspots.forEach(h => h.classList.remove('active'));
    detailCards.forEach(c => c.classList.remove('active'));
    
    const defaultCard = document.getElementById('card-default');
    if (defaultCard) defaultCard.classList.add('active');
    
    applyZoom('default');
  }

  // Apply smooth camera pan/zoom on bangle image
  function applyZoom(target) {
    if (!bangleImg) return;
    const config = zoomConfig[target] || zoomConfig.default;
    
    if (target === 'default') {
      bangleImg.style.transform = `scale(${config.scale}) translate(0, 0)`;
    } else {
      bangleImg.style.transform = `scale(${config.scale}) translate(${-config.x}%, ${-config.y}%)`;
    }
  }

  // Switch between Kada designs dynamically with animation
  function switchKadaDesign(kadaKey) {
    const data = kadaData[kadaKey];
    if (!data) return;

    activeKada = kadaKey;
    zoomConfig = { ...data.zooms };

    // A. Trigger Image Swap Animation
    bangleImg.classList.add('swapping');
    bangleImg.src = data.image;
    setTimeout(() => bangleImg.classList.remove('swapping'), 650);

    // B. Update Panel Headers
    const eyebrowEl = document.getElementById('panel-eyebrow');
    const titleEl = document.getElementById('panel-title');
    if (eyebrowEl) eyebrowEl.innerText = data.eyebrow;
    if (titleEl) titleEl.innerText = data.title;

    // C. Update Hotspots Coordinates & Metadata
    const hs1 = document.getElementById('hs-1');
    const hs2 = document.getElementById('hs-2');
    const hs3 = document.getElementById('hs-3');

    if (hs1 && hs2 && hs3) {
      hs1.style.left = data.hotspots[1].left;
      hs1.style.top = data.hotspots[1].top;
      hs1.setAttribute('data-hotspot', data.hotspots[1].target);
      hs1.setAttribute('aria-label', data.hotspots[1].label);

      hs2.style.left = data.hotspots[2].left;
      hs2.style.top = data.hotspots[2].top;
      hs2.setAttribute('data-hotspot', data.hotspots[2].target);
      hs2.setAttribute('aria-label', data.hotspots[2].label);

      hs3.style.left = data.hotspots[3].left;
      hs3.style.top = data.hotspots[3].top;
      hs3.setAttribute('data-hotspot', data.hotspots[3].target);
      hs3.setAttribute('aria-label', data.hotspots[3].label);
    }

    // D. Update Detail Cards Text contents with slide up animation
    const cardKeys = ['default', 'deity', 'gajra', 'kundan'];
    cardKeys.forEach(key => {
      const cardEl = document.getElementById(`card-${key}`);
      const cardData = data.cards[key];
      if (cardEl && cardData) {
        const title = cardEl.querySelector('.card-title');
        const desc = cardEl.querySelector('.card-desc');
        const metaVals = cardEl.querySelectorAll('.meta-val');

        if (title) title.innerText = cardData.title;
        if (desc) desc.innerText = cardData.desc;
        if (metaVals && metaVals.length >= 2) {
          metaVals[0].innerText = cardData.purity;
          metaVals[1].innerText = cardData.craft;
        }

        // Trigger slide-up animation
        cardEl.classList.add('sliding');
        setTimeout(() => cardEl.classList.remove('sliding'), 650);
      }
    });

    // Reset layout zoom and active elements to default Kada general view
    resetShowcase();
  }

  // Register Buttons
  if (btnStart) btnStart.addEventListener('click', openExperience);
  if (btnExplore) btnExplore.addEventListener('click', openExperience);
  if (btnClose) btnClose.addEventListener('click', closeExperience);

  // Register Bangle Thumbnails Selectors
  const thumbBtns = document.querySelectorAll('.kada-thumb-btn');
  thumbBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetKada = btn.getAttribute('data-kada');
      if (targetKada === activeKada) return;

      thumbBtns.forEach(t => t.classList.remove('active'));
      btn.classList.add('active');

      switchKadaDesign(targetKada);
    });
  });

  // Register Hotspots
  hotspots.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const targetId = trigger.getAttribute('data-hotspot');
      const targetCard = document.getElementById(`card-${targetId}`);
      
      // If already active, toggle back to default
      if (trigger.classList.contains('active')) {
        resetShowcase();
        return;
      }

      // Deactivate all hotspots and cards
      hotspots.forEach(h => h.classList.remove('active'));
      detailCards.forEach(c => c.classList.remove('active'));

      // Activate selected hotspot and card
      trigger.classList.add('active');
      if (targetCard) {
        targetCard.classList.add('active');
        targetCard.classList.add('sliding');
        setTimeout(() => targetCard.classList.remove('sliding'), 650);
      }

      // Zoom onto target component
      applyZoom(targetId);
    });
  });

  // Inertial 3D tilt movement on image card frame (subtle luxury detail)
  const imageFrame = document.querySelector('.asset-frame-royal');
  if (imageFrame) {
    imageFrame.addEventListener('mousemove', (e) => {
      const bounds = imageFrame.getBoundingClientRect();
      const mouseX = e.clientX - bounds.left;
      const mouseY = e.clientY - bounds.top;
      
      const percentX = (mouseX / bounds.width) - 0.5;
      const percentY = (mouseY / bounds.height) - 0.5;

      const tiltX = percentY * 12; // tilt degrees bounds
      const tiltY = -percentX * 12;

      const wrapper = imageFrame.querySelector('.asset-interactive-wrapper');
      if (wrapper) {
        wrapper.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`;
        wrapper.style.transition = 'transform 0.1s ease-out';
      }
    });

    imageFrame.addEventListener('mouseleave', () => {
      const wrapper = imageFrame.querySelector('.asset-interactive-wrapper');
      if (wrapper) {
        wrapper.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
        wrapper.style.transition = 'transform 0.6s ease-out';
      }
    });
  }

  // 3D holographic tilt on the floating gold artifact in the vortex center
  const floatingArtifact = document.getElementById('portal-hologram-artifact');
  if (floatingArtifact) {
    const frame = floatingArtifact.querySelector('.portal-artifact-frame');
    window.addEventListener('mousemove', (e) => {
      // Calculate normalized vector relative to center of viewport
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx; // bounds -1 to 1
      const dy = (e.clientY - cy) / cy; // bounds -1 to 1

      const rx = dy * -15; // rotate X (up/down)
      const ry = dx * 15;  // rotate Y (left/right)

      if (frame) {
        frame.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`;
        frame.style.transition = 'transform 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)';
      }
    });
    
    // Smooth reset when mouse leaves window
    document.addEventListener('mouseleave', () => {
      if (frame) {
        frame.style.transform = `perspective(800px) rotateX(0deg) rotateY(0deg)`;
        frame.style.transition = 'transform 1s ease-out';
      }
    });
  }

  // Astrological Vedic Aura Chamber Integration
  const rashiData = {
    mesha: {
      title: "Mesha (Aries) Cosmic Harmony",
      desc: "Ruled by the vitalizing Sun, the cosmic fire of Mesha aligns seamlessly with the **Gaja Lakshmi Ruby Kada**. Embedded with premium cabochon rubies, it activates the Manipura (Solar Plexus) chakra, radiating divine protection, vitalizing energy, and imperial prosperity.",
      chakra: "Solar Plexus (Manipura)",
      aura: "Vitality & Abundance",
      compatibility: "98% ASTRAL ALIGNMENT",
      image: "/images/collections/C.jpg",
      auraClass: "ruby-aura",
      objectPosition: "center 90%",
      code: "MESHA-LAK-RUB"
    },
    vrishabha: {
      title: "Vrishabha (Taurus) Cosmic Harmony",
      desc: "Ruled by Venus, the goddess of luxury and aesthetic grace, Vrishabha harmonizes with the brilliant **Simha Vyala Diamond Kada**. Studded with uncut polki diamonds, it aligns the Heart (Anahata) chakra to amplify creative brilliance and absolute royal elegance.",
      chakra: "Heart (Anahata) Chakra",
      aura: "Love & Artistic Brilliance",
      compatibility: "95% ASTRAL ALIGNMENT",
      image: "/images/collections/diamond_kada.png",
      auraClass: "diamond-aura",
      objectPosition: "center",
      code: "VRISH-LIO-DIA"
    },
    mithuna: {
      title: "Mithuna (Gemini) Cosmic Harmony",
      desc: "Ruled by Mercury, the planet of deep intellect and cosmic flow, Mithuna aligns with the **Mayura Peacock Emerald Kada**. Studded with glowing emeralds, it activates the Throat (Vishuddha) chakra to channel communication, supreme wisdom, and inner truth.",
      chakra: "Throat (Vishuddha) Chakra",
      aura: "Intellect & Expression",
      compatibility: "94% ASTRAL ALIGNMENT",
      image: "/images/collections/emerald_kada.png",
      auraClass: "emerald-aura",
      objectPosition: "center",
      code: "MITH-PEA-EME"
    },
    karka: {
      title: "Karka (Cancer) Cosmic Harmony",
      desc: "Ruled by the tranquil Moon, the watery depths of Karka seek balance inside the traditional **Devi Floral Pearl Kada**. The soft pearl grains activate the Throat and Crown (Sahasrara) chakras, invoking emotional harmony, sacred peace, and intuitive clarity.",
      chakra: "Crown (Sahasrara) Chakra",
      aura: "Intuition & Inner Peace",
      compatibility: "97% ASTRAL ALIGNMENT",
      image: "/images/gallery/gold-bangles.jpg",
      auraClass: "pearl-aura",
      objectPosition: "bottom",
      code: "KARK-DEV-PEA"
    }
  };

  const rashiBtns = document.querySelectorAll('.rashi-btn');
  const astroTitle = document.getElementById('astro-title');
  const astroDesc = document.getElementById('astro-desc');
  const astroChakra = document.getElementById('astro-chakra');
  const astroAura = document.getElementById('astro-aura');
  const astroBadge = document.getElementById('astro-badge-txt');
  const auraBangleImg = document.getElementById('aura-bangle-img');
  const auraGlow = document.getElementById('aura-glow');
  const astroInquiryBtn = document.getElementById('astro-inquiry-btn');

  rashiBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const rashiKey = btn.getAttribute('data-rashi');
      const data = rashiData[rashiKey];
      if (!data) return;

      rashiBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (auraBangleImg) {
        auraBangleImg.style.objectPosition = data.objectPosition || "center";
        auraBangleImg.classList.add('swapping');
        auraBangleImg.src = data.image;
        setTimeout(() => auraBangleImg.classList.remove('swapping'), 650);
      }

      if (astroTitle) astroTitle.innerText = data.title;
      if (astroDesc) astroDesc.innerText = data.desc;
      if (astroChakra) astroChakra.innerText = data.chakra;
      if (astroAura) astroAura.innerText = data.aura;
      if (astroBadge) astroBadge.innerText = data.compatibility;

      if (auraGlow) {
        auraGlow.className = `aura-glow-effect ${data.auraClass}`;
      }

      if (astroInquiryBtn) {
        astroInquiryBtn.href = `/contact?inquiry=temple-bangles&astro=true&code=${data.code}`;
      }
    });
  });
}

/* ==========================================================================
   4. Standalone Custom Kada Studio Controller (Main Page)
   ========================================================================== */
function initCustomStudio() {
  const motifBtns = document.querySelectorAll('.option-btn[data-option="motif"]');
  const gemBtns = document.querySelectorAll('.option-btn[data-option="gem"]');
  const finishBtns = document.querySelectorAll('.option-btn[data-option="finish"]');
  const sizeSlider = document.getElementById('slider-size');
  const sizeLabel = document.getElementById('lbl-live-size');
  const weightVal = document.getElementById('studio-live-weight');
  const confCodeVal = document.getElementById('spec-conf-code');
  const studioImg = document.getElementById('studio-kada-img');
  const requestBtn = document.getElementById('btn-request-bespoke');
  const hallmarkStamp = document.querySelector('.hallmark-stamp');

  if (!motifBtns.length) return;

  let activeMotif = 'lakshmi';
  let activeGem = 'rubies';
  let activeFinish = 'antique';
  let activeSize = 2.4;
  let currentEstWeight = 50.0;
  let animId = null;

  const studioWeights = {
    lakshmi: { base: 50.0, code: 'LAK', img: '/images/collections/C.jpg', objectPosition: "center 90%" },
    peacock: { base: 56.5, code: 'PEA', img: '/images/collections/peacock_kada.png', objectPosition: "center" },
    lion: { base: 62.0, code: 'LIO', img: '/images/collections/lion_kada.png', objectPosition: "center" }
  };

  const studioGems = {
    rubies: { offset: 0.0, code: 'RUB' },
    polki: { offset: 2.5, code: 'POL' },
    pearls: { offset: -1.2, code: 'PEA' }
  };

  const studioFinishes = {
    antique: { code: 'ANT' },
    polish: { code: 'POL' },
    rose: { code: 'ROS' }
  };

  const studioSizes = {
    '2.2': 0.92,
    '2.4': 1.00,
    '2.6': 1.08,
    '2.8': 1.15
  };

  function updateStudio() {
    const motif = studioWeights[activeMotif];
    const gem = studioGems[activeGem];
    const finish = studioFinishes[activeFinish];
    const scale = studioSizes[String(activeSize)] || 1.0;

    const targetWeight = (motif.base + gem.offset) * scale;

    // Weight count-up animation
    if (weightVal) {
      if (animId) cancelAnimationFrame(animId);
      const startW = currentEstWeight;
      const startTime = performance.now();
      const duration = 400;

      function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1.0);
        const ease = 1 - Math.pow(1 - progress, 3);
        currentEstWeight = startW + (targetWeight - startW) * ease;
        weightVal.innerText = currentEstWeight.toFixed(1);

        if (progress < 1.0) {
          animId = requestAnimationFrame(step);
        } else {
          currentEstWeight = targetWeight;
          weightVal.innerText = targetWeight.toFixed(1);
        }
      }
      animId = requestAnimationFrame(step);
    }

    // Config code
    const code = `${motif.code}-${gem.code}-${finish.code}-${activeSize.toFixed(1)}`;
    if (confCodeVal) confCodeVal.innerText = code;

    // Update CTA button link
    if (requestBtn) {
      requestBtn.href = `/contact?inquiry=custom-kada&custom=true&code=${code}`;
    }

    // Spin Hallmark stamp
    if (hallmarkStamp) {
      const angle = (activeMotif.charCodeAt(0) + activeGem.charCodeAt(0) + activeFinish.charCodeAt(0) + Math.round(activeSize * 10)) % 40 - 20;
      hallmarkStamp.style.transform = `rotate(${angle}deg)`;
    }
  }

  // Register Motif select
  motifBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      activeMotif = btn.getAttribute('data-val');
      motifBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (studioImg) {
        studioImg.style.objectPosition = studioWeights[activeMotif].objectPosition || "center";
        studioImg.classList.add('swapping');
        studioImg.src = studioWeights[activeMotif].img;
        setTimeout(() => studioImg.classList.remove('swapping'), 650);
      }
      updateStudio();
    });
  });

  // Register Gems select
  gemBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      activeGem = btn.getAttribute('data-val');
      gemBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateStudio();
    });
  });

  // Register Finish select
  finishBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      activeFinish = btn.getAttribute('data-val');
      finishBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateStudio();
    });
  });

  // Register size slider
  if (sizeSlider) {
    sizeSlider.addEventListener('input', (e) => {
      activeSize = parseFloat(e.target.value);
      if (sizeLabel) sizeLabel.innerText = `Size ${activeSize.toFixed(1)}`;
      updateStudio();
    });
  }
}
