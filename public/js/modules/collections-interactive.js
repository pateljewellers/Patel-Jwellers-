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
        this.color = Math.random() > 0.4 ? '#D4AF37' : '#FFFFFF';
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
          ? `rgba(212,175,55,${(Math.random() * 0.6 + 0.4).toFixed(2)})`
          : `rgba(255,255,255,${(Math.random() * 0.5 + 0.2).toFixed(2)})`;
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
      ctx.shadowColor = '#D4AF37';
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
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = this.thickness;
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#D4AF37';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Second inner ripple ring
      if (this.radius > 30) {
        ctx.globalAlpha = Math.max(this.alpha * 0.4, 0);
        ctx.strokeStyle = 'rgba(80,10,18,0.5)';
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

    const baseAlpha = hub.color === 'gold' ? 0.07 : 0.035;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(t * hub.speed * speedMultiplier);
    ctx.lineWidth = 0.7;
    ctx.strokeStyle = hub.color === 'gold'
      ? `rgba(212,175,55,${baseAlpha})`
      : `rgba(80,10,18,${baseAlpha})`;

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
        ? 'rgba(212,175,55,0.07)'
        : 'rgba(80,10,18,0.03)';
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

        // Dual-axis staggered sway (Y + X)
        const phaseOff = idx * 1.1;
        const swayY = Math.sin(time * 0.016 + phaseOff) * 7;
        const swayX = Math.cos(time * 0.011 + phaseOff + 0.5) * 3;

        // Combined transform: sway + 3D tilt
        card.style.transform = isHov
          ? `translate3d(${swayX}px, ${swayY - 10}px, 0) rotateX(${state.tiltX}deg) rotateY(${state.tiltY}deg) scale(1.02)`
          : `translate3d(${swayX}px, ${swayY}px, 0) rotateX(${state.tiltX}deg) rotateY(${state.tiltY}deg)`;

        // Breathing zoom inside the arch image
        const img = card.querySelector('.collection-card__img-wrap img');
        if (img) {
          if (isHov) {
            const breathe = 1.08 + Math.sin(time * 0.038) * 0.018;
            img.style.transform = `scale(${breathe.toFixed(4)})`;
          } else {
            img.style.transform = '';
          }
        }
      });
    }

    rafId = requestAnimationFrame(tick);
  };

  tick();

  window.addEventListener('beforeunload', () => {
    if (rafId) cancelAnimationFrame(rafId);
  });
});

