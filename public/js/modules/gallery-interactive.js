/**
 * SIGNATURE GALLERY INTERACTIVE MOTION ENGINE
 * 3D Grid Tilt LERPing, Card-Specific micro-tilting boundaries,
 * 3D Typography Heading interactive perspective shift, spotlight coordinate tracker,
 * Scroll-Driven Stacked-to-Grid Dynamic Card Scattering,
 * and advanced HTML5 Canvas 3D Depth Constellation Network with Click Shockwave Warps.
 *
 * Patel Jewellers Mehsanawala
 */

document.addEventListener('DOMContentLoaded', () => {
  const section = document.getElementById('signature-gallery');
  if (!section) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // =====================================================
  // 1. 3D SCROLL STACKED-TO-GRID VECTOR SCATTER ENGINE
  // =====================================================
  const grid   = document.getElementById('gallery-3d-grid');
  const title  = document.getElementById('gallery-3d-title');
  const cards  = Array.from(section.querySelectorAll('.gallery-3d-card'));
  
  let gridTilt = { x: 0, y: 0, tx: 0, ty: 0 };
  let cardTilt = { x: 0, y: 0, tx: 0, ty: 0 };
  let activeCardIdx = -1;

  let lerpedProgress = 1; // start in grid state, will LERP stack offscreen
  let vectorsCalculated = false;

  // Bulletproof offset-based vector calculation (immune to active CSS transforms or transitions)
  const recalculateVectors = () => {
    if (!grid || cards.length === 0) return;
    if (window.innerWidth < 960) return; // Skip coordinate tracking on mobile devices
    
    const centerX = grid.offsetWidth / 2;
    const centerY = grid.offsetHeight / 2;

    cards.forEach((card) => {
      const cardX = card.offsetLeft + card.offsetWidth / 2;
      const cardY = card.offsetTop + card.offsetHeight / 2;

      card.vectorX = centerX - cardX;
      card.vectorY = centerY - cardY;
    });
  };

  // Recalculate on window resize for complete responsiveness
  window.addEventListener('resize', () => {
    recalculateVectors();
  }, { passive: true });

  if (grid && !prefersReducedMotion) {
    // 1A. Global Mouse Tracker (Grid & Heading Tilt)
    section.addEventListener('mousemove', (e) => {
      const rect = section.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      
      // Global tilt target coordinates (max 8.5 degrees)
      gridTilt.tx = ny * -8.5;
      gridTilt.ty = nx * 8.5;
    }, { passive: true });

    section.addEventListener('mouseleave', () => {
      gridTilt.tx = 0;
      gridTilt.ty = 0;
    }, { passive: true });

    // 1B. Individual Card Spotlight & Micro-Tilt Tracker
    cards.forEach((card, idx) => {
      card.addEventListener('mousemove', (e) => {
        activeCardIdx = idx;
        const rect = card.getBoundingClientRect();
        
        // Coordinates relative to card center [-0.5 to 0.5]
        const cx = (e.clientX - rect.left) / rect.width - 0.5;
        const cy = (e.clientY - rect.top) / rect.height - 0.5;
        
        // Spotlight coordinates relative to card top-left [0% to 100%]
        const localX = (e.clientX - rect.left) / rect.width * 100;
        const localY = (e.clientY - rect.top) / rect.height * 100;
        card.style.setProperty('--mx', `${localX.toFixed(1)}%`);
        card.style.setProperty('--my', `${localY.toFixed(1)}%`);
        
        // Dynamic micro-tilt values inside hovered card (max 15 degrees)
        cardTilt.tx = cy * -15;
        cardTilt.ty = cx * 15;
      }, { passive: true });

      card.addEventListener('mouseleave', () => {
        cardTilt.tx = 0;
        cardTilt.ty = 0;
      }, { passive: true });
    });
  }

  // =====================================================
  // 2. HTML5 CANVAS — 3D PERSPECTIVE STELLAR NETWORK
  // =====================================================
  const canvas = document.getElementById('gallery-motion-canvas');
  let ctx = null;
  let stars = [];
  let canvasTime = 0;
  let rafId = null;
  let mouse = { x: 0, y: 0, tx: 0, ty: 0, active: false };

  // Shockwave Warp Wave Config on Click
  let shockwave = { x: 0, y: 0, radius: 0, active: false, maxRadius: 420, speed: 12 };

  if (canvas) {
    ctx = canvas.getContext('2d');

    const resize = () => {
      const rect = section.getBoundingClientRect();
      canvas.width  = rect.width;
      canvas.height = rect.height;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Mouse coordinate tracking
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

      // Click event for 3D Shockwave Ripple
      section.addEventListener('click', (e) => {
        const rect = section.getBoundingClientRect();
        shockwave.x = e.clientX - rect.left;
        shockwave.y = e.clientY - rect.top;
        shockwave.radius = 0;
        shockwave.active = true;
      }, { passive: true });
    }

    // 3D Perspective Star Class
    class Star {
      constructor() {
        this.reset(true);
      }

      reset(init = false) {
        this.x  = Math.random() * canvas.width;
        this.y  = init ? Math.random() * canvas.height : canvas.height + 15;
        this.vx = (Math.random() - 0.5) * 0.3;
        
        // 3D Depth coordinate (z-axis layer: 0.4 = far background, 2.5 = close foreground)
        this.z  = Math.random() * 2.1 + 0.4;
        
        // Velocity scaled by 3D depth layer
        this.vy = -(Math.random() * 0.28 + 0.12) * this.z;
        this.size  = (Math.random() * 1.8 + 0.6) * this.z;
        this.alpha = (Math.random() * 0.4 + 0.12) * (this.z / 2.5);
        
        // Star color selections
        const rand = Math.random();
        if (rand > 0.4) {
          this.color = 'rgba(176,168,154,'; // Luxury Warm Taupe
        } else if (rand > 0.15) {
          this.color = 'rgba(155,27,42,';  // Royal Brand Burgundy
        } else {
          this.color = 'rgba(255,255,255,'; // Sparkle White
        }

        this.pulseSpeed = Math.random() * 0.025 + 0.005;
        this.phase      = Math.random() * Math.PI * 2;
      }

      update(t) {
        this.x += this.vx;
        this.y += this.vy;
        
        // Sparkling pulsate opacity factor
        this.alphaScale = Math.sin(t * this.pulseSpeed + this.phase) * 0.25 + 0.75;

        // Gravitational cursor pull (only affects foreground layers significantly)
        if (mouse.active && this.z > 0.9) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < 180) {
            const pull = ((180 - d) / 180) * (this.z / 2.5) * 0.28;
            this.x += (dx / d) * pull;
            this.y += (dy / d) * pull;
          }
        }

        // Click shockwave particle outward impulse calculation
        if (shockwave.active) {
          const dx = this.x - shockwave.x;
          const dy = this.y - shockwave.y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          
          // Check if particle resides near shockwave frontier
          if (d < shockwave.radius && d > shockwave.radius - 85) {
            const force = (1 - (d / shockwave.maxRadius)) * (this.z / 2.5) * 8.5;
            this.x += (dx / d) * force;
            this.y += (dy / d) * force;
          }
        }

        // Wraps around boundary coordinates or respawns
        if (this.y < -15 || this.x < -15 || this.x > canvas.width + 15) {
          this.reset(false);
        }
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.globalAlpha = Math.max(this.alpha * this.alphaScale, 0);
        ctx.fillStyle   = this.color + (this.alpha * this.alphaScale).toFixed(2) + ')';
        ctx.shadowBlur  = this.z > 1.8 ? 6 : 0;
        ctx.shadowColor = '#B0A89A';
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Initialize 45 3D Perspective Nodes
    for (let i = 0; i < 45; i++) {
      stars.push(new Star());
    }

    // Connect close constellation nodes (only matching 3D layers)
    const drawConstellations = () => {
      if (!ctx) return;
      ctx.lineWidth = 0.55;
      
      for (let i = 0; i < stars.length; i++) {
        const p1 = stars[i];
        if (p1.z < 0.8) continue; // Background stars don't draw webs

        // Node-to-node connections
        for (let j = i + 1; j < stars.length; j++) {
          const p2 = stars[j];
          if (p2.z < 0.8 || Math.abs(p1.z - p2.z) > 0.75) continue; // Depth safety gap

          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 135) {
            const opacity = ((135 - dist) / 135) * 0.11 * ((p1.z + p2.z) / 5.0);
            ctx.strokeStyle = `rgba(176, 168, 154, ${opacity.toFixed(2)})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        // Dynamic star-to-mouse connection rays (only foreground)
        if (mouse.active && p1.z > 1.4) {
          const mdx = p1.x - mouse.x;
          const mdy = p1.y - mouse.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

          if (mdist < 165) {
            const mOpacity = ((165 - mdist) / 165) * 0.16 * (p1.z / 2.5);
            ctx.strokeStyle = `rgba(176, 168, 154, ${mOpacity.toFixed(2)})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }
    };

    // Draw Expanding Click Shockwave ring
    const drawShockwave = () => {
      if (!ctx || !shockwave.active) return;
      
      ctx.save();
      ctx.strokeStyle = `rgba(155, 27, 42, ${((1 - (shockwave.radius / shockwave.maxRadius)) * 0.14).toFixed(3)})`;
      ctx.lineWidth   = 2.5;
      ctx.shadowBlur  = 8;
      ctx.shadowColor = 'var(--color-primary)';
      ctx.beginPath();
      ctx.arc(shockwave.x, shockwave.y, shockwave.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    };

    // Main animation frame loop
    const tick = () => {
      canvasTime++;

      if (!canvas || !ctx) {
        rafId = requestAnimationFrame(tick);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!prefersReducedMotion) {
        // LERP mouse coordinates
        mouse.x += (mouse.tx - mouse.x) * 0.08;
        mouse.y += (mouse.ty - mouse.y) * 0.08;

        // Shockwave progression
        if (shockwave.active) {
          shockwave.radius += shockwave.speed;
          if (shockwave.radius > shockwave.maxRadius) {
            shockwave.active = false;
          }
        }

        // Draw and update stars + connection webs
        stars.forEach(s => s.update(canvasTime));
        stars.forEach(s => s.draw());
        drawConstellations();
        drawShockwave();
      }

      // =====================================================
      // 3. LERP 3D GRID TILT, 3D TEXT TILT, & SCATTER STACK TO GRID
      // =====================================================
      if (!prefersReducedMotion) {
        gridTilt.x += (gridTilt.tx - gridTilt.x) * 0.08;
        gridTilt.y += (gridTilt.ty - gridTilt.y) * 0.08;

        // 3A. Apply global 3D Grid Tilt
        if (grid) {
          grid.style.transform = `perspective(1800px) rotateX(${gridTilt.x}deg) rotateY(${gridTilt.y}deg)`;
        }

        // 3B. Apply Typography Heading 3D Tilt (leaps forward & tilts reverse)
        if (title) {
          title.style.transform = `perspective(1000px) rotateX(${-gridTilt.x * 0.55}deg) rotateY(${gridTilt.y * 0.55}deg) translateZ(35px)`;
        }

        // 3C. Calculate scroll progress for stacked breakout fanning
        const sectionRect = section.getBoundingClientRect();
        const vh = window.innerHeight;
        const isMobile = window.innerWidth < 960;

        if (isMobile) {
          // Completely bypass JS-driven scroll deck scattering on mobile devices
          // Clean up inline styles so that standard CSS staggered 3D reveals function perfectly
          cards.forEach((card) => {
            const inner = card.querySelector('.gallery-3d-card__inner');
            if (card.style.transform !== '') card.style.transform = '';
            if (card.style.transition !== '') card.style.transition = '';
            if (card.style.pointerEvents !== '') card.style.pointerEvents = '';
            if (inner && inner.style.transform !== '') inner.style.transform = '';
          });
        } else {
          // Upgraded luxury progress mapping: breakout fanning completes BEFORE section reaches center
          const start = vh * 0.95;
          const end = vh * 0.22; // centered comfort reading zone
          const targetProgress = Math.max(0, Math.min(1, (start - sectionRect.top) / (start - end)));

          // Smooth LERP progression
          lerpedProgress += (targetProgress - lerpedProgress) * 0.075;

          // Scatter factor: 1 = fully stacked deck, 0 = fanned out grid
          // Using easeInOutSine style path for scattering
          const scatterFactor = Math.sin((1 - lerpedProgress) * Math.PI / 2);

          // Lazily calculate vectors once elements are rendered in layout
          if (!vectorsCalculated && sectionRect.width > 0) {
            recalculateVectors();
            vectorsCalculated = true;
          }

          // Update card positions
          cardTilt.x += (cardTilt.tx - cardTilt.x) * 0.095;
          cardTilt.y += (cardTilt.ty - cardTilt.y) * 0.095;

          cards.forEach((card, idx) => {
            const inner = card.querySelector('.gallery-3d-card__inner');
            
            // Center coordinate offsets
            const tx = (card.vectorX || 0) * scatterFactor;
            const ty = (card.vectorY || 0) * scatterFactor;
            const tz = (idx * 6.5) * scatterFactor;

            // Fan rotation angles
            const baseRotZ = [-11, -6.5, -2, 2, 6.5, 11][idx] || 0;
            const rotZ = baseRotZ * scatterFactor;
            const rotX = -5.5 * scatterFactor;

            // Dynamic hover interaction
            let interactiveTransform = '';
            if (idx === activeCardIdx && inner) {
              interactiveTransform = `rotateX(${cardTilt.x}deg) rotateY(${cardTilt.y}deg) translateZ(20px)`;
            } else if (inner) {
              interactiveTransform = `rotateX(0deg) rotateY(0deg) translateZ(0px)`;
            }

            // Parallax factors for staggered grid overlay
            const parallaxMultiplier = (idx % 2 === 0) ? -0.6 : 0.7;
            const shiftX = gridTilt.y * parallaxMultiplier * (1 - scatterFactor);
            const shiftY = gridTilt.x * parallaxMultiplier * (1 - scatterFactor);

            card.style.setProperty('--px-x', `${shiftX.toFixed(2)}px`);
            card.style.setProperty('--px-y', `${shiftY.toFixed(2)}px`);

            // Apply scatter vector positions and manage pointer events / transition overrides
            if (scatterFactor > 0.003) {
              card.style.transition = 'none'; // disable CSS transition to prevent conflicts
              card.style.pointerEvents = 'none'; // disable hovering while in deck
              card.style.transform = `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, ${tz.toFixed(1)}px) rotateX(${rotX.toFixed(1)}deg) rotateZ(${rotZ.toFixed(1)}deg)`;
            } else {
              card.style.transition = ''; // restore CSS transitions for smooth mouse enters/exits
              card.style.pointerEvents = 'auto'; // enable hovers in flat grid
              card.style.transform = `translate3d(var(--px-x, 0px), var(--px-y, 0px), 0px)`;
            }

            if (inner) {
              inner.style.transform = interactiveTransform;
            }
          });
        }
      }

      rafId = requestAnimationFrame(tick);
    };
    tick();
  }

  // Cleanup loops on page leave
  window.addEventListener('beforeunload', () => {
    if (rafId) cancelAnimationFrame(rafId);
  });
});
