/**
 * CONTACT INTERACTIVE ENGINE
 * 3D Glass Card Tilts, Coordinate Spotlights, Floating Gold Dust Canvas,
 * Slow Rotating Jaali, Magnetic CTAs, and a Custom 3D Medallion Success Modal.
 *
 * Patel Jewellers Mehsanawala
 */

document.addEventListener('DOMContentLoaded', () => {
  const contactSection = document.getElementById('contact');
  if (!contactSection) return;

  // ==========================================
  // 1. CANVAS PARTICLE SYSTEM (Gold & Burgundy Sparks)
  // ==========================================
  const canvas = document.getElementById('contact-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let width = (canvas.width = contactSection.offsetWidth);
    let height = (canvas.height = contactSection.offsetHeight);
    let mouse = { x: null, y: null, active: false };

    // Handle section size updates
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        width = canvas.width = entry.contentRect.width;
        height = canvas.height = entry.contentRect.height;
        initParticles();
      }
    });
    resizeObserver.observe(contactSection);

    class LuxurySpark {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height + height; // Spawn at bottom
        this.size = Math.random() * 4 + 1.2;
        this.speedY = -(Math.random() * 0.6 + 0.2); // Slowly rise
        this.speedX = Math.random() * 0.3 - 0.15;
        this.flickerSpeed = Math.random() * 0.015 + 0.005;
        this.opacity = Math.random() * 0.5 + 0.2;
        
        // Brand palette sparks
        const colors = [
          'rgba(212, 175, 55, ',  // Warm Gold
          'rgba(155, 27, 42, ',  // Royal Burgundy
          'rgba(176, 168, 154, ', // Antique Silver/Taupe
          'rgba(244, 235, 219, '  // Cozy Ivory
        ];
        this.colorPrefix = colors[Math.floor(Math.random() * colors.length)];
        this.angle = Math.random() * Math.PI * 2;
        this.waveSpeed = Math.random() * 0.015 + 0.002;
        this.waveAmplitude = Math.random() * 1.2;
      }

      update() {
        this.y += this.speedY;
        this.angle += this.waveSpeed;
        this.x += this.speedX + Math.sin(this.angle) * this.waveAmplitude * 0.1;
        this.opacity += Math.sin(this.angle) * this.flickerSpeed;

        // Ensure opacity stays inside bounds
        if (this.opacity < 0.1) this.opacity = 0.1;
        if (this.opacity > 0.8) this.opacity = 0.8;

        // Magnetic mouse force
        if (mouse.active && mouse.x !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 220) {
            const force = (220 - dist) / 220;
            // Draw gold dust subtly towards cursor
            this.x += (dx / dist) * force * 0.35;
            this.y += (dy / dist) * force * 0.35;
          }
        }

        // Reset if float out of top or sides
        if (this.y < -20 || this.x < -20 || this.x > width + 20) {
          this.reset();
          this.y = height + 10;
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.colorPrefix + this.opacity + ')';
        
        if (this.size > 3.2) {
          ctx.shadowBlur = 8;
          ctx.shadowColor = 'rgba(212, 175, 55, 0.25)';
        } else {
          ctx.shadowBlur = 0;
        }
        
        ctx.fill();
      }
    }

    function initParticles() {
      particles = [];
      const count = Math.min(Math.floor(width / 40), 40);
      for (let i = 0; i < count; i++) {
        const p = new LuxurySpark();
        p.y = Math.random() * height; // Distribute initial height
        particles.push(p);
      }
    }

    let animId;
    function animate() {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle ambient gold aura under pointer
      if (mouse.active && mouse.x !== null) {
        const aura = ctx.createRadialGradient(
          mouse.x, mouse.y, 5,
          mouse.x, mouse.y, 250
        );
        aura.addColorStop(0, 'rgba(212, 175, 55, 0.03)');
        aura.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = aura;
        ctx.fillRect(0, 0, width, height);
      }

      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      animId = requestAnimationFrame(animate);
    }

    contactSection.addEventListener('mousemove', (e) => {
      const rect = contactSection.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    });

    contactSection.addEventListener('mouseleave', () => {
      mouse.active = false;
    });

    initParticles();
    animate();
  }

  // ==========================================
  // 2. PALACE JAALI SCROLL PARALLAX & ROTATION
  // ==========================================
  const jaali = document.querySelector('.contact-jaali');
  if (jaali) {
    let rotation = 0;
    const rotateJaali = () => {
      rotation += 0.03; // Extremely slow, elegant rotation
      updateJaaliTransform();
      requestAnimationFrame(rotateJaali);
    };

    const updateJaaliTransform = () => {
      const scrollOffset = window.scrollY - contactSection.offsetTop;
      const yOffset = (scrollOffset * 0.1).toFixed(1); // vertical parallax
      jaali.style.transform = `translate3d(-50%, calc(-50% + ${yOffset}px), 0) rotate(${rotation}deg)`;
    };

    requestAnimationFrame(rotateJaali);
  }

  // ==========================================
  // 3. UNIFIED 3D LUXURY CONSOLE TILT & SPOTLIGHT
  // ==========================================
  const consoleCard = document.getElementById('contact-luxury-console');
  const isMobile = () => window.innerWidth < 960;

  if (consoleCard) {
    const spotlight = consoleCard.querySelector('.console-spotlight');
    const logoWrap = consoleCard.querySelector('.concierge-logo-wrap');
    const brandSide = consoleCard.querySelector('.console-brand-side');
    const formSide = consoleCard.querySelector('.console-form-side');
    
    const onMove = (e) => {
      const rect = consoleCard.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Update spotlight position
      if (spotlight) {
        spotlight.style.left = `${x}px`;
        spotlight.style.top = `${y}px`;
      }

      if (isMobile()) return;

      // 3D Tilt calculation (-1 to 1 relative to center)
      const xc = (x - rect.width / 2) / (rect.width / 2);
      const yc = (y - rect.height / 2) / (rect.height / 2);

      // Slow, sophisticated tilt (max 4.5 degrees)
      const rotateX = (-yc * 4.5).toFixed(2);
      const rotateY = (xc * 4.5).toFixed(2);

      consoleCard.style.transform = `perspective(1600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
      
      // Dynamic translations for inner elements for multi-layered holographic parallax
      if (logoWrap) {
        logoWrap.style.transform = `translate3d(${xc * 12}px, ${yc * 12}px, 25px) rotate(${xc * 1.5}deg)`;
      }
      if (brandSide) {
        const title = brandSide.querySelector('.concierge-title');
        const subtitle = brandSide.querySelector('.concierge-subtitle');
        const lead = brandSide.querySelector('.concierge-lead');
        const details = brandSide.querySelector('.concierge-details');
        
        if (title) title.style.transform = `translate3d(${xc * 6}px, ${yc * 6}px, 15px)`;
        if (subtitle) subtitle.style.transform = `translate3d(${xc * 4}px, ${yc * 4}px, 12px)`;
        if (lead) lead.style.transform = `translate3d(${xc * 2}px, ${yc * 2}px, 8px)`;
        if (details) details.style.transform = `translate3d(${xc * 5}px, ${yc * 5}px, 10px)`;
      }
      if (formSide) {
        const titleDesk = formSide.querySelector('.form-title-desk');
        const subtitleDesk = formSide.querySelector('.form-subtitle-desk');
        const formGroups = formSide.querySelectorAll('.form-group-premium');
        
        if (titleDesk) titleDesk.style.transform = `translate3d(${xc * 5}px, ${yc * 5}px, 15px)`;
        if (subtitleDesk) subtitleDesk.style.transform = `translate3d(${xc * 3}px, ${yc * 3}px, 10px)`;
        
        formGroups.forEach((group, index) => {
          const depth = 8 - index * 2;
          group.style.transform = `translate3d(${xc * (4 - index)}px, ${yc * (4 - index)}px, ${depth}px)`;
        });
      }
    };

    const onLeave = () => {
      consoleCard.style.transform = 'perspective(1600px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      consoleCard.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
      
      const resetTransition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
      
      if (logoWrap) {
        logoWrap.style.transform = 'translateZ(20px)';
        logoWrap.style.transition = resetTransition;
      }
      if (brandSide) {
        const title = brandSide.querySelector('.concierge-title');
        const subtitle = brandSide.querySelector('.concierge-subtitle');
        const lead = brandSide.querySelector('.concierge-lead');
        const details = brandSide.querySelector('.concierge-details');
        
        if (title) { title.style.transform = 'translateZ(15px)'; title.style.transition = resetTransition; }
        if (subtitle) { subtitle.style.transform = 'translateZ(12px)'; subtitle.style.transition = resetTransition; }
        if (lead) { lead.style.transform = 'translateZ(8px)'; lead.style.transition = resetTransition; }
        if (details) { details.style.transform = 'translateZ(10px)'; details.style.transition = resetTransition; }
      }
      if (formSide) {
        const titleDesk = formSide.querySelector('.form-title-desk');
        const subtitleDesk = formSide.querySelector('.form-subtitle-desk');
        const formGroups = formSide.querySelectorAll('.form-group-premium');
        
        if (titleDesk) { titleDesk.style.transform = 'translateZ(15px)'; titleDesk.style.transition = resetTransition; }
        if (subtitleDesk) { subtitleDesk.style.transform = 'translateZ(10px)'; subtitleDesk.style.transition = resetTransition; }
        formGroups.forEach(group => {
          group.style.transform = 'translateZ(0px)';
          group.style.transition = resetTransition;
        });
      }
    };

    const onEnter = () => {
      consoleCard.style.transition = 'none';
      if (logoWrap) logoWrap.style.transition = 'none';
      if (brandSide) {
        const elements = brandSide.querySelectorAll('.concierge-title, .concierge-subtitle, .concierge-lead, .concierge-details');
        elements.forEach(el => el.style.transition = 'none');
      }
      if (formSide) {
        const elements = formSide.querySelectorAll('.form-title-desk, .form-subtitle-desk, .form-group-premium');
        elements.forEach(el => el.style.transition = 'none');
      }
    };

    consoleCard.addEventListener('mousemove', onMove);
    consoleCard.addEventListener('mouseenter', onEnter);
    consoleCard.addEventListener('mouseleave', onLeave);
  }

  // ==========================================
  // 5. MAGNETIC BUTTON CTA
  // ==========================================
  const ctaBtn = document.getElementById('contact-submit-btn');
  if (ctaBtn) {
    ctaBtn.addEventListener('mousemove', (e) => {
      const rect = ctaBtn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      // Draw button by 25% of cursor offset
      ctaBtn.style.transform = `translate3d(${x * 0.25}px, ${y * 0.25}px, 0)`;
      
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

  // ==========================================
  // 6. FORM SUBMISSION AJAX & CONFETTI PETALS
  // ==========================================
  const contactForm = document.getElementById('premium-contact-form');
  const successModal = document.getElementById('contact-success-modal');
  const closeModalBtn = document.getElementById('close-success-btn');

  if (contactForm && successModal) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = document.getElementById('contact-submit-btn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.querySelector('span').innerText = 'Submitting...';
      }

      const formData = new FormData(contactForm);
      const payload = {};
      formData.forEach((value, key) => {
        payload[key] = value;
      });

      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();
        if (result.success) {
          // Reset form fields
          contactForm.reset();
          
          // Open Premium 3D Success Modal
          successModal.classList.add('is-active');
          successModal.setAttribute('aria-hidden', 'false');
          document.body.style.overflow = 'hidden'; // Lock background scroll

          // Trigger gold and burgundy blossom confetti burst
          triggerRoyalConfetti();
        } else {
          alert(result.message || 'Submission error. Please try again.');
        }
      } catch (err) {
        console.error('AJAX Contact Submit Failed:', err);
        alert('Server unreachable. Please verify connection.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.querySelector('span').innerText = 'Send Message';
        }
      }
    });

    // Close success modal
    const closeModal = () => {
      successModal.classList.remove('is-active');
      successModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = ''; // Unlock scroll
      
      // Clean up any surviving confetti elements
      const activeConfetti = document.querySelectorAll('.confetti-blossom');
      activeConfetti.forEach(c => c.remove());
    };

    closeModalBtn.addEventListener('click', closeModal);
    successModal.querySelector('.modal-backdrop').addEventListener('click', closeModal);
  }

  // Palace Gold/Burgundy Confetti Blossom Burst Engine
  function triggerRoyalConfetti() {
    const confettiCount = 50;
    const body = document.body;

    for (let i = 0; i < confettiCount; i++) {
      const petal = document.createElement('div');
      petal.className = 'confetti-blossom';

      // Pick a random brand color
      const colors = [
        '#d4af37', // Gold metallic
        '#9b1b2a', // Luxury burgundy
        '#b0a89a', // Taupe
        '#ededec'  // Cream white
      ];
      petal.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

      // Standard sizes
      const size = Math.random() * 12 + 6;
      petal.style.width = `${size}px`;
      petal.style.height = `${size * (Math.random() * 0.4 + 0.6)}px`; // Oval/petal shape
      petal.style.borderRadius = '50% 0 50% 50%'; // Rose/mandala petal curve

      // Start positions at center of screen
      petal.style.left = '50%';
      petal.style.top = `${window.scrollY + window.innerHeight / 2}px`;

      body.appendChild(petal);

      // Random trajectories
      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 15 + 8;
      const xVel = Math.cos(angle) * velocity;
      const yVel = Math.sin(angle) * velocity - 5; // upward bias

      let currentX = 50; // percentage matching left
      let currentY = window.scrollY + window.innerHeight / 2;
      let rotationX = Math.random() * 360;
      let rotationY = Math.random() * 360;
      let rotationZ = Math.random() * 360;

      // Gravity and air drag
      let xForce = xVel;
      let yForce = yVel;
      const gravity = 0.35;
      const drag = 0.96;

      const fly = () => {
        xForce *= drag;
        yForce = (yForce + gravity) * drag;

        // Convert percentage X offset into absolute pixel adjustments
        const pxOffset = xForce;
        const newLeft = (window.innerWidth / 2) + (currentX - 50) * (window.innerWidth / 100) + pxOffset;
        
        currentY += yForce;
        
        // Map back to relative left
        currentX = ((newLeft / window.innerWidth) * 100);

        rotationX += Math.random() * 5;
        rotationY += Math.random() * 8;
        rotationZ += Math.random() * 4;

        petal.style.left = `${currentX}%`;
        petal.style.top = `${currentY}px`;
        petal.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg) rotateZ(${rotationZ}deg)`;

        // Remove element when it falls past screen bottom
        if (currentY > window.scrollY + window.innerHeight + 100) {
          petal.remove();
        } else {
          requestAnimationFrame(fly);
        }
      };

      requestAnimationFrame(fly);
    }
  }
});
