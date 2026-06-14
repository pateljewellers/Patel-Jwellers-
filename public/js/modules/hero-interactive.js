/**
 * Patel Jewellers Mehsanawala
 * Immersive Interactive Hero Engine (Light Luxury Theme)
 * Features:
 *  - 1. Magnetic Filigree Threads: real-time vector path bending with spring physics.
 *  - 2. Celestial Mandala Chamber: 3D perspective tilting, rotating rings, and spotlight rays.
 *  - 3. Volumetric Prism Flares and ambient gold stardust trails.
 *  - 4. Spring-kinetic letter physics.
 */

document.addEventListener('DOMContentLoaded', () => {
  const hero = document.getElementById('home-hero');
  const frame = document.getElementById('hero-sticky-frame') || hero;
  const canvas = document.getElementById('hero-interactive-canvas');
  const svgContainer = document.getElementById('filigree-threads-svg');
  const bgImage = document.getElementById('hero-fullscreen-bg');
  
  const gridNodes = [];
  const gridSegments = [];
  const rows = 5;
  const cols = 8;
  
  if (!hero || !canvas) return;

  // Track window scroll coordinates
  let scrollY = window.scrollY;
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
  }, { passive: true });

  const ctx = canvas.getContext('2d');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // LERP helper
  const lerp = (start, end, amt) => (1 - amt) * start + amt * end;

  // Configuration (Light Luxury Gold Theme)
  const CONFIG = {
    particleCount: window.innerWidth < 768 ? 20 : 45,
    colors: {
      gold: 'rgba(212, 175, 55, 0.65)',         // Saturated champagne gold stardust
      goldBright: 'rgba(185, 142, 45, 0.95)',   // Saturated metallic gold
      sparkle: 'rgba(225, 190, 110, 0.95)',     // Rich gold-amber diamond spark
      refraction: [
        'rgba(212, 175, 55, 0.12)',
        'rgba(185, 142, 45, 0.15)',
        'rgba(225, 190, 110, 0.18)',
        'rgba(202, 161, 90, 0.12)'
      ]
    }
  };

  // State Management
  let width = canvas.width = frame.offsetWidth;
  let height = canvas.height = frame.offsetHeight;
  let dpr = window.devicePixelRatio || 1;

  let sparkles = [];
  let mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2, active: false, velocity: 0 };
  let lastMouse = { x: width / 2, y: height / 2 };
  let time = 0;

  // High DPI Canvas Resize Handler
  function resize() {
    width = frame.offsetWidth;
    height = frame.offsetHeight;
    dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);
  }

  // Sparkle Burst Particles class
  let activePillar = null;

  class Sparkle {
    constructor(x, y, colorType = null, isTrail = false) {
      this.x = x;
      this.y = y;
      this.size = isTrail ? Math.random() * 1.5 + 0.5 : Math.random() * 2.5 + 1.0;
      const angle = Math.random() * Math.PI * 2;
      const velocity = isTrail ? Math.random() * 0.8 + 0.2 : Math.random() * 3.5 + 1.2;
      
      this.vx = Math.cos(angle) * velocity;
      this.vy = isTrail ? Math.random() * -0.4 - 0.1 : Math.sin(angle) * velocity;
      
      this.gravity = isTrail ? -0.005 : 0.05;
      this.friction = isTrail ? 0.98 : 0.96;
      this.life = 1.0;
      this.decay = isTrail ? Math.random() * 0.03 + 0.02 : Math.random() * 0.02 + 0.01;
      
      // Dynamic color shifting based on active pillar hover focus
      if (activePillar === 'gold' || colorType === 'gold') {
        this.color = Math.random() > 0.5 ? 'rgba(212, 175, 55, 0.95)' : 'rgba(244, 215, 144, 0.9)';
      } else if (activePillar === 'diamond' || colorType === 'diamond') {
        this.color = Math.random() > 0.5 ? 'rgba(165, 230, 255, 0.95)' : 'rgba(255, 255, 255, 0.9)';
      } else if (activePillar === 'bridal' || colorType === 'bridal') {
        this.color = Math.random() > 0.5 ? 'rgba(176, 27, 46, 0.95)' : 'rgba(212, 175, 55, 0.8)';
      } else {
        this.color = Math.random() > 0.5 ? CONFIG.colors.goldBright : CONFIG.colors.sparkle;
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
      ctx.shadowBlur = 4;
      ctx.fill();
      ctx.restore();
    }
  }

  // Draw volumetric light flares
  function drawPrismFlares() {
    if (reducedMotion) return;

    ctx.save();
    const sweepFactor = (mouse.x / width) * 0.2 - 0.1;
    const timeSweep = Math.sin(time * 0.004) * 0.08;
    const angle = Math.PI / 4 + sweepFactor + timeSweep;
    const startX = -100;
    const startY = -100;
    
    const flareWidths = [180, 100, 320];
    const offsets = [-0.05, 0, 0.05];
    
    for (let i = 0; i < 3; i++) {
      const currentAngle = angle + offsets[i];
      const endX = startX + Math.cos(currentAngle) * (width + 200);
      const endY = startY + Math.sin(currentAngle) * (height + 200);
      
      const grad = ctx.createLinearGradient(startX, startY, endX, endY);
      grad.addColorStop(0, 'rgba(255,255,255,0)');
      grad.addColorStop(0.3, CONFIG.colors.refraction[i % 4]);
      grad.addColorStop(0.5, 'rgba(255,255,255,0.18)');
      grad.addColorStop(0.7, CONFIG.colors.refraction[(i + 1) % 4]);
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      const w = flareWidths[i];
      const perpAngle = currentAngle + Math.PI / 2;
      ctx.lineTo(endX - Math.cos(perpAngle) * w, endY - Math.sin(perpAngle) * w);
      ctx.lineTo(endX + Math.cos(perpAngle) * w, endY + Math.sin(perpAngle) * w);
      ctx.closePath();
      
      ctx.fillStyle = grad;
      ctx.fill();
    }
    ctx.restore();
  }

  // Draw blueprint guidelines
  function drawBlueprintGeometries() {
    if (reducedMotion) return;

    ctx.save();
    ctx.strokeStyle = 'rgba(202, 161, 90, 0.18)';
    ctx.lineWidth = 0.6;
    
    if (mouse.active) {
      // Horizontal
      ctx.beginPath();
      ctx.moveTo(0, mouse.y);
      ctx.lineTo(width, mouse.y);
      ctx.stroke();

      // Vertical
      ctx.beginPath();
      ctx.moveTo(mouse.x, 0);
      ctx.lineTo(mouse.x, height);
      ctx.stroke();

      // Compass Ring
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 45, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.setLineDash([4, 6]);
      ctx.arc(mouse.x, mouse.y, 80, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
        ctx.moveTo(mouse.x + Math.cos(a) * 45, mouse.y + Math.sin(a) * 45);
        ctx.lineTo(mouse.x + Math.cos(a) * 52, mouse.y + Math.sin(a) * 52);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // 1. MAGNETIC GEOMETRIC LATTICE ENGINE
  // -------------------------------------------------------------------------
  let shockwave = { active: false, radius: 0, x: 0, y: 0 };

  function initFiligreeThreads() {
    if (!svgContainer) return;
    svgContainer.innerHTML = '';
    
    gridNodes.length = 0;
    gridSegments.length = 0;

    // 1. Initialize nodes grid distributed across the full viewport
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = (width / (cols - 1)) * c;
        const y = (height / (rows - 1)) * r;

        gridNodes.push({
          x: x,
          y: y,
          anchorX: x,
          anchorY: y,
          vx: 0,
          vy: 0,
          row: r,
          col: c
        });
      }
    }

    // Helper to get node by coordinates
    const getNode = (r, c) => gridNodes[r * cols + c];

    // 2. Build segments to draw horizontal, vertical, and diamond diagonals
    const segments = [];

    // Horizontals
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols - 1; c++) {
        segments.push({ nA: getNode(r, c), nB: getNode(r, c + 1) });
      }
    }

    // Verticals
    for (let r = 0; r < rows - 1; r++) {
      for (let c = 0; c < cols; c++) {
        segments.push({ nA: getNode(r, c), nB: getNode(r + 1, c) });
      }
    }

    // Diagonals (Top-Left to Bottom-Right)
    for (let r = 0; r < rows - 1; r++) {
      for (let c = 0; c < cols - 1; c++) {
        segments.push({ nA: getNode(r, c), nB: getNode(r + 1, c + 1) });
      }
    }

    // Diagonals (Top-Right to Bottom-Left)
    for (let r = 0; r < rows - 1; r++) {
      for (let c = 0; c < cols - 1; c++) {
        segments.push({ nA: getNode(r, c + 1), nB: getNode(r + 1, c) });
      }
    }

    // Create SVG path elements for each facet segment
    segments.forEach((seg) => {
      const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      pathEl.setAttribute('class', 'filigree-thread');
      svgContainer.appendChild(pathEl);
      seg.path = pathEl;
      gridSegments.push(seg);
    });
  }

  function updateFiligreeThreads() {
    // Re-anchor nodes proportionally if screen resized
    gridNodes.forEach((node) => {
      node.anchorX = (width / (cols - 1)) * node.col;
      node.anchorY = (height / (rows - 1)) * node.row;
    });

    const attractionRadius = 260;

    // Apply interactive physics vectors to lattice nodes
    gridNodes.forEach((node) => {
      let targetX = node.anchorX;
      let targetY = node.anchorY;

      // Snapping properties: lock borders, let inner nodes flex smoothly
      const isEdge = (node.row === 0 || node.row === rows - 1 || node.col === 0 || node.col === cols - 1);
      const stiffness = isEdge ? 0.18 : 0.045;
      const damping = isEdge ? 0.65 : 0.82;

      // Mouse warp warp attraction
      if (mouse.active && !isEdge) {
        const dx = mouse.x - node.x;
        const dy = mouse.y - node.y;
        const dist = Math.hypot(dx, dy);

        if (dist < attractionRadius) {
          const force = (1 - dist / attractionRadius) * 85;
          targetX += (dx / dist) * force;
          targetY += (dy / dist) * force;
        }
      }

      // Click Shockwave ripple propagation
      if (shockwave.active) {
        const dx = node.x - shockwave.x;
        const dy = node.y - shockwave.y;
        const dist = Math.hypot(dx, dy);

        const diff = Math.abs(dist - shockwave.radius);
        if (diff < 90) {
          const force = (1 - diff / 90) * 120 * Math.sin((diff / 90) * Math.PI);
          const angle = Math.atan2(dy, dx);
          // Flex edges slightly under shockwave, then snap back
          targetX += Math.cos(angle) * force;
          targetY += Math.sin(angle) * force;
        }
      }

      // Spring kinetics equations
      const forceX = (targetX - node.x) * stiffness;
      const forceY = (targetY - node.y) * stiffness;

      node.vx = (node.vx + forceX) * damping;
      node.vy = (node.vy + forceY) * damping;

      node.x += node.vx;
      node.y += node.vy;
    });

    // Render segments connecting warped intersections
    gridSegments.forEach((seg) => {
      const d = `M ${seg.nA.x} ${seg.nA.y} L ${seg.nB.x} ${seg.nB.y}`;
      seg.path.setAttribute('d', d);
    });
  }

  // -------------------------------------------------------------------------
  // 2. IMMERSIVE BACKDROP PARALLAX
  // -------------------------------------------------------------------------
  let clickPulse = 0;

  function updateBackdropParallax() {
    if (!bgImage) return;

    // Decaying bounce scale
    clickPulse = lerp(clickPulse, 0, 0.08);

    const dx = mouse.x - width / 2;
    const dy = mouse.y - height / 2;

    const maxShift = 15; // 15px max depth shift
    const shiftX = -(dx / (width / 2)) * maxShift;
    const shiftY = -(dy / (height / 2)) * maxShift;

    // Scroll zoom progress
    const scrollProgress = Math.max(0, Math.min(1, scrollY / window.innerHeight));
    const baseScale = 1.02;
    const zoomScale = scrollProgress * 0.12;
    const finalScale = baseScale + zoomScale + clickPulse;

    if (!reducedMotion) {
      bgImage.style.transform = `scale(${finalScale}) translate3d(${shiftX}px, ${shiftY}px, 0)`;
      const blurAmount = scrollProgress * 12;
      bgImage.style.filter = blurAmount > 0.1 ? `blur(${blurAmount}px)` : 'none';
    } else {
      bgImage.style.transform = `scale(${baseScale + clickPulse})`;
      bgImage.style.filter = 'none';
    }
  }

  // -------------------------------------------------------------------------
  // 3. PRIMARY ANIMATION LOOP
  // -------------------------------------------------------------------------
  function animate() {
    time++;
    ctx.clearRect(0, 0, width, height);

    // Draw sweeps & guide rulers
    drawPrismFlares();
    drawBlueprintGeometries();

    // LERP mouse coordinates
    mouse.x = lerp(mouse.x, mouse.targetX, 0.085);
    mouse.y = lerp(mouse.y, mouse.targetY, 0.085);

    // Set cursor variables on hero section
    hero.style.setProperty('--mouse-glow-x', `${(mouse.x / width) * 100}%`);
    hero.style.setProperty('--mouse-glow-y', `${(mouse.y / height) * 100}%`);
    hero.style.setProperty('--mouse-glow-opacity', mouse.active ? '1' : '0.45');

    // Dynamic overlay gradient shifting on scroll
    const overlay = document.querySelector('.hero-fullscreen-overlay');
    if (overlay) {
      const scrollProgress = Math.max(0, Math.min(1, scrollY / window.innerHeight));
      const centerOpacity = 0.25 + scrollProgress * 0.45;
      const edgeOpacity = 0.72 + scrollProgress * 0.18;
      overlay.style.background = `radial-gradient(circle at 50% 50%, rgba(252, 250, 247, ${centerOpacity}) 0%, rgba(252, 250, 247, ${edgeOpacity}) 100%)`;
    }

    // Parallax scroll for the pillars container wrapper
    const pillarsContainer = document.querySelector('.pillars-container');
    if (pillarsContainer && !reducedMotion) {
      const scrollOffset = (scrollY - window.innerHeight) * -0.10;
      pillarsContainer.style.transform = `translate3d(0, ${scrollOffset}px, 0)`;
    }

    // Calculate cursor velocity
    const dx = mouse.x - lastMouse.x;
    const dy = mouse.y - lastMouse.y;
    mouse.velocity = Math.hypot(dx, dy);
    lastMouse.x = mouse.x;
    lastMouse.y = mouse.y;

    // Spawn gold stardust sparkles on move
    if (mouse.active && !reducedMotion && mouse.velocity > 1.5 && Math.random() > 0.45) {
      sparkles.push(new Sparkle(mouse.x, mouse.y, 'gold', true));
    }

    // Update & draw sparkles
    for (let i = sparkles.length - 1; i >= 0; i--) {
      const sp = sparkles[i];
      sp.update();
      if (sp.life <= 0) {
        sparkles.splice(i, 1);
      } else {
        sp.draw();
      }
    }

    // Update shockwave progression
    if (shockwave.active) {
      shockwave.radius += 22; // Ripple velocity
      if (shockwave.radius > Math.hypot(width, height)) {
        shockwave.active = false;
      }
    }

    // Update grid warp coordinates and image depth offsets
    updateFiligreeThreads();
    updateBackdropParallax();

    // Organic hover circles movement when mouse is off-screen
    if (!mouse.active && !reducedMotion) {
      const targetSpeed = 0.0022;
      mouse.targetX = width / 2 + Math.sin(time * targetSpeed) * (width * 0.2);
      mouse.targetY = height / 2 + Math.cos(time * targetSpeed * 1.3) * (height * 0.15);
    }

    requestAnimationFrame(animate);
  }

  // -------------------------------------------------------------------------
  // 4. EVENT BINDINGS
  // -------------------------------------------------------------------------
  hero.addEventListener('mousemove', (e) => {
    mouse.active = true;
    const rect = frame.getBoundingClientRect();
    mouse.targetX = e.clientX - rect.left;
    mouse.targetY = e.clientY - rect.top;
  });

  hero.addEventListener('mouseleave', () => {
    mouse.active = false;
  });

  // Touch tracking
  hero.addEventListener('touchstart', (e) => {
    mouse.active = true;
    const rect = frame.getBoundingClientRect();
    if (e.touches.length > 0) {
      mouse.targetX = e.touches[0].clientX - rect.left;
      mouse.targetY = e.touches[0].clientY - rect.top;
    }
  }, { passive: true });

  hero.addEventListener('touchmove', (e) => {
    const rect = frame.getBoundingClientRect();
    if (e.touches.length > 0) {
      mouse.targetX = e.touches[0].clientX - rect.left;
      mouse.targetY = e.touches[0].clientY - rect.top;
    }
  }, { passive: true });

  hero.addEventListener('touchend', () => {
    setTimeout(() => { mouse.active = false; }, 1500);
  });

  // Click burst sparkles
  hero.addEventListener('click', (e) => {
    const rect = frame.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Trigger physical ripple shockwave
    shockwave.active = true;
    shockwave.radius = 0;
    shockwave.x = clickX;
    shockwave.y = clickY;

    // Trigger scale bounce using clickPulse variable
    clickPulse = 0.05;
    
    const count = window.innerWidth < 768 ? 30 : 60;
    for (let i = 0; i < count; i++) {
      sparkles.push(new Sparkle(clickX, clickY));
    }
  });

  // Spring letter physics
  const heroBrand = document.querySelector('.hero-brand-header');
  const heroTitle = document.querySelector('.hero-center-title');

  function makeTextInteractive(element) {
    if (!element) return;
    const text = element.innerText;
    element.innerHTML = '';
    
    const words = text.split(' ');
    words.forEach((word, wordIndex) => {
      const wordSpan = document.createElement('span');
      wordSpan.style.display = 'inline-block';
      wordSpan.style.whiteSpace = 'nowrap';
      
      [...word].forEach(char => {
        const span = document.createElement('span');
        if (char === '\u00A0' || char === ' ') {
          span.innerHTML = '&nbsp;';
          span.className = 'interactive-space';
        } else {
          span.textContent = char;
          span.className = 'interactive-char';
        }
        
        let position = { x: 0, y: 0 };
        let velocity = { x: 0, y: 0 };
        let target = { x: 0, y: 0 };
        const stiffness = 0.08;
        const damping = 0.75;
        let active = false;

        const updateSpring = () => {
          if (!active && Math.abs(position.x) < 0.05 && Math.abs(position.y) < 0.05) {
            span.style.transform = '';
            return;
          }
          
          const forceX = (target.x - position.x) * stiffness;
          const forceY = (target.y - position.y) * stiffness;
          
          velocity.x = (velocity.x + forceX) * damping;
          velocity.y = (velocity.y + forceY) * damping;
          
          position.x += velocity.x;
          position.y += velocity.y;
          
          span.style.transform = `translate3d(${position.x}px, ${position.y}px, 0)`;
          requestAnimationFrame(updateSpring);
        };

        if (char !== '\u00A0' && char !== ' ') {
          span.addEventListener('mouseenter', () => {
            active = true;
            target.x = (Math.random() - 0.5) * 16;
            target.y = -Math.random() * 14 - 6;
            updateSpring();
          });

          span.addEventListener('mouseleave', () => {
            active = false;
            target.x = 0;
            target.y = 0;
          });

          span.addEventListener('click', (e) => {
            e.stopPropagation();
            const rect = span.getBoundingClientRect();
            const heroRect = hero.getBoundingClientRect();
            const cx = rect.left - heroRect.left + rect.width / 2;
            const cy = rect.top - heroRect.top + rect.height / 2;
            
            for (let i = 0; i < 12; i++) {
              sparkles.push(new Sparkle(cx, cy));
            }
            
            velocity.y = -18;
            updateSpring();
          });
        }

        wordSpan.appendChild(span);
      });
      
      element.appendChild(wordSpan);
      
      if (wordIndex < words.length - 1) {
        const spaceSpan = document.createElement('span');
        spaceSpan.innerHTML = '&nbsp;';
        spaceSpan.className = 'interactive-space';
        element.appendChild(spaceSpan);
      }
    });
  }

  makeTextInteractive(heroBrand);
  makeTextInteractive(heroTitle);

  // Three Pillars Interactive Hovers & Theme shifting
  const pillarCards = document.querySelectorAll('.pillar-card');
  pillarCards.forEach((card) => {
    card.addEventListener('mouseenter', () => {
      const pillar = card.dataset.pillar;
      activePillar = pillar;

      pillarCards.forEach(c => {
        if (c === card) {
          c.classList.add('is-focused');
          c.classList.remove('is-blurred');
        } else {
          c.classList.add('is-blurred');
          c.classList.remove('is-focused');
        }
      });

      hero.classList.remove('theme-gold', 'theme-ruby', 'theme-diamond', 'theme-antique');
      if (pillar === 'gold') {
        hero.classList.add('theme-gold');
      } else if (pillar === 'diamond') {
        hero.classList.add('theme-diamond');
      } else if (pillar === 'bridal') {
        hero.classList.add('theme-ruby');
      }

      // Hover burst sparkles
      if (!reducedMotion) {
        const icon = card.querySelector('.pillar-card__image-container') || card.querySelector('.pillar-card__icon');
        if (icon) {
          const iconRect = icon.getBoundingClientRect();
          const frameRect = frame.getBoundingClientRect();
          const cx = iconRect.left - frameRect.left + iconRect.width / 2;
          const cy = iconRect.top - frameRect.top + iconRect.height / 2;
          for (let i = 0; i < 15; i++) {
            sparkles.push(new Sparkle(cx, cy, pillar));
          }
        }
      }
    });

    card.addEventListener('mouseleave', () => {
      activePillar = null;
      pillarCards.forEach(c => {
        c.classList.remove('is-focused', 'is-blurred');
      });
      hero.classList.remove('theme-gold', 'theme-ruby', 'theme-diamond', 'theme-antique');
    });
  });

  // Initialize and run
  window.addEventListener('resize', () => {
    resize();
    initFiligreeThreads();
  });

  resize();
  initFiligreeThreads();
  requestAnimationFrame(animate);
});
