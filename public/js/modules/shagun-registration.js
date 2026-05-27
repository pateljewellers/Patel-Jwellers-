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