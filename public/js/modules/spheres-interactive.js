/**
 * THE SPHERES OF PATEL CRAFT — HOLOGRAPHIC MANDALA CHAMBER INTERACTIVE ENGINE
 * Features:
 * - Local HTML5 canvas particle flow rendering swirling stardust streams
 * - Rotating vector-based sacred geometry mandala
 * - Shortest-path rotation alignment and node counter-rotation
 * - LERP-dampened 3D card tilt perspective field
 * - Spotlight mouse glow and idle auto-cycle timers
 * 
 * Patel Jewellers Mehsanawala
 */

document.addEventListener('DOMContentLoaded', () => {
  const layout = document.querySelector('.spheres-mandala-layout');
  const sectionWrapper = document.querySelector('.spheres-section-wrapper');
  if (!layout || !sectionWrapper) return;

  const orbitRing = document.getElementById('orbit-selectors');
  const orbitNodes = document.querySelectorAll('.orbit-node');
  const panes = document.querySelectorAll('.sphere-pane');
  const dots = document.querySelectorAll('.sphere-dot');
  const hologramImages = document.querySelectorAll('.hologram-img');
  const canvas = document.getElementById('pedestal-canvas');
  const pedestal = document.getElementById('spheres-pedestal');
  const pedestalContainer = document.querySelector('.spheres-pedestal-container');

  if (!orbitRing || !canvas || !pedestal) return;

  const ctx = canvas.getContext('2d');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // State
  let activePillar = 'gold';
  let currentRotation = 0; // degrees
  let particles = [];
  let mandalaAngle = 0; // radians
  let autoCycleTimer = null;
  let isInteracting = false;

  // LERP 3D Tilt State
  let targetTiltX = 0;
  let targetTiltY = 0;
  let currentTiltX = 0;
  let currentTiltY = 0;

  // Theme configuration
  const themes = {
    gold: {
      color: 'rgba(212, 175, 55, 0.75)',
      glow: 'rgba(255, 230, 150, 0.85)',
      glowColor: '#D4AF37'
    },
    diamond: {
      color: 'rgba(165, 230, 255, 0.85)',
      glow: 'rgba(255, 255, 255, 0.95)',
      glowColor: '#A5E6FF'
    },
    bridal: {
      color: 'rgba(176, 27, 46, 0.75)',
      glow: 'rgba(255, 210, 215, 0.85)',
      glowColor: '#B01B2E'
    }
  };

  // Particles class
  class StardustParticle {
    constructor(cx, cy, startAngle, startRadius, theme) {
      this.cx = cx;
      this.cy = cy;
      this.startAngle = startAngle;
      this.startRadius = startRadius;
      this.color = theme.color;
      this.glow = theme.glow;
      this.glowColor = theme.glowColor;
      this.t = 0; // Progress along the path [0, 1]
      this.speed = Math.random() * 0.012 + 0.008; // Journey speed
      this.size = Math.random() * 2.5 + 1.2;
      this.spiral = (Math.random() - 0.5) * 1.2; // Twist factor
      this.offsetAngle = (Math.random() - 0.5) * 0.12; // Starting offset
      this.jitterAmp = Math.random() * 12 + 4; // Wave jitter amplitude
    }

    update() {
      this.t += this.speed;
    }

    draw(c) {
      if (this.t >= 1) return;

      // Current distance and angle (shrinking and spiraling in)
      const r = this.startRadius * (1 - this.t);
      const angle = this.startAngle + this.offsetAngle + this.spiral * this.t;

      // Base coordinates
      let x = this.cx + r * Math.cos(angle);
      let y = this.cy + r * Math.sin(angle);

      // Add wave noise perpendicular to the trajectory
      const wave = Math.sin(this.t * Math.PI * 4) * this.jitterAmp * (1 - this.t);
      x += Math.cos(angle + Math.PI / 2) * wave;
      y += Math.sin(angle + Math.PI / 2) * wave;

      // Fade in at start, fade out at center
      const alpha = Math.sin(this.t * Math.PI) * 0.8;

      c.save();
      c.globalAlpha = alpha;
      c.fillStyle = this.color;

      c.beginPath();
      c.arc(x, y, this.size * (1.2 - this.t * 0.5), 0, Math.PI * 2);
      c.fill();

      // Soft glow aura
      c.shadowColor = this.glowColor;
      c.shadowBlur = 6;
      c.restore();
    }
  }

  // Draw concentric mandala vector art
  function drawMandala(c, cx, cy, maxRadius, angle) {
    c.save();
    c.translate(cx, cy);
    c.rotate(angle);

    c.strokeStyle = 'rgba(212, 175, 55, 0.12)';
    c.lineWidth = 1;

    // Concentric dashed rings
    for (let r = 0.2; r <= 0.8; r += 0.2) {
      c.beginPath();
      c.arc(0, 0, maxRadius * r, 0, Math.PI * 2);
      c.setLineDash([4, 6]);
      c.stroke();
    }

    // Radiating guidelines
    c.setLineDash([]);
    const points = 12;
    for (let i = 0; i < points; i++) {
      const theta = (i * Math.PI * 2) / points;
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(maxRadius * 0.85 * Math.cos(theta), maxRadius * 0.85 * Math.sin(theta));
      c.stroke();
    }

    // Intricate geometric web connection
    c.beginPath();
    for (let i = 0; i < points; i++) {
      const theta = (i * Math.PI * 2) / points;
      const x = maxRadius * 0.55 * Math.cos(theta);
      const y = maxRadius * 0.55 * Math.sin(theta);
      if (i === 0) c.moveTo(x, y);
      else c.lineTo(x, y);
    }
    c.closePath();
    c.stroke();

    // Secondary decorative star outline
    c.strokeStyle = 'rgba(212, 175, 55, 0.06)';
    c.beginPath();
    for (let i = 0; i < points; i++) {
      const theta = (i * Math.PI * 2) / points;
      const r = i % 2 === 0 ? maxRadius * 0.75 : maxRadius * 0.4;
      const x = r * Math.cos(theta);
      const y = r * Math.sin(theta);
      if (i === 0) c.moveTo(x, y);
      else c.lineTo(x, y);
    }
    c.closePath();
    c.stroke();

    c.restore();
  }

  // Manage resize & coordinate ratios
  let cx, cy, orbitRadius;
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    cx = rect.width / 2;
    cy = rect.height / 2;
    // Radius matches the CSS dimensions of the selectors circle relative to layout
    orbitRadius = rect.width * 0.42;
  }

  // Handle active chapter select
  function selectPillar(pillar) {
    if (pillar === activePillar) return;

    activePillar = pillar;

    // Toggle active state classes
    orbitNodes.forEach(node => {
      if (node.dataset.pillar === pillar) {
        node.classList.add('active');
      } else {
        node.classList.remove('active');
      }
    });

    panes.forEach(pane => {
      if (pane.dataset.pillar === pillar) {
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    });

    dots.forEach(dot => {
      if (dot.dataset.pillar === pillar) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });

    hologramImages.forEach(img => {
      if (img.dataset.pillar === pillar) {
        img.classList.add('active');
      } else {
        img.classList.remove('active');
      }
    });

    // Theme updates on parent wrapper
    sectionWrapper.classList.remove('theme-gold', 'theme-diamond', 'theme-bridal');
    if (pillar === 'gold') sectionWrapper.classList.add('theme-gold');
    else if (pillar === 'diamond') sectionWrapper.classList.add('theme-diamond');
    else if (pillar === 'bridal') sectionWrapper.classList.add('theme-bridal');

    // Shortest path rotation math
    const targetNode = Array.from(orbitNodes).find(n => n.dataset.pillar === pillar);
    const targetAngle = parseInt(targetNode.dataset.angle, 10);

    // Compute delta modulo 360 to choose the shortest path
    let diff = (-targetAngle - currentRotation) % 360;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    currentRotation += diff;

    // Apply rotation styles to the orbit selectors ring
    orbitRing.style.setProperty('--orbit-rotation', `${currentRotation}deg`);

    // Trigger instant stardust flare
    triggerStardustFlare();
  }

  // Spawns a burst of sparkles
  function triggerStardustFlare() {
    if (prefersReducedMotion) return;

    // Find active node angle in radians
    const currentActiveNode = Array.from(orbitNodes).find(n => n.dataset.pillar === activePillar);
    const initialAngle = parseInt(currentActiveNode.dataset.angle, 10);
    const absoluteAngle = (-90 + initialAngle + currentRotation) * (Math.PI / 180);
    const theme = themes[activePillar];

    for (let i = 0; i < 22; i++) {
      const p = new StardustParticle(cx, cy, absoluteAngle, orbitRadius, theme);
      p.speed = Math.random() * 0.02 + 0.015; // Faster burst speed
      p.jitterAmp = Math.random() * 25 + 5;
      particles.push(p);
    }
  }

  // Navigation Click triggers
  orbitNodes.forEach(node => {
    node.addEventListener('click', (e) => {
      resetAutoTimer();
      selectPillar(node.dataset.pillar);
    });
  });

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      resetAutoTimer();
      selectPillar(dot.dataset.pillar);
    });
  });

  // Idle auto-rotation loop
  function startAutoCycle() {
    if (prefersReducedMotion) return;
    autoCycleTimer = setInterval(() => {
      if (isInteracting) return;
      const pillars = ['gold', 'diamond', 'bridal'];
      const currentIndex = pillars.indexOf(activePillar);
      const nextIndex = (currentIndex + 1) % pillars.length;
      selectPillar(pillars[nextIndex]);
    }, 9000); // Transitions automatically every 9 seconds
  }

  function resetAutoTimer() {
    clearInterval(autoCycleTimer);
    startAutoCycle();
  }

  // Parallax 3D tilt tracking
  if (pedestalContainer && !prefersReducedMotion) {
    pedestalContainer.addEventListener('mousemove', (e) => {
      const rect = pedestalContainer.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const normX = (x / rect.width) * 2 - 1;
      const normY = (y / rect.height) * 2 - 1;

      targetTiltX = -normY * 10; // Max 10 deg tilt
      targetTiltY = normX * 10;
      isInteracting = true;
    }, { passive: true });

    pedestalContainer.addEventListener('mouseleave', () => {
      targetTiltX = 0;
      targetTiltY = 0;
      isInteracting = false;
      resetAutoTimer();
    });
  }

  // Ambient spotlight movement tracking
  sectionWrapper.addEventListener('mousemove', (e) => {
    const rect = sectionWrapper.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    sectionWrapper.style.setProperty('--glow-x', `${(x / rect.width) * 100}%`);
    sectionWrapper.style.setProperty('--glow-y', `${(y / rect.height) * 100}%`);
  }, { passive: true });

  // Main Canvas and LERP loop
  function loop() {
    // 1. Clear Canvas
    ctx.clearRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));

    // 2. Slowly rotate mandala
    mandalaAngle += 0.0018;
    drawMandala(ctx, cx, cy, orbitRadius * 0.9, mandalaAngle);

    // 3. Spawning Stardust Stream
    if (!prefersReducedMotion && Math.random() < 0.85) {
      // Find the absolute angular coordinate of the active selector node
      const currentActiveNode = Array.from(orbitNodes).find(n => n.dataset.pillar === activePillar);
      if (currentActiveNode) {
        const initialAngle = parseInt(currentActiveNode.dataset.angle, 10);
        // Absolute Angle = base offset of gold (-90deg) + node orientation angle + selector ring rotation
        const absoluteAngle = (-90 + initialAngle + currentRotation) * (Math.PI / 180);

        // Spawn particle traveling inward from node to center
        particles.push(new StardustParticle(cx, cy, absoluteAngle, orbitRadius, themes[activePillar]));
      }
    }

    // 4. Update & render particles
    particles = particles.filter(p => {
      p.update();
      if (p.t >= 1) return false;
      p.draw(ctx);
      return true;
    });

    // 5. LERP 3D pedestal tilt
    if (!prefersReducedMotion) {
      currentTiltX += (targetTiltX - currentTiltX) * 0.08;
      currentTiltY += (targetTiltY - currentTiltY) * 0.08;
      pedestal.style.transform = `perspective(1200px) rotateX(${currentTiltX}deg) rotateY(${currentTiltY}deg)`;
    }

    requestAnimationFrame(loop);
  }

  // Initialize
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // Kick off loops
  loop();
  startAutoCycle();

  /* ═══════════════════════════════════════════════════════════════
    SPHERES ENTRANCE ANIMATION
    Triggers ONLY when "The Spheres of Patel Craft" section
    reaches the center of the viewport.
 ═══════════════════════════════════════════════════════════════ */
  function initSpheresAnimations() {

    const textCol =
      sectionWrapper.querySelector('.spheres-details');

    const imageCol =
      sectionWrapper.querySelector('.spheres-pedestal-container');

    const triggerElement =
      sectionWrapper.querySelector('.spheres-heading') ||
      sectionWrapper;

    if (!textCol || !imageCol) return;

    const EASE = 'cubic-bezier(0.22,1,0.36,1)';

    let hasAnimated = false;

    function resetAll() {

      sectionWrapper.style.transition = 'none';
      sectionWrapper.style.opacity = '0';

      imageCol.style.transition = 'none';
      textCol.style.transition = 'none';

      imageCol.style.opacity = '0';
      textCol.style.opacity = '0';

      imageCol.style.transform = 'translateX(-150px)';
      textCol.style.transform = 'translateX(150px)';
    }

    function animateIn() {

      sectionWrapper.style.transition =
        'opacity 0.6s ease';

      imageCol.style.transition =
        `transform 1s ${EASE},
       opacity 1s ease`;

      textCol.style.transition =
        `transform 1s ${EASE} 0.15s,
       opacity 1s ease 0.15s`;

      sectionWrapper.style.opacity = '1';

      imageCol.style.opacity = '1';
      imageCol.style.transform = 'translateX(0)';

      textCol.style.opacity = '1';
      textCol.style.transform = 'translateX(0)';
    }

    resetAll();

    const observer = new IntersectionObserver(
      ([entry]) => {

        if (entry.isIntersecting && !hasAnimated) {
          hasAnimated = true;
          animateIn();
        }

        if (!entry.isIntersecting) {
          hasAnimated = false;
          resetAll();
        }
      },
      {
        threshold: 0,
        rootMargin: '-45% 0px -45% 0px'
      }
    );

    observer.observe(triggerElement);
  }

  /* Boot */
  initSpheresAnimations();
});
