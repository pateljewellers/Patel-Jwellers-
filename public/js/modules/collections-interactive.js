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
    canvas.width  = r.width;
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
        this.swingAmp  = Math.random() * 0.5 + 0.1;
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
      ctx.shadowBlur  = 6;
      ctx.shadowColor = '#D4AF37';
      ctx.fillStyle   = this.color;
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
      this.alpha   = 0.8 * (1 - this.radius / this.maxRadius);
      this.thickness = 2.5 * (1 - this.radius / this.maxRadius) + 0.5;
      this.speed  *= 0.98;
    }

    draw() {
      if (!ctx) return;
      ctx.save();
      ctx.globalAlpha    = Math.max(this.alpha, 0);
      ctx.strokeStyle    = '#D4AF37';
      ctx.lineWidth      = this.thickness;
      ctx.shadowBlur     = 12;
      ctx.shadowColor    = '#D4AF37';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Second inner ripple ring
      if (this.radius > 30) {
        ctx.globalAlpha  = Math.max(this.alpha * 0.4, 0);
        ctx.strokeStyle  = 'rgba(80,10,18,0.5)';
        ctx.lineWidth    = this.thickness * 0.5;
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
    { xFrac: 0.12, yFrac: 0.30, R: 90, speed:  0.0007, color: 'gold' },
    { xFrac: 0.88, yFrac: 0.70, R: 120, speed: -0.0005, color: 'burgundy' },
    { xFrac: 0.50, yFrac: 0.50, R: 100, speed:  0.0006, color: 'gold' },
    { xFrac: 0.25, yFrac: 0.80, R: 70,  speed: -0.0009, color: 'gold' },
    { xFrac: 0.78, yFrac: 0.22, R: 80,  speed:  0.0008, color: 'burgundy' },
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
    const R  = hub.R + Math.sin(t * 0.003) * 18;
    const r  = R * 0.42;
    const d  = R * 0.62 + Math.cos(t * 0.002) * 14;

    const baseAlpha = hub.color === 'gold' ? 0.07 : 0.035;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(t * hub.speed * speedMultiplier);
    ctx.lineWidth   = 0.7;
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
      else             ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.restore();
  }

  function drawWaveBands(speedMult, t) {
    if (!ctx || !canvas) return;
    waveBands.forEach((band, bi) => {
      const y0 = band.yFrac * canvas.height;
      ctx.save();
      ctx.lineWidth   = bi === 0 ? 0.9 : 0.6;
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
        const normX = ((e.clientX - r.left) / r.width  - 0.5) * 2;
        const normY = ((e.clientY - r.top)  / r.height - 0.5) * 2;
        cardStates[idx].targetTiltX = normY * -12; // rotateX
        cardStates[idx].targetTiltY = normX *  12; // rotateY
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
