/**
 * BRAND INTRO INTERACTIVE MODULE
 * High-performance, boxless 3D vector floating visualizer, LERP-dampened mouse tilt,
 * local HTML5 canvas stardust particle emitter, and bidirectional triggers.
 *
 * Patel Jewellers Mehsanawala
 */

document.addEventListener('DOMContentLoaded', () => {
  const section = document.getElementById('brand-intro');
  if (!section) return;

  const visualContainer = section.querySelector('.brand-intro__visual-container');
  const visual3D = document.getElementById('intro-visual-3d');
  const artifacts = section.querySelectorAll('.intro-artifact');
  const textTriggers = section.querySelectorAll('.text-trigger');
  const canvas = document.getElementById('intro-dust-canvas');

  // Check user motion preferences
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // LERP and Mouse tracking state variables
  let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  let tilt = { x: 0, y: 0, targetX: 0, targetY: 0 };
  let isHovered = false;

  // ----------------------------------------------------
  // 1. Bidirectional Highlights (Text <-> Plates)
  // ----------------------------------------------------
  const triggerMap = {
    gold: document.getElementById('artifact-gold'),
    diamond: document.getElementById('artifact-diamond'),
    bridal: document.getElementById('artifact-bridal')
  };

  const reverseMap = new Map();
  Object.keys(triggerMap).forEach(key => {
    if (triggerMap[key]) {
      reverseMap.set(triggerMap[key], section.querySelector(`.text-trigger--${key}`));
    }
  });

  // Focus a specific plate, blur others
  function focusPlate(targetKey) {
    Object.keys(triggerMap).forEach(key => {
      const el = triggerMap[key];
      if (!el) return;
      if (key === targetKey) {
        el.classList.add('is-focused');
        el.classList.remove('is-blurred');
      } else {
        el.classList.add('is-blurred');
        el.classList.remove('is-focused');
      }
    });
  }

  // Clear all focus and blur states
  function clearPlates() {
    Object.keys(triggerMap).forEach(key => {
      const el = triggerMap[key];
      if (el) {
        el.classList.remove('is-focused', 'is-blurred');
      }
    });
  }

  // Bind Text Triggers -> Plates
  textTriggers.forEach(trigger => {
    const target = trigger.getAttribute('data-target');
    trigger.addEventListener('mouseenter', () => {
      focusPlate(target);
      // Extra canvas effect on trigger hover
      spawnSparkleBurstAtArtifact(triggerMap[target], 12);
    });
    trigger.addEventListener('mouseleave', () => {
      clearPlates();
    });
  });

  // Bind Plates -> Text Triggers
  Object.keys(triggerMap).forEach(key => {
    const el = triggerMap[key];
    const textEl = reverseMap.get(el);
    if (!el || !textEl) return;

    el.addEventListener('mouseenter', () => {
      focusPlate(key);
      textEl.classList.add('text-trigger--active');
      spawnSparkleBurstAtArtifact(el, 15);
    });

    el.addEventListener('mouseleave', () => {
      clearPlates();
      textEl.classList.remove('text-trigger--active');
    });
  });


  // ----------------------------------------------------
  // 2. 3D Mouse Parallax & Euler LERP (Hardware-Accelerated)
  // ----------------------------------------------------
  if (!prefersReducedMotion && visualContainer && visual3D) {
    const onMouseMove = (e) => {
      const rect = visualContainer.getBoundingClientRect();
      // Normalized coordinates from -1.0 to 1.0
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      
      mouse.targetX = normX;
      mouse.targetY = normY;
      isHovered = true;
    };

    const onMouseLeave = () => {
      mouse.targetX = 0;
      mouse.targetY = 0;
      isHovered = false;
    };

    visualContainer.addEventListener('mousemove', onMouseMove, { passive: true });
    visualContainer.addEventListener('mouseleave', onMouseLeave, { passive: true });
  }


  // ----------------------------------------------------
  // 3. Local Gold Dust Canvas Particle Engine
  // ----------------------------------------------------
  let ctx = null;
  let particles = [];
  let animationFrameId = null;

  if (canvas) {
    ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    const resizeCanvas = () => {
      const rect = visualContainer.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    window.addEventListener('resize', resizeCanvas, { passive: true });
    resizeCanvas();

    // Dust Particle Class definition
    class DustParticle {
      constructor(x, y, isSpecial = false) {
        this.x = x !== undefined ? x : Math.random() * canvas.width;
        this.y = y !== undefined ? y : Math.random() * canvas.height;
        this.size = Math.random() * (isSpecial ? 2.5 : 1.5) + 0.4;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = -Math.random() * 0.6 - 0.2; // Drifting upwards
        this.alpha = Math.random() * 0.6 + 0.2;
        this.fadeRate = Math.random() * 0.006 + 0.002;
        this.swingAmp = Math.random() * 0.8 + 0.2;
        this.swingFreq = Math.random() * 0.02 + 0.005;
        this.color = Math.random() > 0.35 ? '#D4AF37' : '#FFEAB5'; // Gold and champagne stardust
      }

      update(time) {
        this.y += this.vy;
        // Sway horizontally like silk dust
        this.x += this.vx + Math.sin(time * this.swingFreq) * this.swingAmp * 0.08;
        this.alpha -= this.fadeRate;
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.shadowBlur = 4;
        ctx.shadowColor = '#D4AF37';
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Initialize base background stardust
    const baseCount = 35;
    for (let i = 0; i < baseCount; i++) {
      particles.push(new DustParticle());
    }

    // Spawns sparkles directly around a targeted element
    function spawnSparkleBurstAtArtifact(artifactEl, count = 8) {
      if (!artifactEl || !canvas) return;
      const cRect = canvas.getBoundingClientRect();
      const aRect = artifactEl.getBoundingClientRect();
      
      const centerX = (aRect.left - cRect.left) + aRect.width / 2;
      const centerY = (aRect.top - cRect.top) + aRect.height / 2;

      for (let i = 0; i < count; i++) {
        const offsetRadius = Math.random() * 45;
        const angle = Math.random() * Math.PI * 2;
        const pX = centerX + Math.cos(angle) * offsetRadius;
        const pY = centerY + Math.sin(angle) * offsetRadius;
        
        const p = new DustParticle(pX, pY, true);
        p.vy = (Math.random() - 0.5) * 1.5; // Explode omni-directionally
        p.vx = (Math.random() - 0.5) * 1.5;
        p.fadeRate = Math.random() * 0.015 + 0.008; // Fade faster
        particles.push(p);
      }
    }

    // Expose utility globally so we can trigger bursts
    window.spawnSparkleBurstAtArtifact = spawnSparkleBurstAtArtifact;

    // Local mouse interaction on canvas
    if (!prefersReducedMotion && visualContainer) {
      visualContainer.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const cursorX = e.clientX - rect.left;
        const cursorY = e.clientY - rect.top;
        
        // Spawn sparkle trails on cursor hover
        if (Math.random() < 0.28) {
          const p = new DustParticle(cursorX, cursorY, true);
          p.vx = (Math.random() - 0.5) * 0.8;
          particles.push(p);
        }
      }, { passive: true });
    }
  }


  // ----------------------------------------------------
  // 4. Main Dampened Animation Loop (60+ FPS)
  // ----------------------------------------------------
  let time = 0;

  const tick = () => {
    time += 1;

    // Linear Interpolation (LERP) for smooth fluid mouse following
    const lerpFactor = 0.085;
    mouse.x += (mouse.targetX - mouse.x) * lerpFactor;
    mouse.y += (mouse.targetY - mouse.y) * lerpFactor;

    // If mouse is idle, create a gentle circular breathing wave
    if (!isHovered && !prefersReducedMotion) {
      const breathingRadius = 0.2;
      const breathingSpeed = 0.008;
      mouse.x += (Math.cos(time * breathingSpeed) * breathingRadius - mouse.x) * 0.02;
      mouse.y += (Math.sin(time * breathingSpeed * 1.5) * breathingRadius - mouse.y) * 0.02;
    }

    // Calculate rotation tilts based on LERP position (max tilt of 10 degrees)
    const maxTilt = 8;
    tilt.x = mouse.y * -maxTilt;
    tilt.y = mouse.x * maxTilt;

    // 1. Tilt centerpiece container in 3D
    if (visual3D && !prefersReducedMotion) {
      visual3D.style.transform = `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`;
    }

    // 2. Parallax move isolated vector plates independently
    artifacts.forEach(artifact => {
      if (prefersReducedMotion) return;
      const depth = parseFloat(artifact.getAttribute('data-depth')) || 0.08;
      
      // Calculate dynamic translations
      const tx = mouse.x * depth * 220;
      const ty = mouse.y * depth * 220;
      
      // Assign custom variables for layout styling to keep inline code clean
      artifact.style.setProperty('--tx', `${tx}px`);
      artifact.style.setProperty('--ty', `${ty}px`);

      // Modify the standard translate rules without breaking active class overrides
      if (!artifact.classList.contains('is-focused') && !artifact.classList.contains('is-blurred')) {
        let baseTransform = '';
        if (artifact.classList.contains('intro-artifact--gold')) {
          baseTransform = `translate3d(calc(-35px + ${tx}px), calc(-30px + ${ty}px), 30px) rotate(-8deg)`;
        } else if (artifact.classList.contains('intro-artifact--diamond')) {
          baseTransform = `translate3d(calc(40px + ${tx}px), calc(15px + ${ty}px), 60px) rotate(12deg)`;
        } else if (artifact.classList.contains('intro-artifact--bridal')) {
          baseTransform = `translate3d(calc(-20px + ${tx}px), calc(50px + ${ty}px), 10px) rotate(-15deg)`;
        }
        artifact.style.transform = baseTransform;
      }
    });

    // 3. Render Canvas Particles
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Filter out dead particles and draw alive ones
      particles = particles.filter(p => {
        p.update(time);
        if (p.alpha <= 0 || p.y < -10 || p.x < -10 || p.x > canvas.width + 10) {
          return false;
        }
        p.draw();
        return true;
      });

      // Maintain a steady drift count of gold stardust particles
      if (particles.filter(p => !p.size || p.size < 2).length < baseCount) {
        particles.push(new DustParticle(undefined, canvas.height + 5));
      }
    }

    animationFrameId = requestAnimationFrame(tick);
  };

  tick();

  // Cleanup on page transitions / teardown
  window.addEventListener('beforeunload', () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
  });
});
