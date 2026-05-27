/**
 * TESTIMONIALS INTERACTIVE ENGINE
 * Canvas particle constellation background, 3D card micro-tilt on hover,
 * mouse-gravitational star field, and floating card animations.
 *
 * Patel Jewellers Mehsanawala
 */

document.addEventListener('DOMContentLoaded', () => {
  const section = document.getElementById('testimonials');
  if (!section) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cards = Array.from(section.querySelectorAll('.testi-card'));
  const dots  = Array.from(section.querySelectorAll('.testi-dot'));

  // =====================================================
  // 1. CANVAS — Floating Particle Constellation Field
  // =====================================================
  const canvas = document.getElementById('testi-canvas');
  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: -999, y: -999 };
    let rafId;

    const resize = () => {
      const rect = section.getBoundingClientRect();
      canvas.width  = rect.width;
      canvas.height = rect.height;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    section.addEventListener('mousemove', (e) => {
      const rect = section.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    }, { passive: true });

    section.addEventListener('mouseleave', () => {
      mouse.x = -999;
      mouse.y = -999;
    }, { passive: true });

    class Particle {
      constructor() { this.reset(true); }

      reset(init = false) {
        this.x  = Math.random() * canvas.width;
        this.y  = init ? Math.random() * canvas.height : canvas.height + 10;
        this.z  = Math.random() * 2 + 0.5;
        this.vx = (Math.random() - 0.5) * 0.25;
        this.vy = -(Math.random() * 0.35 + 0.1) * this.z;
        this.size  = (Math.random() * 2 + 0.5) * this.z;
        this.alpha = (Math.random() * 0.4 + 0.1) * (this.z / 2.5);
        this.pulseSpeed = Math.random() * 0.02 + 0.005;
        this.phase      = Math.random() * Math.PI * 2;
        const r = Math.random();
        this.color = r > 0.4
          ? 'rgba(176,168,154,'
          : r > 0.15
            ? 'rgba(155,27,42,'
            : 'rgba(255,255,255,';
      }

      update(t) {
        this.x += this.vx;
        this.y += this.vy;
        this.alphaScale = Math.sin(t * this.pulseSpeed + this.phase) * 0.25 + 0.75;

        // Gentle mouse gravity
        if (this.z > 0.9) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < 160 && d > 0) {
            const pull = ((160 - d) / 160) * (this.z / 2.5) * 0.22;
            this.x += (dx / d) * pull;
            this.y += (dy / d) * pull;
          }
        }

        if (this.y < -10 || this.x < -10 || this.x > canvas.width + 10) {
          this.reset(false);
        }
      }

      draw() {
        const a = Math.max(this.alpha * this.alphaScale, 0);
        ctx.save();
        ctx.fillStyle = this.color + a.toFixed(2) + ')';
        if (this.z > 1.8) {
          ctx.shadowBlur = 5;
          ctx.shadowColor = '#B0A89A';
        }
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // 55 particles
    for (let i = 0; i < 55; i++) particles.push(new Particle());

    const drawConnections = () => {
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        if (p1.z < 0.8) continue;
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          if (p2.z < 0.8 || Math.abs(p1.z - p2.z) > 0.7) continue;
          const dx = p1.x - p2.x, dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const op = ((120 - dist) / 120) * 0.09 * ((p1.z + p2.z) / 5);
            ctx.strokeStyle = `rgba(176,168,154,${op.toFixed(2)})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
        // Mouse rays
        const mdx = p1.x - mouse.x, mdy = p1.y - mouse.y;
        const md  = Math.sqrt(mdx * mdx + mdy * mdy);
        if (p1.z > 1.4 && md < 150) {
          const op = ((150 - md) / 150) * 0.14 * (p1.z / 2.5);
          ctx.strokeStyle = `rgba(176,168,154,${op.toFixed(2)})`;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    };

    let t = 0;
    const tick = () => {
      t++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => p.update(t));
      particles.forEach(p => p.draw());
      drawConnections();
      rafId = requestAnimationFrame(tick);
    };
    tick();

    window.addEventListener('beforeunload', () => cancelAnimationFrame(rafId));
  }

  // =====================================================
  // 2. 3D CARD MICRO-TILT ON HOVER
  // =====================================================
  if (!prefersReducedMotion) {
    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const cx = (e.clientX - rect.left) / rect.width  - 0.5;
        const cy = (e.clientY - rect.top)  / rect.height - 0.5;

        // Spotlight position
        const lx = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1);
        const ly = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1);
        card.style.setProperty('--mx', `${lx}%`);
        card.style.setProperty('--my', `${ly}%`);

        // 3D tilt (max ±12°)
        const rx = cy * -12;
        const ry = cx *  12;
        card.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-6px) scale(1.02)`;
      }, { passive: true });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.removeProperty('--mx');
        card.style.removeProperty('--my');
      }, { passive: true });
    });
  }

  // =====================================================
  // 3. NAVIGATION DOTS (purely cosmetic — all 3 visible)
  // =====================================================
  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      dots.forEach(d => d.classList.remove('testi-dot--active'));
      dot.classList.add('testi-dot--active');

      // Pulse the corresponding card
      const card = cards[idx];
      if (card) {
        card.style.transform = 'perspective(900px) translateY(-12px) scale(1.03)';
        setTimeout(() => { card.style.transform = ''; }, 600);
      }
    });
  });
});
