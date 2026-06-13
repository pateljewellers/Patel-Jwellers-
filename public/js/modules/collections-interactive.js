/**
 * COLLECTIONS INTERACTIVE MODULE — FULL MOTION EDITION
 * Dense gold sparkle trails, click shockwaves, 3D card tilts,
 * speed-reactive morphing spirographs, dual-axis staggered sways,
 * and rich canvas particle physics.
 *
 * Patel Jewellers Mehsanawala
 */

document.addEventListener('DOMContentLoaded', () => {
  const section = document.getElementById('collections');
  if (!section) return;

  const canvas = document.getElementById('collections-motion-canvas');
  const cards = Array.from(section.querySelectorAll('.collection-card'));

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // =====================================================
  // STATE
  // =====================================================
  let mouse = { x: 0, y: 0, prevX: 0, prevY: 0, targetX: 0, targetY: 0, speed: 0, inSection: false };
  let hoveredCardIdx = -1;
  let shockwaves = [];
  let particles = [];
  let time = 0;
  let rafId = null;
  let isSectionVisible = false;

  // =====================================================
  // CANVAS SETUP
  // =====================================================
  let ctx = null;
  const resizeCanvas = () => {
    if (!canvas) return;
    const r = section.getBoundingClientRect();
    canvas.width = r.width;
    canvas.height = r.height;
  };
  if (canvas) {
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });
  }

  // =====================================================
  // EVENTS
  // =====================================================
  if (!prefersReducedMotion) {
    section.addEventListener('mousemove', (e) => {
      const r = section.getBoundingClientRect();
      mouse.targetX = e.clientX - r.left;
      mouse.targetY = e.clientY - r.top;
      mouse.inSection = true;

      // Spawn dense gold sparkle trail
      spawnTrailParticles(mouse.targetX, mouse.targetY, mouse.speed);
    }, { passive: true });

    section.addEventListener('mouseleave', () => {
      mouse.inSection = false;
    }, { passive: true });

    section.addEventListener('click', (e) => {
      const r = section.getBoundingClientRect();
      const cx = e.clientX - r.left;
      const cy = e.clientY - r.top;
      spawnShockwave(cx, cy);
      spawnClickBurst(cx, cy, 28);
    });
  }

  cards.forEach((card, idx) => {
    card.addEventListener('mouseenter', () => { hoveredCardIdx = idx; });
    card.addEventListener('mouseleave', () => { hoveredCardIdx = -1; });
  });

  // =====================================================
  // PARTICLE SYSTEM
  // =====================================================
  class Particle {
    constructor(x, y, type = 'trail') {
      this.x = x;
      this.y = y;
      this.type = type;

      if (type === 'burst') {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5.5 + 1.5;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.size = Math.random() * 3.5 + 1;
        this.alpha = 1.0;
        this.fadeRate = Math.random() * 0.025 + 0.018;
        this.gravity = 0.06;
        this.color = Math.random() > 0.4 ? '#caa15a' : '#9b1b2a'; /* Gold or Brand Burgundy (#9b1b2a) */
      } else {
        // trail
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 1.8 + 0.5;
        this.vx = Math.cos(angle) * speed + (Math.random() - 0.5) * 1.5;
        this.vy = Math.sin(angle) * speed - Math.random() * 1.2;
        this.size = Math.random() * 2.8 + 0.5;
        this.alpha = Math.random() * 0.8 + 0.3;
        this.fadeRate = Math.random() * 0.018 + 0.006;
        this.gravity = 0.018;
        this.color = Math.random() > 0.35
          ? `rgba(202,161,90,${(Math.random() * 0.6 + 0.4).toFixed(2)})` /* Official brand gold caa15a */
          : `rgba(155,27,42,${(Math.random() * 0.4 + 0.2).toFixed(2)})`; /* Brand Burgundy */
        this.swingFreq = Math.random() * 0.04 + 0.01;
        this.swingAmp = Math.random() * 0.5 + 0.1;
        this.swingPhase = Math.random() * Math.PI * 2;
      }
    }

    update(t) {
      if (this.type === 'trail') {
        this.x += this.vx + Math.sin(t * this.swingFreq + this.swingPhase) * this.swingAmp;
        this.y += this.vy;
        this.vy += this.gravity;
      } else {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.vx *= 0.97;
      }
      this.alpha -= this.fadeRate;
    }

    draw() {
      if (!ctx) return;
      ctx.save();
      ctx.globalAlpha = Math.max(this.alpha, 0);
      ctx.shadowBlur = 6;
      ctx.shadowColor = '#caa15a'; /* Official brand gold */
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    isDead() { return this.alpha <= 0; }
  }

  function spawnTrailParticles(x, y, speed) {
    const count = Math.floor(speed * 2.5) + 3;
    for (let i = 0; i < count; i++) {
      particles.push(new Particle(
        x + (Math.random() - 0.5) * 16,
        y + (Math.random() - 0.5) * 16,
        'trail'
      ));
    }
  }

  function spawnClickBurst(x, y, count) {
    for (let i = 0; i < count; i++) {
      particles.push(new Particle(x, y, 'burst'));
    }
  }

  // =====================================================
  // SHOCKWAVE SYSTEM
  // =====================================================
  class Shockwave {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.radius = 0;
      this.maxRadius = Math.max(canvas ? canvas.width : 600, canvas ? canvas.height : 400) * 0.65;
      this.alpha = 0.8;
      this.thickness = 2.5;
      this.speed = 8;
    }

    update() {
      this.radius += this.speed;
      this.alpha = 0.8 * (1 - this.radius / this.maxRadius);
      this.thickness = 2.5 * (1 - this.radius / this.maxRadius) + 0.5;
      this.speed *= 0.98;
    }

    draw() {
      if (!ctx) return;
      ctx.save();
      ctx.globalAlpha = Math.max(this.alpha, 0);
      ctx.strokeStyle = '#caa15a'; /* Official brand gold */
      ctx.lineWidth = this.thickness;
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#caa15a';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Second inner ripple ring
      if (this.radius > 30) {
        ctx.globalAlpha = Math.max(this.alpha * 0.4, 0);
        ctx.strokeStyle = 'rgba(155,27,42,0.5)'; /* Official brand burgundy 9b1b2a */
        ctx.lineWidth = this.thickness * 0.5;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.72, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    isDead() { return this.alpha <= 0 || this.radius >= this.maxRadius; }
  }

  function spawnShockwave(x, y) {
    shockwaves.push(new Shockwave(x, y));
  }

  // =====================================================
  // BACKGROUND SPIROGRAPH SYSTEM
  // =====================================================
  const spirographHubs = [
    { xFrac: 0.12, yFrac: 0.30, R: 90, speed: 0.0007, color: 'gold' },
    { xFrac: 0.88, yFrac: 0.70, R: 120, speed: -0.0005, color: 'burgundy' },
    { xFrac: 0.50, yFrac: 0.50, R: 100, speed: 0.0006, color: 'gold' },
    { xFrac: 0.25, yFrac: 0.80, R: 70, speed: -0.0009, color: 'gold' },
    { xFrac: 0.78, yFrac: 0.22, R: 80, speed: 0.0008, color: 'burgundy' },
  ];

  const waveBands = [
    { yFrac: 0.20, amp: 22, freq: 0.012, speed: 0.007 },
    { yFrac: 0.42, amp: 16, freq: 0.018, speed: -0.005 },
    { yFrac: 0.62, amp: 28, freq: 0.010, speed: 0.009 },
    { yFrac: 0.80, amp: 12, freq: 0.022, speed: -0.006 },
  ];

  function drawSpirograph(hub, speedMultiplier, t) {
    if (!ctx || !canvas) return;
    const cx = hub.xFrac * canvas.width;
    const cy = hub.yFrac * canvas.height;
    const R = hub.R + Math.sin(t * 0.003) * 18;
    const r = R * 0.42;
    const d = R * 0.62 + Math.cos(t * 0.002) * 14;

    const baseAlpha = hub.color === 'gold' ? 0.07 : 0.05;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(t * hub.speed * speedMultiplier);
    ctx.lineWidth = 0.7;
    ctx.strokeStyle = hub.color === 'gold'
      ? `rgba(202,161,90,${baseAlpha})` /* Official brand gold caa15a */
      : `rgba(155,27,42,${baseAlpha * 1.5})`; /* Official brand burgundy 9b1b2a */

    ctx.beginPath();
    for (let theta = 0, steps = 380; theta < Math.PI * 8; theta += Math.PI * 8 / steps) {
      let px = (R - r) * Math.cos(theta) + d * Math.cos(((R - r) / r) * theta);
      let py = (R - r) * Math.sin(theta) - d * Math.sin(((R - r) / r) * theta);

      // Magnetic warp toward mouse
      if (mouse.inSection) {
        const worldX = cx + px * Math.cos(t * hub.speed) - py * Math.sin(t * hub.speed);
        const worldY = cy + px * Math.sin(t * hub.speed) + py * Math.cos(t * hub.speed);
        const dx = mouse.x - worldX;
        const dy = mouse.y - worldY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 220) {
          const pull = (220 - dist) / 220 * 22 * (mouse.speed / 10 + 1);
          const localAngle = -t * hub.speed;
          const ca = Math.cos(localAngle), sa = Math.sin(localAngle);
          const fdx = dx / dist * pull, fdy = dy / dist * pull;
          px += fdx * ca + fdy * sa;
          py += -fdx * sa + fdy * ca;
        }

        // Shockwave warp
        shockwaves.forEach(sw => {
          const wwx = cx + px, wwy = cy + py;
          const sdx = wwx - sw.x, sdy = wwy - sw.y;
          const sdist = Math.sqrt(sdx * sdx + sdy * sdy);
          const diff = Math.abs(sdist - sw.radius);
          if (diff < 45) {
            const swPush = (1 - diff / 45) * 20 * sw.alpha;
            px += (sdx / sdist) * swPush;
            py += (sdy / sdist) * swPush;
          }
        });
      }

      if (theta === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.restore();
  }

  function drawWaveBands(speedMult, t) {
    if (!ctx || !canvas) return;
    waveBands.forEach((band, bi) => {
      const y0 = band.yFrac * canvas.height;
      ctx.save();
      ctx.lineWidth = bi === 0 ? 0.9 : 0.6;
      ctx.strokeStyle = bi % 2 === 0
        ? 'rgba(202,161,90,0.08)' /* Official brand gold caa15a */
        : 'rgba(155,27,42,0.04)'; /* Official brand burgundy 9b1b2a */
      ctx.beginPath();

      const steps = 80;
      for (let i = 0; i <= steps; i++) {
        const x = (i / steps) * canvas.width;
        let y = y0 + Math.sin(i * band.freq * 7 + t * band.speed * speedMult + bi * 0.8) * band.amp;

        // Mouse warp
        if (mouse.inSection) {
          const dx = mouse.x - x, dy = mouse.y - y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            y += (dy / dist) * ((180 - dist) / 180) * 28 * (mouse.speed / 8 + 1);
          }
        }

        // Shockwave warp
        shockwaves.forEach(sw => {
          const sdx = x - sw.x, sdy = y - sw.y;
          const sdist = Math.sqrt(sdx * sdx + sdy * sdy);
          const diff = Math.abs(sdist - sw.radius);
          if (diff < 50) {
            y += (sdy / sdist) * (1 - diff / 50) * 18 * sw.alpha;
          }
        });

        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
    });
  }

  // =====================================================
  // 3D CARD TILT PER-CARD MOUSE TRACKING
  // =====================================================
  const cardStates = cards.map(() => ({
    tiltX: 0, tiltY: 0,
    targetTiltX: 0, targetTiltY: 0,
    swayX: 0, swayY: 0,
  }));

  if (!prefersReducedMotion) {
    cards.forEach((card, idx) => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const normX = ((e.clientX - r.left) / r.width - 0.5) * 2;
        const normY = ((e.clientY - r.top) / r.height - 0.5) * 2;
        cardStates[idx].targetTiltX = normY * -12; // rotateX
        cardStates[idx].targetTiltY = normX * 12; // rotateY
      }, { passive: true });

      card.addEventListener('mouseleave', () => {
        cardStates[idx].targetTiltX = 0;
        cardStates[idx].targetTiltY = 0;
      }, { passive: true });
    });
  }

  // =====================================================
  // MAIN ANIMATION LOOP
  // =====================================================
  const tick = () => {
    time++;

    // Mouse LERP + speed
    const prevX = mouse.x, prevY = mouse.y;
    mouse.x += (mouse.targetX - mouse.x) * 0.09;
    mouse.y += (mouse.targetY - mouse.y) * 0.09;
    const dx = mouse.x - prevX, dy = mouse.y - prevY;
    mouse.speed += (Math.sqrt(dx * dx + dy * dy) - mouse.speed) * 0.15;
    if (!mouse.inSection) mouse.speed *= 0.92;

    const speedMult = 1 + mouse.speed * 0.18;

    // ---- Canvas clear & draw ----
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!prefersReducedMotion) {
        // Spirographs
        spirographHubs.forEach(hub => drawSpirograph(hub, speedMult, time));
        // Wave bands
        drawWaveBands(speedMult, time);
      }

      // Shockwaves
      shockwaves = shockwaves.filter(sw => {
        sw.update();
        sw.draw();
        return !sw.isDead();
      });

      // Particles
      particles = particles.filter(p => {
        p.update(time);
        p.draw();
        return !p.isDead();
      });
    }

    // ---- Card motion ----
    if (!prefersReducedMotion) {
      cards.forEach((card, idx) => {
        const state = cardStates[idx];
        const isHov = idx === hoveredCardIdx;

        // LERP 3D tilts
        const tiltLerp = 0.1;
        state.tiltX += (state.targetTiltX - state.tiltX) * tiltLerp;
        state.tiltY += (state.targetTiltY - state.tiltY) * tiltLerp;

        if (isHov) {
          // Combined transform on hover: 3D tilt + slight lift
          card.style.transform = `translate3d(0, -10px, 0) rotateX(${state.tiltX}deg) rotateY(${state.tiltY}deg) scale(1.02)`;

          // Breathing zoom inside the image on hover
          const img = card.querySelector('.collection-card__img-wrap img');
          if (img) {
            const breathe = 1.08 + Math.sin(time * 0.038) * 0.018;
            img.style.transform = `scale(${breathe.toFixed(4)})`;
          }
        } else {
          // Clear inline transform when not hovered, allowing CSS reveal animations to run smoothly
          if (card.style.transform) {
            card.style.transform = '';
          }
          const img = card.querySelector('.collection-card__img-wrap img');
          if (img && img.style.transform) {
            img.style.transform = '';
          }
        }
      });
    }

    if (isSectionVisible) {
      rafId = requestAnimationFrame(tick);
    }
  };

  // Set up intersection observer to pause animation loop when section is offscreen
  const visibilityObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isSectionVisible = entry.isIntersecting;
      if (isSectionVisible) {
        if (!rafId) {
          rafId = requestAnimationFrame(tick);
        }
      } else {
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      }
    });
  }, { threshold: 0.01 });

  visibilityObserver.observe(section);

  window.addEventListener('beforeunload', () => {
    if (rafId) cancelAnimationFrame(rafId);
  });
});

