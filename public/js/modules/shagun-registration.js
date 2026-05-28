document.addEventListener('DOMContentLoaded', () => {
  if (!document.querySelector('.page-shagun')) return;

  const form = document.getElementById('shagun-registration-form');
  const steps = Array.from(document.querySelectorAll('.shagun-form-step'));
  const progressItems = Array.from(document.querySelectorAll('.shagun-progress__item'));
  const nextButtons = Array.from(document.querySelectorAll('[data-action="next-step"]'));
  const backButtons = Array.from(document.querySelectorAll('[data-action="prev-step"]'));
  const note = document.getElementById('shagun-submit-note');
  const successContainer = document.getElementById('shagun-success-message');
  const agreeInput = form.querySelector('#agreeTerms');

  const savedState = JSON.parse(window.localStorage.getItem('shagunRegistration') || '{}');
  let currentStep = savedState.currentStep || 0;
  const state = {
    currentStep,
    values: savedState.values || {},
  };

  function updateProgress() {
    progressItems.forEach((item, index) => {
      item.classList.toggle('is-active', index === state.currentStep);
      item.classList.toggle('is-complete', index < state.currentStep);
    });
  }

  function showStep(index) {
    steps.forEach((step, stepIndex) => {
      step.classList.toggle('is-active', stepIndex === index);
    });
    state.currentStep = index;
    updateProgress();
    window.scrollTo({ top: form.offsetTop - 60, behavior: 'smooth' });
    saveState();
  }

  function saveState() {
    window.localStorage.setItem('shagunRegistration', JSON.stringify(state));
  }

  function loadInputs() {
    const inputs = form.querySelectorAll('[name]');
    inputs.forEach((input) => {
      const name = input.name;
      if (!name || !(name in state.values)) return;
      if (input.type === 'radio') {
        input.checked = state.values[name] === input.value;
      } else if (input.type === 'checkbox') {
        input.checked = Boolean(state.values[name]);
      } else if (input.type === 'file') {
        // don't restore file contents
      } else {
        input.value = state.values[name];
      }
    });
  }

  function gatherValues() {
    const inputs = form.querySelectorAll('[name]');
    inputs.forEach((input) => {
      if (input.type === 'radio') {
        if (input.checked) state.values[input.name] = input.value;
      } else if (input.type === 'checkbox') {
        state.values[input.name] = input.checked;
      } else if (input.type !== 'file') {
        state.values[input.name] = input.value.trim();
      }
    });
    saveState();
  }

  function validateStep(index) {
    gatherValues();
    const requiredFields = Array.from(steps[index].querySelectorAll('[data-required]'));
    for (const input of requiredFields) {
      if (input.type === 'checkbox') {
        if (!input.checked) {
          note.textContent = 'Please agree to the terms and conditions to proceed.';
          return false;
        }
      } else if (!input.value || !input.value.trim()) {
        note.textContent = 'Please complete all required fields before continuing.';
        input.focus();
        return false;
      }
    }
    note.textContent = '';
    return true;
  }

  nextButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      if (validateStep(state.currentStep)) {
        const next = Math.min(state.currentStep + 1, steps.length - 1);
        showStep(next);
      }
    });
  });

  backButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      const prev = Math.max(state.currentStep - 1, 0);
      showStep(prev);
    });
  });

  form.addEventListener('change', () => {
    gatherValues();
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!validateStep(state.currentStep)) return;
    if (!agreeInput.checked) {
      note.textContent = 'You must agree to the terms before submitting.';
      return;
    }

    gatherValues();

    const payload = {
      submittedAt: new Date().toISOString(),
      brideName: state.values.brideName || '',
      mobileNumber: state.values.mobileNumber || '',
      dateOfBirth: state.values.dateOfBirth || '',
      fullAddress: state.values.fullAddress || '',
      pinCode: state.values.pinCode || '',
      city: state.values.city || '',
      weddingDate: state.values.weddingDate || '',
      weddingVenue: state.values.weddingVenue || '',
      referenceName: state.values.referenceName || '',
      identityProof: form.querySelector('#identityProof').files[0]?.name || state.values.identityProof || '',
      weddingProof: form.querySelector('#weddingProof').files[0]?.name || state.values.weddingProof || '',
      agreedTerms: Boolean(state.values.agreeTerms),
    };

    try {
      const response = await fetch('/shagun-registration/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.success) {
        window.localStorage.removeItem('shagunRegistration');
        form.innerHTML = `<div class="shagun-success"><h3>Registration Complete</h3><p>Your Shagun Bridal Registration request has been received. Our team will contact you shortly to begin consultation and jewellery planning.</p></div>`;
      } else {
        note.textContent = result.message || 'Unable to submit at the moment. Please try again later.';
      }
    } catch (error) {
      note.textContent = 'Unable to submit at the moment. Please check your connection and try again.';
      console.error(error);
    }
  });

  loadInputs();
  updateProgress();
  showStep(state.currentStep);
});

