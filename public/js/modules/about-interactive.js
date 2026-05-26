/**
 * ABOUT BRAND INTERACTIVE MODULE
 * Auto-rotating falling image deck, animated stat counters,
 * LERP 3D mouse tilt on deck, canvas gold thread particles.
 *
 * Patel Jewellers Mehsanawala
 */

document.addEventListener('DOMContentLoaded', () => {
  const section = document.getElementById('about-brand');
  if (!section) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // =====================================================
  // 1. FALLING IMAGE DECK
  // =====================================================
  const deck     = document.getElementById('about-deck');
  const cards    = deck ? Array.from(deck.querySelectorAll('.deck-card')) : [];
  const dots     = Array.from(document.querySelectorAll('.deck-dot'));
  const STATES   = ['is-active', 'is-behind-1', 'is-behind-2', 'is-behind-3'];
  let currentIdx = 0;
  let deckTimer  = null;
  let isAnimating = false;

  const applyStates = (activeIndex) => {
    cards.forEach((card, i) => {
      // Remove all state classes
      card.classList.remove(...STATES, 'falling-in');
      const offset = (i - activeIndex + cards.length) % cards.length;
      card.classList.add(STATES[offset]);
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === activeIndex);
    });
  };

  const advanceDeck = (targetIdx) => {
    if (isAnimating) return;
    isAnimating = true;

    const nextCard = cards[targetIdx];
    // Remove existing states on next card before flying it in
    nextCard.classList.remove(...STATES);
    void nextCard.offsetWidth; // force reflow
    nextCard.classList.add('falling-in');

    setTimeout(() => {
      currentIdx = targetIdx;
      applyStates(currentIdx);
      isAnimating = false;
    }, 880);
  };

  const nextCard = () => {
    const next = (currentIdx + 1) % cards.length;
    advanceDeck(next);
  };

  if (cards.length > 0) {
    applyStates(0);

    // Auto-advance every 3.8 seconds
    if (!prefersReducedMotion) {
      deckTimer = setInterval(nextCard, 3800);
    }

    // Manual dot clicks
    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const target = parseInt(dot.getAttribute('data-target'), 10);
        if (target !== currentIdx) {
          clearInterval(deckTimer);
          advanceDeck(target);
          if (!prefersReducedMotion) {
            deckTimer = setInterval(nextCard, 3800);
          }
        }
      });
    });

    // Click card to advance to next
    cards.forEach((card) => {
      card.addEventListener('click', () => {
        clearInterval(deckTimer);
        nextCard();
        if (!prefersReducedMotion) {
          deckTimer = setInterval(nextCard, 3800);
        }
      });
    });
  }

  // =====================================================
  // 2. DECK 3D MOUSE TILT
  // =====================================================
  const deckWrapper = document.getElementById('about-deck-wrapper');
  let tilt = { x: 0, y: 0, tx: 0, ty: 0 };

  if (deckWrapper && !prefersReducedMotion) {
    deckWrapper.addEventListener('mousemove', (e) => {
      const r = deckWrapper.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width  - 0.5;
      const ny = (e.clientY - r.top)  / r.height - 0.5;
      tilt.tx = ny * -10;
      tilt.ty = nx *  10;
    }, { passive: true });

    deckWrapper.addEventListener('mouseleave', () => {
      tilt.tx = 0;
      tilt.ty = 0;
    }, { passive: true });
  }

  // =====================================================
  // 3. ANIMATED STAT COUNTERS
  // =====================================================
  const statEls = section.querySelectorAll('.about-stat__num');
  let countersStarted = false;

  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  const animateCounter = (el) => {
    const target  = parseInt(el.getAttribute('data-target'), 10);
    const duration = target > 1000 ? 2200 : 1600;
    const startTime = performance.now();

    const update = (now) => {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const value    = Math.round(easeOut(progress) * target);
      el.textContent = value.toLocaleString();
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target.toLocaleString();
    };
    requestAnimationFrame(update);
  };

  // Trigger counters when the stats block enters view
  const statsBlock = section.querySelector('.about-stats');
  if (statsBlock && 'IntersectionObserver' in window) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !countersStarted) {
          countersStarted = true;
          statEls.forEach((el) => animateCounter(el));
          statsObserver.disconnect();
        }
      });
    }, { threshold: 0.3 });
    statsObserver.observe(statsBlock);
  }

  // =====================================================
  // 4. ABOUT SECTION CANVAS — GOLD THREAD PARTICLES
  // =====================================================
  const canvas = document.getElementById('about-motion-canvas');
  let ctx = null;
  let particles = [];
  let time = 0;
  let rafId = null;
  let mouse = { x: 0, y: 0, tx: 0, ty: 0, active: false };

  if (canvas) {
    ctx = canvas.getContext('2d');

    const resize = () => {
      const r = section.getBoundingClientRect();
      canvas.width  = r.width;
      canvas.height = r.height;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Mouse tracking
    if (!prefersReducedMotion) {
      section.addEventListener('mousemove', (e) => {
        const r = section.getBoundingClientRect();
        mouse.tx = e.clientX - r.left;
        mouse.ty = e.clientY - r.top;
        mouse.active = true;
      }, { passive: true });
      section.addEventListener('mouseleave', () => { mouse.active = false; }, { passive: true });
    }

    class Thread {
      constructor() { this.reset(true); }

      reset(init = false) {
        this.x  = Math.random() * (canvas ? canvas.width : 800);
        this.y  = init ? Math.random() * (canvas ? canvas.height : 600) : (canvas ? canvas.height : 600) + 10;
        this.vy = -(Math.random() * 0.5 + 0.2);
        this.vx = (Math.random() - 0.5) * 0.3;
        this.size  = Math.random() * 2 + 0.5;
        this.alpha = Math.random() * 0.5 + 0.15;
        this.fade  = Math.random() * 0.003 + 0.001;
        this.color = Math.random() > 0.45 ? 'rgba(212,175,55,' : 'rgba(255,255,255,';
        this.swing = Math.random() * 0.025 + 0.008;
        this.phase = Math.random() * Math.PI * 2;
      }

      update(t) {
        this.x += this.vx + Math.sin(t * this.swing + this.phase) * 0.35;
        this.y += this.vy;
        this.alpha -= this.fade;
        if (this.alpha <= 0 || this.y < -10) this.reset();
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.globalAlpha = Math.max(this.alpha, 0);
        ctx.fillStyle   = this.color + this.alpha.toFixed(2) + ')';
        ctx.shadowBlur  = 4;
        ctx.shadowColor = '#D4AF37';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Init threads
    for (let i = 0; i < 55; i++) particles.push(new Thread());

    // Horizontal shimmer bands
    const bands = [
      { yFrac: 0.25, speed: 0.004, alpha: 0.05 },
      { yFrac: 0.55, speed: -0.003, alpha: 0.035 },
      { yFrac: 0.78, speed: 0.005, alpha: 0.04 },
    ];

    const drawBands = (t) => {
      if (!canvas || !ctx) return;
      bands.forEach(b => {
        const y0 = b.yFrac * canvas.height;
        ctx.save();
        ctx.lineWidth   = 0.8;
        ctx.strokeStyle = `rgba(212,175,55,${b.alpha})`;
        ctx.beginPath();
        const steps = 60;
        for (let i = 0; i <= steps; i++) {
          const x = (i / steps) * canvas.width;
          let y = y0 + Math.sin(i * 0.1 + t * b.speed * 6) * 18;
          if (mouse.active) {
            const dx = mouse.x - x, dy = mouse.y - y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < 150) y += (dy / d) * ((150 - d) / 150) * 25;
          }
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
      });
    };

    const tick = () => {
      time++;
      if (!canvas || !ctx) { rafId = requestAnimationFrame(tick); return; }
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!prefersReducedMotion) {
        mouse.x += (mouse.tx - mouse.x) * 0.08;
        mouse.y += (mouse.ty - mouse.y) * 0.08;

        drawBands(time);
        particles.forEach(p => { p.update(time); p.draw(); });
      }

      // Apply 3D tilt to deck
      if (deck && !prefersReducedMotion) {
        tilt.x += (tilt.tx - tilt.x) * 0.09;
        tilt.y += (tilt.ty - tilt.y) * 0.09;
        deck.style.transform = `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`;
      }

      rafId = requestAnimationFrame(tick);
    };
    tick();
  }

  window.addEventListener('beforeunload', () => {
    clearInterval(deckTimer);
    if (rafId) cancelAnimationFrame(rafId);
  });
});