// ==========================================================
// --- COLLECTION HERO INTERACTIVE LUXURY 3D SPOTLIGHT ENGINE ---
// ==========================================================
document.addEventListener('DOMContentLoaded', () => {
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
    function animateHeroCanvas() {
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
  if (assetWrapper) {
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

  // 3. GSAP SCROLL-TRIGGER ZOOM & "THROWN FROM AFAR" OVERLAY TRANSITION
  // 3. GSAP SCROLL-TRIGGER PINNED ZOOM & CRYSTAL-CLEAR INNER SHOWROOM PAGE
  if (!prefersReducedMotion && zoomContainer && thrownPage && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Set initial card states for slide-in (keeping meta/inner static or pre-placed)
    const innerCards = thrownPage.querySelectorAll('.editorial-panel');
    gsap.set(innerCards, {
      y: 40,
      opacity: 0
    });

    gsap.set(thrownPage, {
      opacity: 0,
      display: 'none',
      pointerEvents: 'none'
    });

    const innerContainer = thrownPage.querySelector('.thrown-page-inner');
    if (innerContainer) {
      gsap.set(innerContainer, {
        opacity: 0
      });
    }

    // ScrollTrigger Pinned Timeline configuration
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: heroSection,
        start: 'top top',
        end: '+=150%', // Pinned scroll track
        scrub: 1.0, // Scrub perfectly maps timeline to scroll coordinates
        pin: true, // Lock page scroll in place
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onLeave: () => {
          thrownPage.classList.add('is-active');
        },
        onEnterBack: () => {
          thrownPage.classList.remove('is-active');
        }
      }
    });

    // 1. Immersive 3D Zoom on the centered necklace (scrubs over the first 75% of scroll progress)
    timeline.to(zoomContainer, {
      scale: 26,
      ease: 'power2.in' // Exponential zoom inward
    }, 0);

    // 2. Concurrently fade out editorial components
    timeline.to('.asset-3d-shadow', {
      opacity: 0,
      scale: 2.2,
      filter: 'blur(16px)',
      ease: 'power1.out'
    }, 0);

    timeline.to('.collection-hero-editorial', {
      opacity: 0,
      x: -60,
      ease: 'power1.out'
    }, 0);

    timeline.to('.hero-sidebar-indicator', {
      opacity: 0,
      x: -30,
      ease: 'power1.out'
    }, 0);

    timeline.to('.hero-watermark', {
      opacity: 0,
      y: 50,
      scale: 1.12,
      ease: 'power1.out'
    }, 0);

    if (heroCanvas) {
      timeline.to(heroCanvas, {
        opacity: 0,
        scale: 1.3,
        ease: 'power1.out'
      }, 0);
    }

    // 3. Fade in overlay using pure opacity (no parent scale/rotation/translation to ensure text stays sharp!)
    // Scrubbed from 65% to 85% of scroll progress
    timeline.to(thrownPage, {
      display: 'block', /* Changed from flex to block */
      opacity: 1,
      pointerEvents: 'auto',
      ease: 'power2.out'
    }, 0.65);

    // 4. Fade in the inner page container using pure opacity (protect headers from blur)
    // Scrubbed from 75% to 90% of scroll progress
    if (innerContainer) {
      timeline.to(innerContainer, {
        opacity: 1,
        ease: 'power2.out'
      }, 0.75);
    }

    // 5. Stagger slide up the image cards only (stagger from 80% to 100% of scroll progress)
    if (innerCards.length > 0) {
      timeline.to(innerCards, {
        y: 0,
        opacity: 1,
        stagger: 0.08,
        ease: 'power2.out',
        force3D: false // Prevent 3D transform bitmap caching on text grids
      }, 0.8);
    }
  } else if (prefersReducedMotion && thrownPage) {
    // Fallback path if user prefers reduced motion or no scroll scripts are active
    window.addEventListener('scroll', () => {
      const top = heroSection.getBoundingClientRect().top;
      if (top <= 0) {
        gsap.to(thrownPage, {
          display: 'block', /* Changed from flex to block */
          opacity: 1,
          pointerEvents: 'auto',
          duration: 0.5
        });
      } else {
        gsap.to(thrownPage, {
          opacity: 0,
          pointerEvents: 'none',
          duration: 0.5,
          onComplete: () => {
            thrownPage.style.display = 'none';
          }
        });
      }
    }, { passive: true });
  }

  // Elegant back/return button action to reset scroll triggers and exit lookbook (optional if present)
  const backBtn = document.getElementById('thrown-page-back');
  if (backBtn && thrownPage) {
    backBtn.addEventListener('click', () => {
      // Smoothly scroll the thrown page overlay back to top
      thrownPage.scrollTo({ top: 0, behavior: 'smooth' });
      // Smoothly scroll the window back to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (thrownPage) {
    // Master-level UX: scrolling up when already at the top of the lookbook page zooms back out smoothly to hero
    // We use a direct scroll forwarding with a 3.0x speed multiplier to allow a single, continuous, snappy flick to exit!
    thrownPage.addEventListener('wheel', (e) => {
      if (thrownPage.scrollTop <= 8 && e.deltaY < 0 && window.scrollY > 0) {
        if (e.cancelable) e.preventDefault();
        thrownPage.scrollTop = 0; // Force lookbook cleanly to top
        window.scrollBy(0, e.deltaY * 3.0);
      }
    }, { passive: false });

    // Touch Swipe gesture for mobile devices: swiping down at the top of the page zooms back out smoothly
    let touchStartY = 0;
    let lastTouchY = 0;
    thrownPage.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
      lastTouchY = touchStartY;
    }, { passive: true });

    thrownPage.addEventListener('touchmove', (e) => {
      const touchY = e.touches[0].clientY;
      const diffY = touchY - touchStartY; // positive means swipe down (natural scroll up)
      const deltaY = touchY - lastTouchY; // change since last touchmove
      lastTouchY = touchY;
      
      if (thrownPage.scrollTop <= 8 && diffY > 8 && window.scrollY > 0) {
        if (e.cancelable) e.preventDefault();
        thrownPage.scrollTop = 0; // Force lookbook cleanly to top
        window.scrollBy(0, -deltaY * 3.0);
      }
    }, { passive: false });
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


