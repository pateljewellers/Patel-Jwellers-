/**
 * SHOWROOM INTERACTIVE ENGINE
 * 3D dome card tilt, floating light gold canvas particles,
 * slowly rotating heritage mandala, and magnetic button attraction.
 *
 * Patel Jewellers Mehsanawala
 */

document.addEventListener('DOMContentLoaded', () => {
  const showroomSection = document.getElementById('showroom');
  if (!showroomSection) return;

  // 1. CANVAS PARTICLE SYSTEM (Gold Dust / Light Orbs)
  const canvas = document.getElementById('showroom-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let width = (canvas.width = showroomSection.offsetWidth);
    let height = (canvas.height = showroomSection.offsetHeight);
    let mouse = { x: null, y: null, active: false };

    // Resize observer to ensure full canvas coverage
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        width = canvas.width = entry.contentRect.width;
        height = canvas.height = entry.contentRect.height;
        initParticles();
      }
    });
    resizeObserver.observe(showroomSection);

    // Particle Object
    class GoldDust {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height + height; // Start below bottom
        this.size = Math.random() * 5 + 1.5;
        this.speedY = -(Math.random() * 0.7 + 0.3); // Upwards movement
        this.speedX = Math.random() * 0.4 - 0.2;
        // Warm gold and brand colors with low opacity
        const colors = [
          'rgba(212, 175, 55, 0.18)', // Gold
          'rgba(176, 168, 154, 0.22)', // Antique Gold/Silver
          'rgba(155, 27, 42, 0.06)',  // Subtle Burgundy Blush
          'rgba(244, 235, 219, 0.3)'   // Warm Cream light
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.angle = Math.random() * Math.PI * 2;
        this.waveSpeed = Math.random() * 0.02 + 0.005;
        this.waveAmplitude = Math.random() * 1.5;
      }

      update() {
        this.y += this.speedY;
        this.angle += this.waveSpeed;
        this.x += this.speedX + Math.sin(this.angle) * this.waveAmplitude * 0.1;

        // Interaction with mouse wind
        if (mouse.active && mouse.x !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 250) {
            // Gentle wind force towards cursor
            const force = (250 - dist) / 250;
            this.x += (dx / dist) * force * 0.4;
            this.y += (dy / dist) * force * 0.4;
          }
        }

        // Reset if particle floats out of bounds
        if (this.y < -20 || this.x < -20 || this.x > width + 20) {
          this.reset();
          this.y = height + 10;
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        
        // Add native canvas shadow glow to larger particles
        if (this.size > 4) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = 'rgba(212, 175, 55, 0.3)';
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fill();
      }
    }

    function initParticles() {
      particles = [];
      const particleCount = Math.min(Math.floor(width / 35), 45);
      for (let i = 0; i < particleCount; i++) {
        const p = new GoldDust();
        // Stagger their initial Y positions across the whole height
        p.y = Math.random() * height;
        particles.push(p);
      }
    }

    // Animation Loop
    let animationId;
    function animate() {
      ctx.clearRect(0, 0, width, height);
      
      // Draw a subtle soft gold spotlight under cursor
      if (mouse.active && mouse.x !== null) {
        const gradient = ctx.createRadialGradient(
          mouse.x, mouse.y, 10,
          mouse.x, mouse.y, 300
        );
        gradient.addColorStop(0, 'rgba(212, 175, 55, 0.04)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }

      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      animationId = requestAnimationFrame(animate);
    }

    // Listeners for mouse velocity / gravity
    showroomSection.addEventListener('mousemove', (e) => {
      const rect = showroomSection.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    });

    showroomSection.addEventListener('mouseleave', () => {
      mouse.active = false;
    });

    initParticles();
    animate();
  }

  // 2. 3D ARCH TILT EFFECT (Mouse tracking)
  const archCard = document.getElementById('showroom-arch-card');
  const archCardWrap = document.querySelector('.showroom-arch-card-wrap');
  
  if (archCard && archCardWrap) {
    let bounds;
    
    const updateTilt = (e) => {
      if (!bounds) return;
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const left = bounds.left;
      const top = bounds.top;
      const width = bounds.width;
      const height = bounds.height;
      
      // Calculate coordinates from card center (-1 to 1)
      const x = (mouseX - left - width / 2) / (width / 2);
      const y = (mouseY - top - height / 2) / (height / 2);
      
      // Limit rotations (tilt up to 10 degrees)
      const rotateX = (-y * 10).toFixed(2);
      const rotateY = (x * 10).toFixed(2);
      
      // Parallax offset inside card elements
      const shadowX = (x * 20).toFixed(1);
      const shadowY = (y * 20).toFixed(1);

      archCard.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      archCard.style.boxShadow = `${-shadowX}px ${-shadowY}px 35px rgba(42, 42, 42, 0.12), 0 20px 45px rgba(155, 27, 42, 0.08)`;
      
      // Parallax secondary element (brass filigrees and image shifting)
      const img = archCard.querySelector('.showroom-main-img');
      if (img) {
        img.style.transform = `scale(1.08) translate3d(${-x * 8}px, ${-y * 8}px, 0)`;
      }

      // Parallax floating leaf/ornaments
      const tags = archCard.querySelector('.showroom-tag');
      if (tags) {
        tags.style.transform = `translate3d(${x * 12}px, ${y * 12}px, 20px)`;
      }
    };

    archCardWrap.addEventListener('mouseenter', () => {
      bounds = archCardWrap.getBoundingClientRect();
      archCard.style.transition = 'transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.15s ease';
      const img = archCard.querySelector('.showroom-main-img');
      if (img) img.style.transition = 'transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    });

    archCardWrap.addEventListener('mousemove', updateTilt);

    archCardWrap.addEventListener('mouseleave', () => {
      // Reset tilt smoothly
      archCard.style.transition = 'transform 0.65s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.65s ease';
      archCard.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      archCard.style.boxShadow = '';
      
      const img = archCard.querySelector('.showroom-main-img');
      if (img) {
        img.style.transition = 'transform 0.65s cubic-bezier(0.25, 1, 0.5, 1)';
        img.style.transform = 'scale(1.0) translate3d(0, 0, 0)';
      }

      const tags = archCard.querySelector('.showroom-tag');
      if (tags) {
        tags.style.transform = '';
      }
    });
  }

  // 3. BACKGROUND HERITAGE MANDALA PARALLAX
  const mandala = document.querySelector('.showroom-mandala');
  if (mandala) {
    let rotationAngle = 0;
    
    // Smooth infinite rotation
    const rotateMandala = () => {
      rotationAngle += 0.05;
      updateMandalaTransform();
      requestAnimationFrame(rotateMandala);
    };

    const updateMandalaTransform = () => {
      // Incorporate scroll parallax
      const scrollOffset = window.scrollY - showroomSection.offsetTop;
      const yOffset = (scrollOffset * 0.12).toFixed(1);
      mandala.style.transform = `translate3d(-50%, calc(-50% + ${yOffset}px), 0) rotate(${rotationAngle}deg)`;
    };
    
    // Run the infinite rotation
    requestAnimationFrame(rotateMandala);
  }

  // 4. MAGNETIC CTA BUTTON
  const ctaBtn = document.getElementById('showroom-cta-btn');
  if (ctaBtn) {
    ctaBtn.addEventListener('mousemove', (e) => {
      const rect = ctaBtn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      // Pull button towards cursor by 25% of distance
      ctaBtn.style.transform = `translate3d(${x * 0.25}px, ${y * 0.25}px, 0)`;
      
      // Pull arrow icon slightly more (exaggerated depth)
      const arrow = ctaBtn.querySelector('.btn-arrow');
      if (arrow) {
        arrow.style.transform = `translate3d(${x * 0.15}px, ${y * 0.1}px, 0) scale(1.1)`;
      }
    });

    ctaBtn.addEventListener('mouseleave', () => {
      ctaBtn.style.transition = 'transform 0.45s cubic-bezier(0.23, 1, 0.32, 1)';
      ctaBtn.style.transform = 'translate3d(0, 0, 0)';
      
      const arrow = ctaBtn.querySelector('.btn-arrow');
      if (arrow) {
        arrow.style.transition = 'transform 0.45s cubic-bezier(0.23, 1, 0.32, 1)';
        arrow.style.transform = '';
      }
    });

    ctaBtn.addEventListener('mouseenter', () => {
      ctaBtn.style.transition = 'none';
      const arrow = ctaBtn.querySelector('.btn-arrow');
      if (arrow) arrow.style.transition = 'none';
    });
  }
});
