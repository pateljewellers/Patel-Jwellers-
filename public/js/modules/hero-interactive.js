/**
 * Patel Jewellers Mehsanawala
 * Immersive Interactive Hero Engine (Light Luxury Theme)
 * Features 3D glass portal tilting, dynamic light refraction prism flares, gold drafting blueprint geometry, and kinetic letters.
 */

document.addEventListener('DOMContentLoaded', () => {
  const hero = document.getElementById('home-hero');
  const canvas = document.getElementById('hero-interactive-canvas');
  const portal = document.getElementById('hero-glass-portal');
  const portalShine = document.getElementById('glass-portal-shine');
  const portalImage = portal ? portal.querySelector('.glass-portal-image') : null;
  
  if (!hero || !canvas) return;

  const ctx = canvas.getContext('2d');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Configuration (Optimized for Light Gold/Ivory Theme)
  const CONFIG = {
    particleCount: window.innerWidth < 768 ? 20 : 45,
    colors: {
      gold: 'rgba(212, 175, 55, 0.45)',         // Champagne gold stardust
      goldBright: 'rgba(185, 142, 45, 0.85)',   // Rich metallic gold
      sparkle: 'rgba(255, 255, 255, 0.95)',     // White diamond spark
      refraction: [
        'rgba(255, 235, 180, 0.08)',
        'rgba(212, 175, 55, 0.12)',
        'rgba(255, 255, 255, 0.22)',
        'rgba(180, 220, 255, 0.08)'
      ]
    }
  };

  // State Management
  let width = canvas.width = hero.offsetWidth;
  let height = canvas.height = hero.offsetHeight;
  let dpr = window.devicePixelRatio || 1;

  let sparkles = [];
  let mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2, active: false, velocity: 0 };
  let lastMouse = { x: width / 2, y: height / 2 };
  let time = 0;

  // Portal image interaction state
  let isPortalHovered = false;
  let portalZoom = 1.0;
  let portalTranslateZ = 20;
  let portalParallaxMultiplier = 0.25;

  // LERP for smooth animations
  const lerp = (start, end, amt) => (1 - amt) * start + amt * end;

  // 1. High DPI Canvas Resize Handler
  function resize() {
    width = hero.offsetWidth;
    height = hero.offsetHeight;
    dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);
  }

  // 2. Class representing clicking sparkle burst particles
  class Sparkle {
    constructor(x, y, colorType, isTrail = false) {
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
      this.color = Math.random() > 0.5 ? CONFIG.colors.goldBright : CONFIG.colors.sparkle;
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
      // Draw as diamond spark star
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

  // 3. Draw Dynamic Prism Light Flares (Volumetric Beams)
  function drawPrismFlares() {
    if (reducedMotion) return;

    ctx.save();
    
    // Calculate light sweep angle based on mouse X position
    const sweepFactor = (mouse.x / width) * 0.2 - 0.1; // -10% to +10% rotation
    const timeSweep = Math.sin(time * 0.004) * 0.08;
    const angle = Math.PI / 4 + sweepFactor + timeSweep; // 45 degrees base angle
    
    // Source point: Top-left corner
    const startX = -100;
    const startY = -100;
    
    // Draw 3 layers of refractive colored flares
    const flareWidths = [180, 100, 320];
    const offsets = [-0.05, 0, 0.05];
    
    for (let i = 0; i < 3; i++) {
      const currentAngle = angle + offsets[i];
      const endX = startX + Math.cos(currentAngle) * (width + 200);
      const endY = startY + Math.sin(currentAngle) * (height + 200);
      
      const grad = ctx.createLinearGradient(startX, startY, endX, endY);
      
      // Prism gradient colors
      grad.addColorStop(0, 'rgba(255,255,255,0)');
      grad.addColorStop(0.3, CONFIG.colors.refraction[i % 4]);
      grad.addColorStop(0.5, 'rgba(255,255,255,0.18)');
      grad.addColorStop(0.7, CONFIG.colors.refraction[(i + 1) % 4]);
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      
      // Draw a volumetric wedge shape
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

  // 4. Draw Jewelry Drafting Blueprint Geometry (Compass & Ticks)
  function drawBlueprintGeometries() {
    if (reducedMotion) return;

    ctx.save();
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.18)';
    ctx.lineWidth = 0.6;
    
    // Draw coordinates guide lines passing through the cursor
    if (mouse.active) {
      // Horizontal guideline
      ctx.beginPath();
      ctx.moveTo(0, mouse.y);
      ctx.lineTo(width, mouse.y);
      ctx.stroke();

      // Vertical guideline
      ctx.beginPath();
      ctx.moveTo(mouse.x, 0);
      ctx.lineTo(mouse.x, height);
      ctx.stroke();

      // Draw active compass circles around cursor
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 45, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.setLineDash([4, 6]);
      ctx.arc(mouse.x, mouse.y, 90, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Ticking marks on the compass ring
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
        ctx.moveTo(mouse.x + Math.cos(a) * 45, mouse.y + Math.sin(a) * 45);
        ctx.lineTo(mouse.x + Math.cos(a) * 52, mouse.y + Math.sin(a) * 52);
      }
      ctx.stroke();
    }

    // Draw beautiful slowly rotating gold blueprint mandala in the background
    const mandalaX = width * 0.78;
    const mandalaY = height * 0.5;
    ctx.save();
    ctx.translate(mandalaX, mandalaY);
    ctx.rotate(time * 0.001);

    // Mandala concentric wireframes
    ctx.beginPath();
    ctx.arc(0, 0, 160, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.setLineDash([3, 5]);
    ctx.arc(0, 0, 240, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Mandala geometry stars/rotations
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      ctx.rotate(Math.PI / 4);
      ctx.strokeRect(-60, -60, 120, 120);
    }
    ctx.restore();
    ctx.restore();
  }

  // 5. Smoothly tilt the 3D Glass Portal on mousemove
  function update3DGlassPortal() {
    if (!portal || reducedMotion) return;

    const rect = portal.getBoundingClientRect();
    const portalCenterX = rect.left + rect.width / 2;
    const portalCenterY = rect.top + rect.height / 2;

    // Calculate displacement relative to portal center
    const dx = mouse.x - (portalCenterX - hero.getBoundingClientRect().left);
    const dy = mouse.y - (portalCenterY - hero.getBoundingClientRect().top);

    // Limit tilt axes to max 12 degrees
    const maxTilt = 12;
    const targetTiltX = -(dy / height) * maxTilt * 2;
    const targetTiltY = (dx / width) * maxTilt * 2;

    // Smooth LERP transition for portal container tilt
    portal.style.transform = `rotateX(${targetTiltX}deg) rotateY(${targetTiltY}deg)`;

    // Pass coordinates to CSS variables for hover spot overlay inside portal
    portal.style.setProperty('--mouse-x', `${((dx + rect.width / 2) / rect.width) * 100}%`);
    portal.style.setProperty('--mouse-y', `${((dy + rect.height / 2) / rect.height) * 100}%`);

    // Inner Image Parallax and Zoom Logic
    if (portalImage) {
      const targetZoom = isPortalHovered ? 1.12 : 1.0;
      const targetTranslateZ = isPortalHovered ? 38 : 20; // Pop forward on hover
      const targetParallax = isPortalHovered ? 1.0 : 0.25; // Stronger parallax when hovered

      portalZoom = lerp(portalZoom, targetZoom, 0.08);
      portalTranslateZ = lerp(portalTranslateZ, targetTranslateZ, 0.08);
      portalParallaxMultiplier = lerp(portalParallaxMultiplier, targetParallax, 0.08);

      // Shift image in the opposite direction of the cursor for a depth parallax look (max 22px shift)
      const maxImgOffset = 22;
      const imgX = -(dx / rect.width) * maxImgOffset * portalParallaxMultiplier;
      const imgY = -(dy / rect.height) * maxImgOffset * portalParallaxMultiplier;

      // Apply 3D translate and scale
      portalImage.style.transform = `translate3d(${imgX}px, ${imgY}px, ${portalTranslateZ}px) scale(${portalZoom})`;
    }
  }

  // 6. Primary Animation Loop (High-Performance RAF)
  function animate() {
    time++;
    ctx.clearRect(0, 0, width, height);

    // 1. Draw volumetric light sweeps
    drawPrismFlares();

    // 2. Draw gold blueprints
    drawBlueprintGeometries();

    // LERP mouse coordinates smoothly
    mouse.x = lerp(mouse.x, mouse.targetX, 0.08);
    mouse.y = lerp(mouse.y, mouse.targetY, 0.08);

    // Set cursor variables on main hero element
    hero.style.setProperty('--mouse-glow-x', `${(mouse.x / width) * 100}%`);
    hero.style.setProperty('--mouse-glow-y', `${(mouse.y / height) * 100}%`);
    hero.style.setProperty('--mouse-glow-opacity', mouse.active ? '1' : '0.45');

    // Calculate cursor velocity
    const dx = mouse.x - lastMouse.x;
    const dy = mouse.y - lastMouse.y;
    mouse.velocity = Math.hypot(dx, dy);
    lastMouse.x = mouse.x;
    lastMouse.y = mouse.y;

    // Spawn trail sparkles when mouse is moving
    if (mouse.active && !reducedMotion && mouse.velocity > 1.5 && Math.random() > 0.4) {
      sparkles.push(new Sparkle(mouse.x, mouse.y, 'gold', true));
    }

    // Update and draw sparkles
    for (let i = sparkles.length - 1; i >= 0; i--) {
      const sp = sparkles[i];
      sp.update();
      if (sp.life <= 0) {
        sparkles.splice(i, 1);
      } else {
        sp.draw();
      }
    }

    // Tilt the 3D showcase glass panel
    update3DGlassPortal();

    // Organic idle pathing when mouse leaves screen
    if (!mouse.active && !reducedMotion) {
      const targetSpeed = 0.002;
      mouse.targetX = width / 2 + Math.sin(time * targetSpeed) * (width * 0.22);
      mouse.targetY = height / 2 + Math.cos(time * targetSpeed * 1.3) * (height * 0.18);
    }

    requestAnimationFrame(animate);
  }

  // 7. Event Listeners for Interaction Tracking
  hero.addEventListener('mousemove', (e) => {
    mouse.active = true;
    const rect = hero.getBoundingClientRect();
    mouse.targetX = e.clientX - rect.left;
    mouse.targetY = e.clientY - rect.top;
  });

  hero.addEventListener('mouseleave', () => {
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
    setTimeout(() => { mouse.active = false; }, 1500);
  });

  // Tap/Click sparkles burst
  hero.addEventListener('click', (e) => {
    const rect = hero.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Spawn sparkle burst
    const count = window.innerWidth < 768 ? 12 : 24;
    for (let i = 0; i < count; i++) {
      sparkles.push(new Sparkle(clickX, clickY));
    }

    // Dynamic swipe reflection on the glass portal image
    if (portalShine) {
      portalShine.style.transition = 'none';
      portalShine.style.transform = 'translateZ(40px) translateX(-100%)';
      // Force reflow
      void portalShine.offsetWidth;
      portalShine.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
      portalShine.style.transform = 'translateZ(40px) translateX(100%)';
    }
  });

  // Trigger reflection on portal mouseenter
  if (portal) {
    portal.addEventListener('mouseenter', () => {
      isPortalHovered = true;
      if (portalShine) {
        portalShine.style.transition = 'none';
        portalShine.style.transform = 'translateZ(40px) translateX(-100%)';
        void portalShine.offsetWidth;
        portalShine.style.transition = 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)';
        portalShine.style.transform = 'translateZ(40px) translateX(100%)';
      }
    });
    portal.addEventListener('mouseleave', () => {
      isPortalHovered = false;
      if (portal) {
        portal.style.transform = 'rotateX(0deg) rotateY(0deg)';
      }
    });
  }

  // 8. Kinetic spring-physics letters implementation for Hero Title & Tagline
  const heroTitle = document.querySelector('.home-hero__title');
  const heroTagline = document.querySelector('.home-hero__tagline');

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
        span.textContent = char;
        span.className = 'interactive-char';
        
        let position = { x: 0, y: 0 };
        let velocity = { x: 0, y: 0 };
        let target = { x: 0, y: 0 };
        const stiffness = 0.08;
        const damping = 0.75;
        let active = false;

        // Spring physics animation loop for hovered characters
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

        span.addEventListener('mouseenter', () => {
          active = true;
          // Displace character away from cursor
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
          // Burst click sparkles at character
          const rect = span.getBoundingClientRect();
          const heroRect = hero.getBoundingClientRect();
          const cx = rect.left - heroRect.left + rect.width / 2;
          const cy = rect.top - heroRect.top + rect.height / 2;
          
          for (let i = 0; i < 12; i++) {
            sparkles.push(new Sparkle(cx, cy));
          }
          
          // Kinetic bounce displacement
          velocity.y = -18;
          updateSpring();
        });

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

  makeTextInteractive(heroTitle);
  makeTextInteractive(heroTagline);

  // Initializing
  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(animate);
});