document.addEventListener('DOMContentLoaded', () => {
  if (!document.querySelector('.page-shagun')) return;

  // --- 1. DYNAMIC GOLD DUST BACKGROUND ENGINE ---
  const particlesContainer = document.getElementById('hero-particles');
  if (particlesContainer) {
    const particleCount = 25; // Number of active floating gold dots
    
    for (let i = 0; i < particleCount; i++) {
      createGoldParticle(particlesContainer);
    }
  }

  function createGoldParticle(container) {
    const particle = document.createElement('div');
    particle.classList.add('gold-dust-particle');
    
    // Randomize specs for a natural 3D depth feeling
    const size = Math.random() * 5 + 2; // Size between 2px and 7px
    const duration = Math.random() * 12 + 8; // Speed between 8s and 20s
    const delay = Math.random() * -20; // Pre-fill screen instantly
    const initialLeft = Math.random() * 100; // X position percentage

    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${initialLeft}%`;
    particle.style.animationDuration = `${duration}s`;
    particle.style.animationDelay = `${delay}s`;
    
    // Add subtle variation in glow intensity
    particle.style.opacity = Math.random() * 0.6 + 0.2;

    container.appendChild(particle);

    // Recycle particle after animation completes to keep it memory clean
    particle.addEventListener('animationend', () => {
      particle.remove();
      createGoldParticle(container);
    });
  }


  // --- 2. INTERACTIVE 3D CARD MOUSE TRACKING ---
  const cardWrapper = document.querySelector('.shagun-card-3d-wrapper');
  const cardFront = document.querySelector('.shagun-card-3d-front');

  if (cardWrapper && cardFront) {
    window.addEventListener('mousemove', (e) => {
      // Calculate depth rotation based on center window vectors
      const xAxis = (window.innerWidth / 2 - e.pageX) / 40;
      const yAxis = (window.innerHeight / 2 - e.pageY) / 40;
      
      cardWrapper.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg) translateY(-6px)`;
    });

    cardFront.addEventListener('mousemove', (e) => {
      const rect = cardFront.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      cardFront.style.setProperty('--mouse-x', `${x}px`);
      cardFront.style.setProperty('--mouse-y', `${y}px`);
    });
    
    window.addEventListener('mouseleave', () => {
      // Return smoothly to idle state animations
      cardWrapper.style.transform = `rotateY(0deg) rotateX(0deg) translateY(0px)`;
    });
  }

  // ... (તમારો બાકીનો ફોર્મ સ્ટેપ્સ અને સબમિશનનો કોડ અહીં નીચે એમનેમ જ રહેશે)
});

