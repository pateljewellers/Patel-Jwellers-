/**
 * Patel Jewellers Mehsanawala
 * Enhanced Custom Interactive Hero Engine (Vanilla JS Canvas & Interaction)
 * High-performance, responsive particle systems, gold silk wave tracks, and 3D wireframe parallax.
 */

document.addEventListener('DOMContentLoaded', () => {
  const hero = document.getElementById('home-hero');
  const canvas = document.getElementById('hero-interactive-canvas');
  if (!hero || !canvas) return;

  const ctx = canvas.getContext('2d');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Configuration
  const CONFIG = {
    particleCount: window.innerWidth < 768 ? 40 : 80,
    connectDistance: 110,
    mouseRadius: 160,
    colors: {
      gold: 'rgba(176, 168, 154, 0.45)',      // Warm luxury gold / accent
      goldBright: 'rgba(212, 175, 55, 0.95)',  // Bright gold sparkle
      ruby: 'rgba(155, 27, 42, 0.55)',         // Burgundy brand red
      rubyBright: 'rgba(184, 45, 61, 0.95)',   // Bright burgundy
      sparkle: 'rgba(255, 255, 255, 0.85)'     // Pure white light shine
    }
  };

  // State Management
  let width = canvas.width = hero.offsetWidth;
  let height = canvas.height = hero.offsetHeight;
  let dpr = window.devicePixelRatio || 1;

  let particles = [];
  let clickSparkles = [];
  let mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2, active: false };
  let time = 0;
  let frameCounter = 0;

  // LERP for ultra-smooth transition
  const lerp = (start, end, amt) => (1 - amt) * start + amt * end;

  // 1. Handle Canvas Resize and High DPI Support
  function resize() {
    width = hero.offsetWidth;
    height = hero.offsetHeight;
    dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Adjust particle count dynamically based on screen size
    CONFIG.particleCount = width < 768 ? 35 : 85;
    initParticles();
  }

  // 2. Class representing floating jewel dust/diamond facets
  class Particle {
    constructor() {
      this.reset();
      // Start in a random location across the canvas
      this.x = Math.random() * width;
      this.y = Math.random() * height;
    }

    reset() {
      this.x = Math.random() * width;
      this.y = height + Math.random() * 80; // Spawn below bottom edge
      this.size = Math.random() * 2.2 + 0.8; // Random sizes
      this.baseSpeedY = -(Math.random() * 0.4 + 0.15); // Upward float speed
      this.speedY = this.baseSpeedY;
      this.speedX = Math.random() * 0.4 - 0.2; // Gentle horizontal drift
      this.opacity = Math.random() * 0.6 + 0.15;
      this.baseOpacity = this.opacity;
      this.twinkleSpeed = Math.random() * 0.02 + 0.005;
      this.twinklePhase = Math.random() * Math.PI * 2;
      this.type = Math.random() > 0.4 ? 'gold' : 'diamond'; // Types
    }

    update() {
      // Periodic twinkling
      this.twinklePhase += this.twinkleSpeed;
      this.opacity = this.baseOpacity + Math.sin(this.twinklePhase) * 0.15;
      if (this.opacity < 0.05) this.opacity = 0.05;

      // Base drifting motion
      this.x += this.speedX;
      this.y += this.speedY;

      // Wrap-around edges or reset if drifted off top
      if (this.y < -10) {
        this.reset();
      }
      if (this.x < -10) this.x = width + 10;
      if (this.x > width + 10) this.x = -10;

      // Cursor Reactive Force (Displacement)
      if (mouse.active && !reducedMotion) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.hypot(dx, dy);

        if (dist < CONFIG.mouseRadius) {
          const force = (CONFIG.mouseRadius - dist) / CONFIG.mouseRadius;
          const angle = Math.atan2(dy, dx);
          
          // Smooth pushing force with inertia
          const pushX = Math.cos(angle) * force * 1.8;
          const pushY = Math.sin(angle) * force * 1.8;

          this.x += pushX;
          this.y += pushY;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      
      if (this.type === 'diamond') {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        // Diamond sparkles have a subtle glow
        ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
        ctx.shadowBlur = 6;
      } else {
        ctx.fillStyle = `rgba(176, 168, 154, ${this.opacity})`;
        ctx.shadowBlur = 0;
      }
      ctx.fill();
    }
  }

  // 3. Class representing clicking sparkle burst particles & cursor trails
  class Sparkle {
    constructor(x, y, colorType, isTrail = false) {
      this.x = x;
      this.y = y;
      this.size = isTrail ? Math.random() * 1.8 + 0.6 : Math.random() * 2.8 + 1.2;
      const angle = Math.random() * Math.PI * 2;
      const velocity = isTrail ? Math.random() * 1.2 + 0.3 : Math.random() * 4.5 + 1.5;
      
      this.vx = Math.cos(angle) * velocity;
      this.vy = isTrail ? Math.random() * -0.5 - 0.2 : Math.sin(angle) * velocity; // Trails float up gently
      
      this.gravity = isTrail ? -0.01 : 0.08;
      this.friction = isTrail ? 0.98 : 0.96;
      this.life = 1.0;
      this.decay = isTrail ? Math.random() * 0.03 + 0.025 : Math.random() * 0.02 + 0.015;
      
      // Determine colors based on selection or custom
      if (colorType === 'ruby') {
        this.color = CONFIG.colors.rubyBright;
      } else if (colorType === 'gold') {
        this.color = CONFIG.colors.goldBright;
      } else {
        this.color = Math.random() > 0.4 ? CONFIG.colors.goldBright : CONFIG.colors.sparkle;
      }
    }

    update() {
      this.vx *= this.friction;
      this.vy *= this.friction;
      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.life -= this.decay;
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.life;
      ctx.beginPath();
      
      // Draw as elegant tiny stars/diamonds instead of circles
      const s = this.size;
      ctx.moveTo(this.x, this.y - s);
      ctx.lineTo(this.x + s * 0.4, this.y - s * 0.4);
      ctx.lineTo(this.x + s, this.y);
      ctx.lineTo(this.x + s * 0.4, this.y + s * 0.4);
      ctx.lineTo(this.x, this.y + s);
      ctx.lineTo(this.x - s * 0.4, this.y + s * 0.4);
      ctx.lineTo(this.x - s, this.y);
      ctx.lineTo(this.x - s * 0.4, this.y - s * 0.4);
      ctx.closePath();
      
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.restore();
    }
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < CONFIG.particleCount; i++) {
      particles.push(new Particle());
    }
  }

  // 4. Draw luxury lattice/constellation lines connecting gold & diamond nodes
  function drawConnections() {
    ctx.save();
    ctx.shadowBlur = 0; // Disable shadow for line performance
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.hypot(dx, dy);

        if (dist < CONFIG.connectDistance) {
          // Calculate line opacity based on distance (fades out when far)
          const opacity = (1 - dist / CONFIG.connectDistance) * 0.07;
          ctx.strokeStyle = `rgba(176, 168, 154, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }
    ctx.restore();
  }

  // 5. Drawing fluid mathematical "Golden Silk Curves" across the canvas background
  function drawGoldSilkWaves() {
    if (reducedMotion) return;

    ctx.save();
    ctx.shadowBlur = 0;

    // We will draw 3 fine, weaving golden threads
    const waveConfigs = [
      { frequency: 0.003, amplitude: 30, speed: 0.005, color: 'rgba(176, 168, 154, 0.12)', heightOffset: 0.45 },
      { frequency: 0.005, amplitude: 18, speed: -0.007, color: 'rgba(212, 175, 55, 0.07)', heightOffset: 0.52 },
      { frequency: 0.002, amplitude: 45, speed: 0.003, color: 'rgba(155, 27, 42, 0.05)', heightOffset: 0.38 }
    ];

    waveConfigs.forEach(w => {
      ctx.beginPath();
      ctx.strokeStyle = w.color;
      ctx.lineWidth = 1;

      for (let x = 0; x < width; x += 4) {
        // Base sine wave math
        let angle = x * w.frequency + (time * w.speed);
        let baseHeight = height * w.heightOffset;
        let y = baseHeight + Math.sin(angle) * w.amplitude;

        // Interactive warping force: Pull the silk thread slightly towards cursor Y when close on X axis
        if (mouse.active) {
          const dx = Math.abs(x - mouse.x);
          if (dx < 220) {
            const pullFactor = (220 - dx) / 220;
            // Linear warp attraction
            y = lerp(y, mouse.y, pullFactor * 0.15);
          }
        }

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    });

    ctx.restore();
  }

  // 6. Update Background Glowing Orbs and Floating Parallax Rings/Diamonds
  const orbBurgundy = document.querySelector('.glow-orb--burgundy');
  const orbGold = document.querySelector('.glow-orb--gold');
  const ringOuter = document.querySelector('.parallax-ring--outer');
  const ringInner = document.querySelector('.parallax-ring--inner');
  const diamond1 = document.querySelector('.floating-diamond--1');
  const diamond2 = document.querySelector('.floating-diamond--2');
  const diamond3 = document.querySelector('.floating-diamond--3');

  function updateParallaxElements() {
    if (reducedMotion) return;

    // Smoothly LERP the current mouse coordinates towards targets
    mouse.x = lerp(mouse.x, mouse.targetX, 0.08);
    mouse.y = lerp(mouse.y, mouse.targetY, 0.08);

    // Apply spotlight glow coordinates in CSS variables
    hero.style.setProperty('--mouse-glow-x', `${(mouse.x / width) * 100}%`);
    hero.style.setProperty('--mouse-glow-y', `${(mouse.y / height) * 100}%`);
    hero.style.setProperty('--mouse-glow-opacity', mouse.active ? '1' : '0.45'); // Dim glowing spotlight when idle

    // Breathing glow scale calculated mathematically
    const breathe = 1.0 + Math.sin(time * 0.007) * 0.08;

    // Move glowing light sources based on mouse movement (Parallax)
    if (orbBurgundy) {
      const bx = (mouse.x - width / 2) * 0.16;
      const by = (mouse.y - height / 2) * 0.16;
      orbBurgundy.style.transform = `translate3d(${bx}px, ${by}px, 0) scale(${breathe})`;
    }

    if (orbGold) {
      const gx = (width / 2 - mouse.x) * 0.12;
      const gy = (height / 2 - mouse.y) * 0.12;
      orbGold.style.transform = `translate3d(${gx}px, ${gy}px, 0) scale(${breathe})`;
    }

    // Move floating abstract rings in 3D parallax layers
    if (ringOuter) {
      const rx = (mouse.x - width / 2) * 0.035;
      const ry = (mouse.y - height / 2) * 0.035;
      const slowRotate = time * 0.015; // Combine mouse shift with continuous rotation
      ringOuter.style.transform = `translate3d(${rx}px, ${ry}px, 0) rotate(${slowRotate}deg)`;
    }

    if (ringInner) {
      const rx = (width / 2 - mouse.x) * 0.055;
      const ry = (height / 2 - mouse.y) * 0.055;
      const revRotate = -time * 0.025; // Counter-rotation
      ringInner.style.transform = `translate3d(${rx}px, ${ry}px, 0) rotate(${revRotate}deg)`;
    }

    // Update Floating Parallax 3D Wireframe Diamonds
    if (diamond1) {
      const dx = (mouse.x - width / 2) * 0.045;
      const dy = (mouse.y - height / 2) * 0.045;
      const rot = time * 0.06;
      diamond1.style.transform = `translate3d(${dx}px, ${dy}px, 0) rotate(${rot}deg)`;
    }

    if (diamond2) {
      const dx = (width / 2 - mouse.x) * 0.065;
      const dy = (height / 2 - mouse.y) * 0.065;
      const rot = -time * 0.04;
      diamond2.style.transform = `translate3d(${dx}px, ${dy}px, 0) rotate(${rot}deg)`;
    }

    if (diamond3) {
      const dx = (mouse.x - width / 2) * 0.085;
      const dy = (mouse.y - height / 2) * 0.085;
      const rot = time * 0.09;
      diamond3.style.transform = `translate3d(${dx}px, ${dy}px, 0) rotate(${rot}deg)`;
    }
  }

  // 7. Primary Animation Loop (High-Performance RequestAnimationFrame)
  function animate() {
    time++;
    frameCounter++;
    ctx.clearRect(0, 0, width, height);

    // Draw the fluid golden silk curves in the backdrop
    drawGoldSilkWaves();

    // Draw interactive connecting lines
    if (!reducedMotion) {
      drawConnections();
    }

    // Update and draw background floating particles
    particles.forEach(p => {
      p.update();
      p.draw();
    });

    // Spawn elegant fading sparks trail when mouse is actively dragging
    if (mouse.active && !reducedMotion && frameCounter % 3 === 0) {
      const currentTheme = hero.className.match(/theme-(\w+)/);
      const themeColor = currentTheme ? currentTheme[1] : 'gold';
      clickSparkles.push(new Sparkle(mouse.x + (Math.random() * 12 - 6), mouse.y + (Math.random() * 12 - 6), themeColor, true));
    }

    // Update and draw click explosion/sparkle trail particles
    for (let i = clickSparkles.length - 1; i >= 0; i--) {
      const sp = clickSparkles[i];
      sp.update();
      if (sp.life <= 0) {
        clickSparkles.splice(i, 1);
      } else {
        sp.draw();
      }
    }

    // Handle Parallax styling variables (LERP coordinates)
    updateParallaxElements();

    // Idle trigger on touchscreen or when mouse inactive
    if (!mouse.active && !reducedMotion) {
      // Simulate slow, floating sinus movements of cursor target
      const targetSpeed = 0.003;
      mouse.targetX = width / 2 + Math.sin(time * targetSpeed) * (width * 0.25);
      mouse.targetY = height / 2 + Math.cos(time * targetSpeed * 1.4) * (height * 0.2);
    }

    requestAnimationFrame(animate);
  }

  // 8. Event Listeners for Cursor and Touch Tracking
  hero.addEventListener('mousemove', (e) => {
    mouse.active = true;
    const rect = hero.getBoundingClientRect();
    mouse.targetX = e.clientX - rect.left;
    mouse.targetY = e.clientY - rect.top;
  });

  hero.addEventListener('mouseleave', () => {
    // When mouse leaves, return to organic idle pathing
    mouse.active = false;
  });

  // Touch tracking for mobile
  hero.addEventListener('touchstart', (e) => {
    mouse.active = true;
    const rect = hero.getBoundingClientRect();
    if (e.touches.length > 0) {
      mouse.targetX = e.touches[0].clientX - rect.left;
      mouse.targetY = e.touches[0].clientY - rect.top;
    }
  }, { passive: true });

  hero.addEventListener('touchmove', (e) => {
    const rect = hero.getBoundingClientRect();
    if (e.touches.length > 0) {
      mouse.targetX = e.touches[0].clientX - rect.left;
      mouse.targetY = e.touches[0].clientY - rect.top;
    }
  }, { passive: true });

  hero.addEventListener('touchend', () => {
    // Delayed idle fallback on touch release
    setTimeout(() => {
      mouse.active = false;
    }, 1500);
  });

  // Click Sparkles Explosion
  hero.addEventListener('click', (e) => {
    const rect = hero.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Spawn rich sparkling stars
    const burstCount = window.innerWidth < 768 ? 16 : 32;
    // Check if clicked close to a dynamic element or button
    const currentTheme = hero.className.match(/theme-(\w+)/);
    const themeColor = currentTheme ? currentTheme[1] : 'gold';
    for (let i = 0; i < burstCount; i++) {
      clickSparkles.push(new Sparkle(clickX, clickY, themeColor));
    }
  });

  // 9. Collection Hover - Theme Shift Engine
  // Hovering on the collection quicklinks shifts background ambient lighting color
  const themeLinks = document.querySelectorAll('.hero-tag-link');
  themeLinks.forEach(link => {
    link.addEventListener('mouseenter', (e) => {
      const theme = e.currentTarget.dataset.theme;
      if (!theme) return;

      hero.classList.remove('theme-gold', 'theme-ruby', 'theme-diamond', 'theme-antique');
      hero.classList.add(`theme-${theme}`);
      
      // Spawn tiny sparkles over the hovered link
      const rect = e.currentTarget.getBoundingClientRect();
      const heroRect = hero.getBoundingClientRect();
      const linkCenterX = rect.left + rect.width / 2 - heroRect.left;
      const linkTopY = rect.top - heroRect.top;
      
      for (let i = 0; i < 6; i++) {
        clickSparkles.push(new Sparkle(linkCenterX + (Math.random() * 20 - 10), linkTopY + 5, theme));
      }
    });

    link.addEventListener('mouseleave', () => {
      // Revert slow fade back to base theme
      hero.classList.remove('theme-gold', 'theme-ruby', 'theme-diamond', 'theme-antique');
    });
  });

  // Initialization
  window.addEventListener('resize', resize);
  resize();
  initParticles();
  requestAnimationFrame(animate);
});