// ==========================================================
// --- COLLECTION HERO INTERACTIVE LUXURY 3D SPOTLIGHT ENGINE ---
// ==========================================================
document.addEventListener('DOMContentLoaded', () => {
  // Prevent browser native hash scroll jump
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  const targetEl = document.getElementById('curated-luxury-categories');
  if (targetEl && (window.location.hash === '#curated-luxury-categories' || window.location.hash === '#temp-curated-luxury-categories')) {
    targetEl.id = 'temp-curated-luxury-categories';
  }

  const heroSection = document.getElementById('collection-hero');
  const heroCanvas = document.getElementById('collection-hero-canvas');
  const assetWrapper = document.getElementById('collection-interactive-3d');
  const zoomContainer = document.getElementById('collection-zoom-container');
  const thrownPage = document.getElementById('thrown-page');

  if (!heroSection) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. FLOATING CANVAS BACKGROUND SYSTEM (Luxury brand red and gold rising sparks)
  if (heroCanvas) {
    const hctx = heroCanvas.getContext('2d');
    let sparkList = [];
    let heroShockwaves = [];
    let heroParticles = [];
    let hWidth = (heroCanvas.width = heroSection.offsetWidth);
    let hHeight = (heroCanvas.height = heroSection.offsetHeight);
    let hMouse = { x: null, y: null, active: false };

    const resizeHeroCanvas = () => {
      if (!heroCanvas || !heroSection) return;
      hWidth = heroCanvas.width = heroSection.offsetWidth;
      hHeight = heroCanvas.height = heroSection.offsetHeight;
      initHeroSparks();
    };

    const hResizeObserver = new ResizeObserver((entries) => {
      resizeHeroCanvas();
    });
    hResizeObserver.observe(heroSection);

    class LuxuryHeroSpark {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * hWidth;
        this.y = Math.random() * hHeight + hHeight; // Spawn below bottom
        this.size = Math.random() * 3.5 + 1.0;
        this.speedY = -(Math.random() * 0.6 + 0.15); // Rising slowly
        this.speedX = Math.random() * 0.28 - 0.14;
        this.opacity = Math.random() * 0.5 + 0.25;
        this.angle = Math.random() * Math.PI * 2;
        this.waveSpeed = Math.random() * 0.01 + 0.002;
        this.waveAmp = Math.random() * 0.8;
        // Adapted colors for light theme: Luxury Burgundy (#9b1b2a) or Gold (#caa15a)
        this.color = Math.random() > 0.55 ? 'rgba(202, 161, 90,' : 'rgba(155, 27, 42,';
      }
      update() {
        this.y += this.speedY;
        this.angle += this.waveSpeed;
        this.x += this.speedX + Math.sin(this.angle) * this.waveAmp * 0.1;

        if (hMouse.active && hMouse.x !== null) {
          const dx = hMouse.x - this.x;
          const dy = hMouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            const force = (180 - dist) / 180;
            this.x += (dx / dist) * force * 0.25;
            this.y += (dy / dist) * force * 0.25;
          }
        }

        if (this.y < -15 || this.x < -15 || this.x > hWidth + 15) {
          this.reset();
          this.y = hHeight + 10;
        }
      }
      draw() {
        if (!hctx) return;
        hctx.beginPath();
        hctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        hctx.fillStyle = this.color + this.opacity + ')';
        hctx.fill();
      }
    }

    class HeroClickSpark {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 7 + 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.size = Math.random() * 3.5 + 1.2;
        this.alpha = 1.0;
        this.fade = Math.random() * 0.02 + 0.015;
        this.gravity = 0.08;
        this.color = Math.random() > 0.45 ? 'rgba(202, 161, 90,' : 'rgba(155, 27, 42,';
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.vx *= 0.96;
        this.vy *= 0.96;
        this.alpha -= this.fade;
      }
      draw() {
        if (!hctx) return;
        hctx.save();
        hctx.globalAlpha = Math.max(this.alpha, 0);
        hctx.beginPath();
        hctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        hctx.fillStyle = this.color + this.alpha + ')';
        hctx.shadowBlur = 8;
        hctx.shadowColor = '#caa15a';
        hctx.fill();
        hctx.restore();
      }
      isDead() {
        return this.alpha <= 0;
      }
    }

    class HeroShockwave {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.maxRadius = Math.max(hWidth, hHeight) * 1.5;
        this.alpha = 0.9;
        this.thickness = 3;
        this.speed = 18;
      }
      update() {
        this.radius += this.speed;
        this.alpha -= 0.015; // Fade out linearly per frame
        this.thickness = 3 * Math.max(1 - this.radius / this.maxRadius, 0) + 0.5;
        this.speed *= 0.97;
      }
      draw() {
        if (!hctx) return;
        hctx.save();
        hctx.globalAlpha = Math.max(this.alpha, 0);
        hctx.strokeStyle = 'rgba(202, 161, 90, ' + Math.max(this.alpha, 0) + ')';
        hctx.lineWidth = this.thickness;
        hctx.shadowBlur = 15;
        hctx.shadowColor = '#caa15a';
        hctx.beginPath();
        hctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        hctx.stroke();
        hctx.restore();
      }
      isDead() {
        return this.alpha <= 0;
      }
    }

    window.triggerHeroClickPortal = (clickX, clickY) => {
      heroShockwaves.push(new HeroShockwave(clickX, clickY));
      for (let i = 0; i < 70; i++) {
        heroParticles.push(new HeroClickSpark(clickX, clickY));
      }
    };

    window.clearHeroClickPortalEffects = () => {
      heroShockwaves = [];
      heroParticles = [];
    };

    function initHeroSparks() {
      sparkList = [];
      const sparkCount = Math.min(Math.floor(hWidth / 45), 35);
      for (let i = 0; i < sparkCount; i++) {
        const p = new LuxuryHeroSpark();
        p.y = Math.random() * hHeight; // Stagger initial heights
        sparkList.push(p);
      }
    }

    let heroAnimId;
    let isHeroCanvasActive = true;
    window.setHeroCanvasActive = (active) => {
      if (active === isHeroCanvasActive) return;
      isHeroCanvasActive = active;
      if (active) {
        animateHeroCanvas();
      }
    };

    function animateHeroCanvas() {
      if (!isHeroCanvasActive) return;
      if (!heroCanvas || !hctx) return;
      hctx.clearRect(0, 0, hWidth, hHeight);

      // Subtle mouse spotlight radial aura (Burgundy-to-Gold soft gradients for light background)
      if (hMouse.active && hMouse.x !== null) {
        const aura = hctx.createRadialGradient(hMouse.x, hMouse.y, 5, hMouse.x, hMouse.y, 180);
        aura.addColorStop(0, 'rgba(155, 27, 42, 0.04)');
        aura.addColorStop(0.5, 'rgba(202, 161, 90, 0.02)');
        aura.addColorStop(1, 'rgba(237, 236, 236, 0)');
        hctx.fillStyle = aura;
        hctx.fillRect(0, 0, hWidth, hHeight);
      }

      sparkList.forEach((p) => {
        p.update();
        p.draw();
      });

      heroParticles = heroParticles.filter((p) => {
        p.update();
        p.draw();
        return !p.isDead();
      });

      heroShockwaves = heroShockwaves.filter((sw) => {
        sw.update();
        sw.draw();
        return !sw.isDead();
      });

      heroAnimId = requestAnimationFrame(animateHeroCanvas);
    }

    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      hMouse.x = e.clientX - rect.left;
      hMouse.y = e.clientY - rect.top;
      hMouse.active = true;
    }, { passive: true });

    heroSection.addEventListener('mouseleave', () => {
      hMouse.active = false;
    }, { passive: true });

    initHeroSparks();
    animateHeroCanvas();
  }

  // 2. 3D INTERACTIVE TILT FOR CENTERED IMAGE (Wrapper level)
  // Disabled in gallery mode — gallery portal frame is a still image, not a 3D asset.
  const isGalleryMode = assetWrapper && assetWrapper.classList.contains('gallery-frame--portal');

  if (assetWrapper && !isGalleryMode) {
    const handleHeroMouseMove = (e) => {
      const rect = heroSection.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const xc = (x - rect.width / 2) / (rect.width / 2);
      const yc = (y - rect.height / 2) / (rect.height / 2);

      // Tilt angles (range: -10 to 10 deg)
      const rotX = (-yc * 10.0).toFixed(2);
      const rotY = (xc * 10.0).toFixed(2);

      // Adjust image 3D transform dynamically
      assetWrapper.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02, 1.02, 1.02)`;

      // Shift floor shadow organically based on tilt direction
      const shadow = heroSection.querySelector('.asset-3d-shadow');
      if (shadow) {
        shadow.style.transform = `translate3d(${-xc * 15}px, 0, 0) scale(${1 - Math.abs(yc) * 0.08})`;
      }
    };

    const handleHeroMouseLeave = () => {
      // Revert smoothly to levitating animation frame
      assetWrapper.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      assetWrapper.style.transition = 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)';

      const shadow = heroSection.querySelector('.asset-3d-shadow');
      if (shadow) {
        shadow.style.transform = 'translate3d(0, 0, 0) scale(1)';
        shadow.style.transition = 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)';
      }
    };

    const handleHeroMouseEnter = () => {
      assetWrapper.style.transition = 'none';
      const shadow = heroSection.querySelector('.asset-3d-shadow');
      if (shadow) shadow.style.transition = 'none';
    };

    heroSection.addEventListener('mousemove', handleHeroMouseMove, { passive: true });
    heroSection.addEventListener('mouseenter', handleHeroMouseEnter, { passive: true });
    heroSection.addEventListener('mouseleave', handleHeroMouseLeave, { passive: true });
  }

  // ==========================================================
  // --- 3. CURSOR-CLICK PORTAL TRANSITION ENGINE ---
  // ==========================================================
  const portalTrigger = assetWrapper;

  if (portalTrigger && thrownPage) {
    // Dynamically build custom cursor element
    const customCursor = document.createElement('div');
    customCursor.className = 'portal-custom-cursor';
    customCursor.innerHTML = '<span class="portal-custom-cursor-text">Reveal</span>';
    document.body.appendChild(customCursor);

    // Dynamically build full-screen flash veil
    const flashVeil = document.createElement('div');
    flashVeil.className = 'portal-flash-veil';
    document.body.appendChild(flashVeil);

    // Track cursor movement on body when custom cursor is active
    document.addEventListener('mousemove', (e) => {
      if (customCursor.classList.contains('active')) {
        customCursor.style.left = `${e.clientX}px`;
        customCursor.style.top = `${e.clientY}px`;
      }
    }, { passive: true });

    // Activate custom cursor and hover aura class
    portalTrigger.addEventListener('mouseenter', () => {
      document.body.classList.add('portal-hover-active');
      customCursor.classList.add('active');
    });

    portalTrigger.addEventListener('mouseleave', () => {
      document.body.classList.remove('portal-hover-active');
      customCursor.classList.remove('active');
    });

    // Set initial GSAP states for lookbook components
    const innerCards = thrownPage.querySelectorAll('.editorial-panel');
    const innerContainer = thrownPage.querySelector('.thrown-page-inner');

    gsap.set(thrownPage, {
      y: '100vh',
      opacity: 0,
      display: 'block',
      pointerEvents: 'none'
    });

    if (innerCards.length > 0) {
      gsap.set(innerCards, {
        y: 45,
        opacity: 0
      });
    }

    if (innerContainer) {
      gsap.set(innerContainer, {
        opacity: 0
      });
    }

    let isTransitioning = false;

    // Helper function to trigger opening the lookbook portal overlay
    const openPortalLookbook = (clientX, clientY) => {
      if (isTransitioning) return;
      isTransitioning = true;

      // Retract custom cursor state
      document.body.classList.remove('portal-hover-active');
      customCursor.classList.remove('active');

      // Click location or default to center of heroSection
      let clickX, clickY;
      if (clientX !== undefined && clientY !== undefined) {
        const rect = heroSection.getBoundingClientRect();
        clickX = clientX - rect.left;
        clickY = clientY - rect.top;
      } else {
        const rect = heroSection.getBoundingClientRect();
        clickX = rect.width / 2;
        clickY = rect.height / 2;
      }

      // Spawn shockwave & sparks on the canvas (if window function is ready)
      if (typeof window.triggerHeroClickPortal === 'function') {
        window.triggerHeroClickPortal(clickX, clickY);
      }

      // 1. Flash effect
      gsap.to(flashVeil, {
        opacity: 0.9,
        duration: 0.12,
        onComplete: () => {
          gsap.to(flashVeil, {
            opacity: 0,
            duration: 0.42,
            delay: 0.04
          });
        }
      });

      // 2. Blur hero background
      heroSection.classList.add('portal-blurring');

      // 3. Zoom centered necklace slightly
      if (zoomContainer) {
        gsap.to(zoomContainer, {
          scale: 1.45,
          duration: 0.85,
          ease: 'power2.out'
        });
      }

      // 4. Slide thrownPage lookbook overlay from bottom
      gsap.to(thrownPage, {
        y: '0vh',
        opacity: 1,
        pointerEvents: 'auto',
        duration: 0.95,
        ease: 'power3.out',
        delay: 0.1,
        onComplete: () => {
          thrownPage.classList.add('is-active');
          if (typeof window.setHeroCanvasActive === 'function') {
            window.setHeroCanvasActive(false); // Disable loop to save GPU cycles when looking at the list
          }
        }
      });

      // 5. Fade inner details container
      if (innerContainer) {
        gsap.to(innerContainer, {
          opacity: 1,
          duration: 0.75,
          ease: 'power2.out',
          delay: 0.35
        });
      }

      // 6. Stagger slide up image/details cards
      if (innerCards.length > 0) {
        gsap.to(innerCards, {
          y: 0,
          opacity: 1,
          stagger: 0.08,
          duration: 0.85,
          ease: 'power2.out',
          delay: 0.5,
          force3D: false // Prevent text blurry rendering
        });
      }
    };

    // Trigger Click Portal opening transition
    portalTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      openPortalLookbook(e.clientX, e.clientY);
    });

    // Automatically enter the Sanctuary Lookbook on scroll down / wheel down (when not already transitioning/active)
    window.addEventListener('wheel', (e) => {
      if (!isTransitioning && e.deltaY > 0) {
        openPortalLookbook();
      }
    }, { passive: true });

    // Touch gesture swipe-up to open the lookbook (Mobile)
    let heroTouchStartY = 0;
    heroSection.addEventListener('touchstart', (e) => {
      heroTouchStartY = e.touches[0].clientY;
    }, { passive: true });

    heroSection.addEventListener('touchmove', (e) => {
      if (isTransitioning) return;
      const touchY = e.touches[0].clientY;
      const diffY = heroTouchStartY - touchY; // positive means swipe up / scroll down
      if (diffY > 60) {
        openPortalLookbook();
      }
    }, { passive: true });

    // Scroll-to-Exit and Swipe-to-Exit Gesture Transition Logic
    const closePortalLookbook = () => {
      // Resume background particles canvas loops
      if (typeof window.setHeroCanvasActive === 'function') {
        window.setHeroCanvasActive(true);
      }

      // Clear any canvas particles or lingering shockwaves
      if (typeof window.clearHeroClickPortalEffects === 'function') {
        window.clearHeroClickPortalEffects();
      }

      // Slide lookbook overlay away
      gsap.to(thrownPage, {
        y: '100vh',
        opacity: 0,
        pointerEvents: 'none',
        duration: 0.85,
        ease: 'power3.inOut',
        onComplete: () => {
          thrownPage.classList.remove('is-active');
          isTransitioning = false;
          // Pre-reset content elements for next click reveal
          gsap.set(innerCards, { y: 45, opacity: 0 });
          gsap.set(innerContainer, { opacity: 0 });
          thrownPage.scrollTop = 0; // Force lookbook cleanly to top
        }
      });

      // Revert background hero blur
      heroSection.classList.remove('portal-blurring');

      // Reset zoom
      if (zoomContainer) {
        gsap.to(zoomContainer, {
          scale: 1.0,
          duration: 0.85,
          ease: 'power2.out'
        });
      }
    };

    let isExiting = false;

    // Detect wheel scroll-up at top to exit lookbook
    thrownPage.addEventListener('wheel', (e) => {
      if (!isTransitioning || isExiting) return;
      
      // If at the top of the lookbook page and scrolling UP
      if (thrownPage.scrollTop <= 0 && e.deltaY < 0) {
        isExiting = true;
        closePortalLookbook();
        setTimeout(() => { isExiting = false; }, 1000);
      }
    }, { passive: true });

    // Detect touch-swipe-down at top to exit lookbook (Mobile)
    let touchStartY = 0;
    thrownPage.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    thrownPage.addEventListener('touchmove', (e) => {
      if (!isTransitioning || isExiting) return;

      const touchY = e.touches[0].clientY;
      const diffY = touchY - touchStartY; // positive means swipe down

      // If at the top of the page and swiped down significantly (more than 60px)
      if (thrownPage.scrollTop <= 0 && diffY > 60) {
        isExiting = true;
        closePortalLookbook();
        setTimeout(() => { isExiting = false; }, 1000);
      }
    }, { passive: true });

    // Handle deep-linking when landing directly on categories hash
    const handleHashLoad = () => {
      const isTargetHash = window.location.hash === '#curated-luxury-categories' || window.location.hash === '#temp-curated-luxury-categories';
      if (isTargetHash) {
        // Prevent body/window scroll offset
        window.scrollTo(0, 0);

        // Snap lookbook overlay open immediately
        heroSection.classList.add('portal-blurring');
        
        if (zoomContainer) {
          gsap.set(zoomContainer, { scale: 1.45 });
        }

        gsap.set(thrownPage, {
          y: '0vh',
          opacity: 1,
          pointerEvents: 'auto'
        });
        thrownPage.classList.add('is-active');

        if (innerContainer) {
          gsap.set(innerContainer, { opacity: 1 });
        }

        if (innerCards.length > 0) {
          gsap.set(innerCards, { y: 0, opacity: 1 });
        }

        isTransitioning = true;

        if (typeof window.setHeroCanvasActive === 'function') {
          window.setHeroCanvasActive(false);
        }

        // Restore target ID and scroll internally to categories section
        setTimeout(() => {
          const tempEl = document.getElementById('temp-curated-luxury-categories') || document.getElementById('curated-luxury-categories');
          if (tempEl) {
            tempEl.id = 'curated-luxury-categories';
            tempEl.scrollIntoView({ behavior: 'smooth' });
          }
        }, 150);
      }
    };

    handleHashLoad();
    window.addEventListener('hashchange', handleHashLoad, { passive: true });
  }

  // ==========================================================
  // --- 3D INTERACTIVE TILT & SPOTLIGHT FOR CATEGORY CARDS ---
  // ==========================================================
  if (thrownPage) {
    const categoryCards = thrownPage.querySelectorAll('.category-dir-card');
    categoryCards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Set custom variables for metallic spot shine
        card.style.setProperty('--mx', `${x}px`);
        card.style.setProperty('--my', `${y}px`);

        if (prefersReducedMotion) return;

        // Normalize coordinates (-1 to 1)
        const xc = (x / rect.width - 0.5) * 2;
        const yc = (y / rect.height - 0.5) * 2;

        // 3D rotations on the card (max tilt: 8 degrees)
        const rotX = -yc * 8;
        const rotY = xc * 8;

        card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-8px) scale(1.01)`;
        card.style.transition = 'none';
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)';
        card.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
      });
    });

    // Native IntersectionObserver reveal animations for elements inside the scrollable thrownPage lookbook
    // This perfectly bypasses ScrollTrigger limits inside containers starting as display:none!
    if (typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.to(entry.target, {
              y: 0,
              opacity: 1,
              duration: 0.85,
              ease: 'power2.out',
              overwrite: 'auto'
            });
            observer.unobserve(entry.target); // Trigger only once
          }
        });
      }, {
        root: thrownPage, // Observe inside the lookbook overlay!
        threshold: 0.08,   // Trigger when 8% is visible
        rootMargin: '0px 0px -40px 0px' // Snappy bottom offset
      });

      const revealElements = thrownPage.querySelectorAll('.reveal-up');
      revealElements.forEach((el) => {
        gsap.set(el, { y: 45, opacity: 0 }); // Pre-place below fold
        observer.observe(el);
      });
    }
  }

  // ==========================================================
  // --- 3D INTERACTIVE TILT FOR ALTERNATING EDITORIAL PANELS ---
  // ==========================================================
  const editorialPanels = thrownPage.querySelectorAll('.editorial-panel');
  editorialPanels.forEach((panel) => {
    panel.addEventListener('mousemove', (e) => {
      const rect = panel.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Set coordinate custom variables on the panel for spotlight shines
      panel.style.setProperty('--mx', `${x}px`);
      panel.style.setProperty('--my', `${y}px`);

      if (prefersReducedMotion) return;

      // Calculate normalized coordinates (-1 to 1)
      const xc = (x / rect.width - 0.5) * 2;
      const yc = (y / rect.height - 0.5) * 2;

      // 3D rotations on the image wrapper only (max tilt: 10 degrees)
      const rotX = -yc * 10;
      const rotY = xc * 10;

      // Shift images and caption elements dynamically in 3D parallax offsets
      const img = panel.querySelector('.panel-card-img');
      const imgWrapper = panel.querySelector('.panel-image-wrapper');
      const info = panel.querySelector('.panel-info-container');

      if (img) {
        img.style.transform = `scale(1.06) translate3d(${-xc * 8}px, ${-yc * 8}px, 0)`;
      }
      if (imgWrapper) {
        imgWrapper.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`;
        imgWrapper.style.transition = 'none';
      }
      if (info) {
        info.style.transform = `translate3d(${xc * 12}px, ${yc * 12}px, 40px)`;
        info.style.transition = 'none';
      }
    });

    panel.addEventListener('mouseleave', () => {
      const img = panel.querySelector('.panel-card-img');
      const imgWrapper = panel.querySelector('.panel-image-wrapper');
      const info = panel.querySelector('.panel-info-container');

      if (imgWrapper) {
        imgWrapper.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
        imgWrapper.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
      }
      if (img) {
        img.style.transform = 'scale(1) translate3d(0, 0, 0)';
        img.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
      }
      if (info) {
        info.style.transform = 'translate3d(0, 0, 0)';
        info.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
      }
    });
  });

  // ==========================================================
  // --- THE "SLAM-DOWN" PHYSICAL BOUNCE GALLERY PAGE ---
  // ==========================================================
  const slamDownPage = document.getElementById('slam-down-page');
  const slamDownCloseBtn = document.getElementById('slam-down-close');
  let activeSlideIdx = 0;

  // Add click listeners to launch gallery inspector
  editorialPanels.forEach((panel) => {
    panel.addEventListener('click', () => {
      const idx = parseInt(panel.getAttribute('data-index'), 10) || 0;
      openSlamDownGallery(idx);
    });
  });

  function openSlamDownGallery(index) {
    if (!slamDownPage) return;
    activeSlideIdx = index;

    // Instantly sync slider state without animation before showing the dropped page
    goToSlide(activeSlideIdx, false);

    // Initial state setup for the drop down animation
    gsap.set(slamDownPage, {
      display: 'flex',
      y: '-100%',
      opacity: 0,
      pointerEvents: 'none'
    });

    // Drop down timeline with gravity weight and bounce settle
    const tl = gsap.timeline({
      onComplete: () => {
        slamDownPage.classList.add('is-active');

        // Secondary screen physical vibration shake to simulate heavy landing impact ("dhdaam" shockwave!)
        if (!prefersReducedMotion) {
          gsap.to('.slam-down-content', {
            y: '+=14',
            duration: 0.06,
            yoyo: true,
            repeat: 5,
            ease: 'power1.inOut',
            onComplete: () => {
              // Settle back cleanly
              gsap.to('.slam-down-content', { y: 0, duration: 0.2 });
            }
          });

          // Soft elastic wobble on the Close button to match drop impulse
          gsap.fromTo('#slam-down-close',
            { rotation: -4, scale: 0.95 },
            { rotation: 0, scale: 1, duration: 0.5, ease: 'elastic.out(1.2, 0.4)' }
          );
        }
      }
    });

    tl.to(slamDownPage, {
      y: '0%',
      opacity: 1,
      pointerEvents: 'auto',
      duration: 1.15,
      ease: prefersReducedMotion ? 'power2.out' : 'bounce.out(1.1)' // Elastic heavy physical drop ease
    });
  }

  // Close gallery trigger
  if (slamDownCloseBtn) {
    slamDownCloseBtn.addEventListener('click', () => {
      closeSlamDownGallery();
    });
  }

  function closeSlamDownGallery() {
    if (!slamDownPage) return;
    slamDownPage.classList.remove('is-active');

    // Retract gallery overlay back upward smoothly
    gsap.to(slamDownPage, {
      y: '-100%',
      opacity: 0,
      duration: 0.65,
      ease: 'power3.in',
      onComplete: () => {
        slamDownPage.style.display = 'none';
      }
    });
  }

  // ==========================================================
  // --- THE MANUAL LUXURY SLIDER CONTROL SYSTEM ---
  // ==========================================================
  const sliderTrack = document.getElementById('slider-track');
  const sliderPrevBtn = document.getElementById('slider-prev');
  const sliderNextBtn = document.getElementById('slider-next');
  const sliderDots = document.querySelectorAll('.slider-dot');
  const thumbnailItems = document.querySelectorAll('.thumbnail-item');
  const totalSlides = 4;

  function goToSlide(idx, animate = true) {
    if (!sliderTrack) return;

    // Boundary circular wrap
    if (idx < 0) idx = totalSlides - 1;
    if (idx >= totalSlides) idx = 0;

    activeSlideIdx = idx;

    // Shift percentage translation (each slide occupies 25% of the 400% track width)
    const translatePercent = -idx * 25;

    if (animate) {
      sliderTrack.style.transition = 'transform 0.8s cubic-bezier(0.25, 1, 0.33, 1)';
    } else {
      sliderTrack.style.transition = 'none';
    }
    sliderTrack.style.transform = `translateX(${translatePercent}%)`;

    // Sync Dots active classes
    sliderDots.forEach((dot, dIdx) => {
      dot.classList.toggle('active', dIdx === activeSlideIdx);
    });

    // Sync Thumbnail Strip active classes
    thumbnailItems.forEach((thumb, tIdx) => {
      thumb.classList.toggle('active', tIdx === activeSlideIdx);
    });

    // Zoom/Fade micro-interaction for high-res details upon slide settle
    if (animate && !prefersReducedMotion) {
      const activeSlide = sliderTrack.querySelector(`.slider-slide[data-index="${activeSlideIdx}"]`);
      if (activeSlide) {
        const slideImg = activeSlide.querySelector('.slider-slide-img');
        const slideCaption = activeSlide.querySelector('.slide-caption');
        if (slideImg) {
          gsap.fromTo(slideImg,
            { scale: 0.88, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.8, ease: 'power2.out' }
          );
        }
        if (slideCaption) {
          gsap.fromTo(slideCaption,
            { y: 22, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.7, delay: 0.15, ease: 'power2.out' }
          );
        }
      }
    }
  }

  // Dots indicators click navigation
  sliderDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.getAttribute('data-index'), 10) || 0;
      goToSlide(idx);
    });
  });

  // Thumbnail strip click navigation
  thumbnailItems.forEach((thumb) => {
    thumb.addEventListener('click', () => {
      const idx = parseInt(thumb.getAttribute('data-index'), 10) || 0;
      goToSlide(idx);
    });
  });

  // Arrows click triggers
  if (sliderPrevBtn) {
    sliderPrevBtn.addEventListener('click', () => {
      goToSlide(activeSlideIdx - 1);
    });
  }

  if (sliderNextBtn) {
    sliderNextBtn.addEventListener('click', () => {
      goToSlide(activeSlideIdx + 1);
    });
  }

  // Keyboard accessibility triggers
  document.addEventListener('keydown', (e) => {
    if (slamDownPage && slamDownPage.classList.contains('is-active')) {
      if (e.key === 'ArrowLeft') {
        goToSlide(activeSlideIdx - 1);
      } else if (e.key === 'ArrowRight') {
        goToSlide(activeSlideIdx + 1);
      } else if (e.key === 'Escape') {
        closeSlamDownGallery();
      }
    }
  });

  // ==========================================================
  // --- TOUCH SWIPE & MOUSE DRAG PHYSICS ---
  // ==========================================================
  let isDragging = false;
  let startX = 0;
  let prevTranslate = 0;

  if (sliderTrack) {
    // Mouse Event Registrations
    sliderTrack.addEventListener('mousedown', dragStart);
    sliderTrack.addEventListener('mousemove', dragMove);
    sliderTrack.addEventListener('mouseup', dragEnd);
    sliderTrack.addEventListener('mouseleave', dragEnd);

    // Native Touch Event Registrations
    sliderTrack.addEventListener('touchstart', dragStart, { passive: true });
    sliderTrack.addEventListener('touchmove', dragMove, { passive: true });
    sliderTrack.addEventListener('touchend', dragEnd);
  }

  function getPositionX(e) {
    return e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
  }

  function dragStart(e) {
    isDragging = true;
    startX = getPositionX(e);
    sliderTrack.style.transition = 'none';

    // Compute starting translate absolute pixels from transform matrix
    const style = window.getComputedStyle(sliderTrack);
    const matrix = new WebKitCSSMatrix(style.transform);
    prevTranslate = matrix.m41;
  }

  function dragMove(e) {
    if (!isDragging) return;
    const currentX = getPositionX(e);
    const diffX = currentX - startX;

    // Horizontal shifts with dampened end limits
    let newTranslate = prevTranslate + diffX;

    const trackWidth = sliderTrack.offsetWidth;
    const maxScroll = -(totalSlides - 1) * (trackWidth / totalSlides);

    if (newTranslate > 0) {
      newTranslate = diffX * 0.35; // Rubber banding at beginning
    } else if (newTranslate < maxScroll) {
      newTranslate = maxScroll + (newTranslate - maxScroll) * 0.35; // Rubber banding at ending
    }

    sliderTrack.style.transform = `translateX(${newTranslate}px)`;
  }

  function dragEnd(e) {
    if (!isDragging) return;
    isDragging = false;

    const trackWidth = sliderTrack.offsetWidth;
    const slideWidth = trackWidth / totalSlides;
    const currentTranslate = new WebKitCSSMatrix(window.getComputedStyle(sliderTrack)).m41;

    // Snap selection index from drag coordinates offset
    let closestIndex = Math.round(-currentTranslate / slideWidth);

    // Boundary lockups
    if (closestIndex < 0) closestIndex = 0;
    if (closestIndex >= totalSlides) closestIndex = totalSlides - 1;

    goToSlide(closestIndex);
  }
});


