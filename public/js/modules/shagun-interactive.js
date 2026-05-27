/**
 * BRIDAL SHAGUN JOURNEY INTERACTIVE MODULE
 * 3D Staggered Parallax Card Deck, Synced Hover Privileges,
 * and advanced HTML5 Canvas Sparkling Gold & Bokeh Particle Engine.
 *
 * Patel Jewellers Mehsanawala
 */

document.addEventListener('DOMContentLoaded', () => {
  const section = document.getElementById('shagun');
  if (!section) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // =====================================================
  // 1. INTERACTIVE PRIVILEGES & CARD SYNCING
  // =====================================================
  const privilegeItems = Array.from(section.querySelectorAll('.shagun-privilege-item'));
  const shagunCards    = Array.from(section.querySelectorAll('.shagun-card'));

  const setActiveCard = (activeIndex) => {
    privilegeItems.forEach((item, idx) => {
      item.classList.toggle('is-active', idx === activeIndex);
    });

    shagunCards.forEach((card, idx) => {
      card.classList.toggle('is-active', idx === activeIndex);
    });
  };

  if (privilegeItems.length > 0) {
    privilegeItems.forEach((item) => {
      item.addEventListener('mouseenter', () => {
        const targetIdx = parseInt(item.getAttribute('data-target'), 10);
        if (!isNaN(targetIdx)) {
          setActiveCard(targetIdx);
        }
      });
    });

    // Make cards clickable to cycle
    shagunCards.forEach((card) => {
      card.addEventListener('click', () => {
        const currentActive = shagunCards.findIndex(c => c.classList.contains('is-active'));
        const nextActive = (currentActive + 1) % shagunCards.length;
        setActiveCard(nextActive);
      });
    });
  }

  // =====================================================
  // 2. 3D MOUSE PERSPECTIVE TILT & DIFFERENTIAL PARALLAX
  // =====================================================
  const showcaseWrapper = document.getElementById('shagun-showcase-wrapper');
  const showcaseDeck    = document.getElementById('shagun-showcase-deck');
  let tilt = { x: 0, y: 0, tx: 0, ty: 0 };

  if (showcaseWrapper && !prefersReducedMotion) {
    showcaseWrapper.addEventListener('mousemove', (e) => {
      const rect = showcaseWrapper.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      
      // Calculate target tilt values (max 14 degrees)
      tilt.tx = ny * -14;
      tilt.ty = nx * 14;
    }, { passive: true });

    showcaseWrapper.addEventListener('mouseleave', () => {
      tilt.tx = 0;
      tilt.ty = 0;
    }, { passive: true });
  }

  // =====================================================
  // 3. HTML5 CANVAS — GOLD SPARKLES & BRIDAL BOKEH ENGINE
  // =====================================================
  const canvas = document.getElementById('shagun-motion-canvas');
  let ctx = null;
  let particles = [];
  let bokehs = [];
  let canvasTime = 0;
  let rafId = null;
  let mouse = { x: 0, y: 0, tx: 0, ty: 0, active: false };

  if (canvas) {
    ctx = canvas.getContext('2d');

    const resizeCanvas = () => {
      const rect = section.getBoundingClientRect();
      canvas.width  = rect.width;
      canvas.height = rect.height;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    // Track mouse within the section
    if (!prefersReducedMotion) {
      section.addEventListener('mousemove', (e) => {
        const rect = section.getBoundingClientRect();
        mouse.tx = e.clientX - rect.left;
        mouse.ty = e.clientY - rect.top;
        mouse.active = true;
      }, { passive: true });

      section.addEventListener('mouseleave', () => {
        mouse.active = false;
      }, { passive: true });
    }

    // Sparkle Particle Class
    class Sparkle {
      constructor(init = false) {
        this.reset(init);
      }

      reset(init = false) {
        this.x = Math.random() * canvas.width;
        this.y = init ? Math.random() * canvas.height : canvas.height + 15;
        this.vy = -(Math.random() * 0.7 + 0.3); // floats upward
        this.vx = (Math.random() - 0.5) * 0.4;
        this.size = Math.random() * 2 + 0.6;
        this.alpha = Math.random() * 0.65 + 0.15;
        this.fade = Math.random() * 0.002 + 0.0008;
        
        // Strict brand colors: Taupe, White, Burgundy
        const rand = Math.random();
        if (rand > 0.45) {
          this.color = 'rgba(176,168,154,'; // Warm Taupe (#B0A89A)
        } else if (rand > 0.15) {
          this.color = 'rgba(255,255,255,'; // White
        } else {
          this.color = 'rgba(155,27,42,'; // Brand Burgundy (#9B1B2A)
        }
        
        this.swingSpeed = Math.random() * 0.03 + 0.008;
        this.swingAmp   = Math.random() * 0.5 + 0.15;
        this.phase      = Math.random() * Math.PI * 2;
      }

      update(t) {
        // Horizontal swaying
        this.x += this.vx + Math.sin(t * this.swingSpeed + this.phase) * this.swingAmp;
        this.y += this.vy;
        
        // Fade out
        this.alpha -= this.fade;

        // Gravitational pull toward mouse if active
        if (mouse.active) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            const force = (180 - dist) / 180;
            this.x += (dx / dist) * force * 0.35;
            this.y += (dy / dist) * force * 0.35;
          }
        }

        // Reset if out of bounds or dead
        if (this.alpha <= 0 || this.y < -15 || this.x < -10 || this.x > canvas.width + 10) {
          this.reset(false);
        }
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.globalAlpha = Math.max(this.alpha, 0);
        ctx.fillStyle   = this.color + this.alpha.toFixed(2) + ')';
        ctx.shadowBlur  = this.size > 1.2 ? 6 : 2;
        ctx.shadowColor = '#B0A89A'; // Warm Taupe
        
        ctx.beginPath();
        // Render diamonds for premium starry aesthetic
        if (this.size > 1.5) {
          ctx.moveTo(this.x, this.y - this.size);
          ctx.lineTo(this.x + this.size, this.y);
          ctx.lineTo(this.x, this.y + this.size);
          ctx.lineTo(this.x - this.size, this.y);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    // Luxurious Bokeh Circle Class
    class Bokeh {
      constructor() {
        this.reset(true);
      }

      reset(init = false) {
        this.x = Math.random() * canvas.width;
        this.y = init ? Math.random() * canvas.height : canvas.height + 60;
        this.vy = -(Math.random() * 0.25 + 0.08); // very slow rising
        this.vx = (Math.random() - 0.5) * 0.15;
        this.radius = Math.random() * 45 + 15; // large bubbles
        this.alpha  = Math.random() * 0.035 + 0.005; // extremely faint
        this.fade   = Math.random() * 0.0002 + 0.00005;
        this.color  = Math.random() > 0.4 ? '176, 168, 154' : '155, 27, 42'; // Warm Taupe or Burgundy
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.fade;

        if (this.alpha <= 0 || this.y < -this.radius) {
          this.reset(false);
        }
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.beginPath();
        const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        grad.addColorStop(0, `rgba(${this.color}, ${this.alpha})`);
        grad.addColorStop(0.7, `rgba(${this.color}, ${this.alpha * 0.4})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Initialize Canvas Objects
    for (let i = 0; i < 48; i++) {
      particles.push(new Sparkle(true));
    }
    for (let i = 0; i < 8; i++) {
      bokehs.push(new Bokeh());
    }

    // Main render loop
    const tick = () => {
      canvasTime++;
      
      if (!canvas || !ctx) {
        rafId = requestAnimationFrame(tick);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!prefersReducedMotion) {
        // LERP mouse coordinates
        mouse.x += (mouse.tx - mouse.x) * 0.07;
        mouse.y += (mouse.ty - mouse.y) * 0.07;

        // Draw ambient bokehs
        bokehs.forEach(b => { b.update(); b.draw(); });

        // Draw and update sparkles
        particles.forEach(p => { p.update(canvasTime); p.draw(); });
      }

      // =====================================================
      // 4. LERP 3D TILT & DIFFERENTIAL CARD PARALLAX
      // =====================================================
      if (showcaseDeck && !prefersReducedMotion) {
        tilt.x += (tilt.tx - tilt.x) * 0.08;
        tilt.y += (tilt.ty - tilt.y) * 0.08;

        // Apply global 3D tilt perspective
        showcaseDeck.style.transform = `perspective(1500px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`;

        // Apply differential parallax displacement based on depth layer!
        // Staggered overlay sliding vector calculations:
        shagunCards.forEach((card, idx) => {
          let multiplier = 0;
          if (idx === 0) multiplier = -0.55; // shifts slightly against cursor angle (feels close)
          else if (idx === 1) multiplier = 0.22;  // middle shifts with cursor angle
          else if (idx === 2) multiplier = 0.78;  // background shifts highly with cursor (feels deep)
          
          const shiftX = tilt.y * multiplier;
          const shiftY = tilt.x * multiplier;
          
          // Inject custom CSS translation offsets
          card.style.setProperty('--px-x', `${shiftX.toFixed(2)}px`);
          card.style.setProperty('--px-y', `${shiftY.toFixed(2)}px`);
          
          // Apply translations alongside existing layouts
          const isActive = card.classList.contains('is-active');
          const zDepth = isActive ? 40 : (idx === 0 ? 10 : (idx === 1 ? 0 : -10));
          const scale  = isActive ? 1.04 : 1;
          
          card.style.transform = `translate3d(var(--px-x, 0px), var(--px-y, 0px), ${zDepth}px) scale(${scale})`;
        });
      }

      rafId = requestAnimationFrame(tick);
    };
    tick();
  }

  // Cleanup on page transitions
  window.addEventListener('beforeunload', () => {
    if (rafId) cancelAnimationFrame(rafId);
  });
});