document.addEventListener('DOMContentLoaded', () => {
  if (!document.querySelector('.page-shagun')) return;

  // --- 1. BACKGROUND GOLD PARTICLES ENGINE ---
  const particlesContainer = document.getElementById('hero-particles');
  if (particlesContainer) {
    const particleCount = 20; 
    for (let i = 0; i < particleCount; i++) {
      createGoldParticle(particlesContainer);
    }
  }

  function createGoldParticle(container) {
    const particle = document.createElement('div');
    particle.classList.add('gold-dust-particle');
    const size = Math.random() * 5 + 2; 
    const duration = Math.random() * 12 + 8; 
    const delay = Math.random() * -20; 
    const initialLeft = Math.random() * 100; 

    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${initialLeft}%`;
    particle.style.animationDuration = `${duration}s`;
    particle.style.animationDelay = `${delay}s`;
    particle.style.opacity = Math.random() * 0.5 + 0.2;

    container.appendChild(particle);
    particle.addEventListener('animationend', () => {
      particle.remove();
      createGoldParticle(container);
    });
  }


  // --- 2. ADVANCED INTERACTIVE 360° 3D LOGO ROTATION ENGINE ---
  const sanctuaryRoom = document.getElementById('3d-sanctuary-room');
  const logo3D = document.getElementById('interactive-3d-logo');

  if (sanctuaryRoom && logo3D) {
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    
    // Core Rotation variables (Set up starting cinematic angle)
    let rotationY = -15; 
    let rotationX = 10;

    // Auto slow inertia rotation variables
    let velocityY = 0.15; // Makes it slowly spin on idle state
    let velocityX = 0;
    const friction = 0.95; // Smooth slowdown physics

    // Continuous Animation loop for smooth realistic physics
    function update3DPhysicsLoop() {
      if (!isDragging) {
        // Apply passive physics when user is not touching it
        rotationY += velocityY;
        rotationX += velocityX;
        
        // Decay speed smoothly over time
        velocityY *= friction;
        velocityX *= friction;

        // Keep a minimum auto idle spin alive so it never looks completely dead
        if (Math.abs(velocityY) < 0.05) velocityY = 0.08;
      }

      // Render the current angles onto the matrix
      logo3D.style.transform = `rotateY(${rotationY}deg) rotateX(${rotationX}deg)`;
      requestAnimationFrame(update3DPhysicsLoop);
    }

    // Start the physics cycle instantly
    requestAnimationFrame(update3DPhysicsLoop);

    // Mouse & Touch Down Event
    const startDrag = (e) => {
      isDragging = true;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      previousMousePosition = { x: clientX, y: clientY };
    };

    // Dragging / Moving Event
    const handleDrag = (e) => {
      if (!isDragging) return;
      
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - previousMousePosition.x;
      const deltaY = clientY - previousMousePosition.y;

      // Adjust rotation calculation maps
      rotationY += deltaX * 0.5;
      rotationX -= deltaY * 0.5;

      // Capture momentum speeds to animate inertia when released
      velocityY = deltaX * 0.3;
      velocityX = -deltaY * 0.3;

      previousMousePosition = { x: clientX, y: clientY };
    };

    // Stop Dragging Event
    const stopDrag = () => {
      isDragging = false;
    };

    // Bind all desktop and mobile listeners to the Sanctuary Area
    sanctuaryRoom.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', handleDrag);
    window.addEventListener('mouseup', stopDrag);

    sanctuaryRoom.addEventListener('touchstart', startDrag, { passive: true });
    window.addEventListener('touchmove', handleDrag, { passive: false });
    window.addEventListener('touchend', stopDrag);
  }

  // --- 3. SHAGUN INTRO CANVAS PARTICLE ENGINE ---
  const introCanvas = document.getElementById('shagun-intro-canvas');
  if (introCanvas) {
    const introSection = document.getElementById('shagun-intro-section');
    const ictx = introCanvas.getContext('2d');
    let introParticles = [];
    let introBokehs = [];
    let introTime = 0;
    let introRafId = null;
    let introMouse = { x: 0, y: 0, tx: 0, ty: 0, active: false };

    const resizeIntroCanvas = () => {
      if (!introCanvas || !introSection) return;
      const rect = introSection.getBoundingClientRect();
      introCanvas.width = rect.width;
      introCanvas.height = rect.height;
    };
    resizeIntroCanvas();
    window.addEventListener('resize', resizeIntroCanvas, { passive: true });

    // Track mouse inside shagun-intro
    introSection.addEventListener('mousemove', (e) => {
      const rect = introSection.getBoundingClientRect();
      introMouse.tx = e.clientX - rect.left;
      introMouse.ty = e.clientY - rect.top;
      introMouse.active = true;
    }, { passive: true });

    introSection.addEventListener('mouseleave', () => {
      introMouse.active = false;
    }, { passive: true });

    class IntroSparkle {
      constructor(init = false) {
        this.reset(init);
      }
      reset(init = false) {
        this.x = Math.random() * (introCanvas ? introCanvas.width : 500);
        this.y = init ? Math.random() * (introCanvas ? introCanvas.height : 500) : (introCanvas ? introCanvas.height : 500) + 10;
        this.vy = -(Math.random() * 0.5 + 0.15); // Slow rise
        this.vx = (Math.random() - 0.5) * 0.2;
        this.size = Math.random() * 2.2 + 0.6; // Slightly larger sparkles
        this.alpha = Math.random() * 0.65 + 0.25; // Higher minimum visibility
        this.fade = Math.random() * 0.0012 + 0.0004;
        this.color = Math.random() > 0.45 ? 'rgba(202, 161, 90,' : 'rgba(255, 255, 255,'; // Gold or white
        this.swingSpeed = Math.random() * 0.015 + 0.004;
        this.swingAmp = Math.random() * 0.35 + 0.15;
        this.phase = Math.random() * Math.PI * 2;
      }
      update(t) {
        this.x += this.vx + Math.sin(t * this.swingSpeed + this.phase) * this.swingAmp;
        this.y += this.vy;
        this.alpha -= this.fade;

        // Attracted slightly to mouse
        if (introMouse.active) {
          const dx = introMouse.x - this.x;
          const dy = introMouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            const force = (150 - dist) / 150;
            this.x += (dx / dist) * force * 0.22;
            this.y += (dy / dist) * force * 0.22;
          }
        }

        if (this.alpha <= 0 || this.y < -10 || this.x < -10 || this.x > (introCanvas ? introCanvas.width : 500) + 10) {
          this.reset(false);
        }
      }
      draw() {
        if (!ictx) return;
        ictx.save();
        ictx.globalAlpha = Math.max(this.alpha, 0);
        ictx.fillStyle = this.color + this.alpha.toFixed(2) + ')';
        ictx.beginPath();
        if (this.size > 1.3) {
          // Sparkle diamond shape
          ictx.moveTo(this.x, this.y - this.size);
          ictx.lineTo(this.x + this.size, this.y);
          ictx.lineTo(this.x, this.y + this.size);
          ictx.lineTo(this.x - this.size, this.y);
          ictx.closePath();
          ictx.fill();
        } else {
          ictx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ictx.fill();
        }
        ictx.restore();
      }
    }

    class IntroBokeh {
      constructor() {
        this.reset(true);
      }
      reset(init = false) {
        this.x = Math.random() * (introCanvas ? introCanvas.width : 500);
        this.y = init ? Math.random() * (introCanvas ? introCanvas.height : 500) : (introCanvas ? introCanvas.height : 500) + 40;
        this.vy = -(Math.random() * 0.12 + 0.04); // slow rising
        this.vx = (Math.random() - 0.5) * 0.08;
        this.radius = Math.random() * 32 + 12; // Larger bubbles
        this.alpha = Math.random() * 0.045 + 0.015; // Higher contrast bokehs
        this.fade = Math.random() * 0.00012 + 0.00004;
        this.color = Math.random() > 0.4 ? '202, 161, 90' : '155, 27, 42'; // gold or deep red
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
        if (!ictx) return;
        ictx.save();
        ictx.beginPath();
        const grad = ictx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        grad.addColorStop(0, `rgba(${this.color}, ${this.alpha})`);
        grad.addColorStop(0.7, `rgba(${this.color}, ${this.alpha * 0.3})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ictx.fillStyle = grad;
        ictx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ictx.fill();
        ictx.restore();
      }
    }

    for (let i = 0; i < 45; i++) { // Increased particle count
      introParticles.push(new IntroSparkle(true));
    }
    for (let i = 0; i < 8; i++) { // Increased bokeh count
      introBokehs.push(new IntroBokeh());
    }

    const tickIntro = () => {
      introTime++;
      if (!introCanvas || !ictx) return;
      ictx.clearRect(0, 0, introCanvas.width, introCanvas.height);

      introMouse.x += (introMouse.tx - introMouse.x) * 0.08;
      introMouse.y += (introMouse.ty - introMouse.y) * 0.08;

      introBokehs.forEach(b => { b.update(); b.draw(); });
      introParticles.forEach(p => { p.update(introTime); p.draw(); });

      introRafId = requestAnimationFrame(tickIntro);
    };
    tickIntro();

    window.addEventListener('beforeunload', () => {
      if (introRafId) cancelAnimationFrame(introRafId);
    });
  }

  // --- 4. 3D CARD HOVER PERSPECTIVE TILT & PARALLAX ---
  const introCards = document.querySelectorAll('.shagun-intro-card-3d-wrapper');
  introCards.forEach(cardWrapper => {
    const card = cardWrapper.querySelector('.shagun-intro-card-3d');
    if (!card) return;
    
    cardWrapper.addEventListener('mousemove', (e) => {
      const rect = cardWrapper.getBoundingClientRect();
      const x = e.clientX - rect.left; // x coordinate within the element
      const y = e.clientY - rect.top;  // y coordinate within the element
      
      const px = x / rect.width;  // percentage X (0 to 1)
      const py = y / rect.height; // percentage Y (0 to 1)
      
      // Calculate tilt degrees (range: -14 to 14 deg)
      const tiltX = (0.5 - py) * 28; 
      const tiltY = (px - 0.5) * 28;
      
      // Bind exact tilt angles as CSS variables for internal layer shifts
      cardWrapper.style.setProperty('--card-tilt-x', tiltX.toFixed(2));
      cardWrapper.style.setProperty('--card-tilt-y', tiltY.toFixed(2));
      
      // Apply 3D perspective rotation on the wrapper itself
      const idx = cardWrapper.getAttribute('data-tilt-card');
      let defaultXShift = '0px';
      if (window.innerWidth >= 768) {
        if (idx === '0') defaultXShift = '-15px';
        else if (idx === '1') defaultXShift = '35px';
        else if (idx === '2') defaultXShift = '-5px';
      }
      
      cardWrapper.style.transform = `perspective(1200px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateX(${defaultXShift}) scale3d(1.02, 1.02, 1.02)`;
      
      // Update mouse coordinate CSS variables inside the card for the glowing reflection
      card.style.setProperty('--card-mouse-x', `${x.toFixed(1)}px`);
      card.style.setProperty('--card-mouse-y', `${y.toFixed(1)}px`);
    });

    cardWrapper.addEventListener('mouseleave', () => {
      // Smoothly reset CSS variables and revert transformations
      cardWrapper.style.setProperty('--card-tilt-x', '0');
      cardWrapper.style.setProperty('--card-tilt-y', '0');
      
      const idx = cardWrapper.getAttribute('data-tilt-card');
      let defaultTransform = 'translateX(0px)';
      if (window.innerWidth >= 768) {
        if (idx === '0') defaultTransform = 'translateX(-15px)';
        else if (idx === '1') defaultTransform = 'translateX(35px)';
        else if (idx === '2') defaultTransform = 'translateX(-5px)';
      }
      
      cardWrapper.style.transform = `perspective(1200px) rotateX(0deg) rotateY(0deg) ${defaultTransform}`;
      card.style.setProperty('--card-mouse-x', '50%');
      card.style.setProperty('--card-mouse-y', '50%');
    });
  });

  // --- 5. CINEMATIC staggered 3D SCROLL ENTRANCES ---
  const introObserverOptions = {
    root: null,
    threshold: 0.15,
    rootMargin: '0px 0px -60px 0px'
  };

  const introObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-3d-active');
        observer.unobserve(entry.target);
      }
    });
  }, introObserverOptions);

  introCards.forEach(cardWrapper => {
    introObserver.observe(cardWrapper);
  });
});