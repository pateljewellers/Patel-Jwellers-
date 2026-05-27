/**
 * CUSTOM DESIGN PROCESS INTERACTIVE MOTION ENGINE
 * 3D Card Hover Perspective Tilts, Coordinate-specific spotlight shine,
 * and Scroll-driven Glowing Timeline Progress tracker with card activation triggers.
 *
 * Patel Jewellers Mehsanawala
 */

document.addEventListener('DOMContentLoaded', () => {
  const section = document.getElementById('custom-design');
  if (!section) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // =====================================================
  // 1. SCROLL-DRIVEN TIMELINE PROGRESS TRACKER
  // =====================================================
  const progressLine = document.getElementById('process-timeline-progress');
  const stepCards    = Array.from(section.querySelectorAll('.process-step'));
  let rafId = null;
  let lerpedProgress = 0;

  // Track hover coordinate tilting states
  let cardTilt = { x: 0, y: 0, tx: 0, ty: 0 };
  let activeCardIdx = -1;

  const updateTimelineProgress = () => {
    if (!progressLine) return;

    const sectionRect = section.getBoundingClientRect();
    const vh = window.innerHeight;

    // Timeline animates as section scrolls through viewport
    const start = vh * 0.85; // starts drawing when section enters screen
    const end = vh * 0.25;   // completes drawing when section reaches near center
    const targetProgress = Math.max(0, Math.min(1, (start - sectionRect.top) / (start - end)));

    // Smooth LERP transition (8% interpolation speed)
    lerpedProgress += (targetProgress - lerpedProgress) * 0.08;

    const isDesktop = window.innerWidth >= 1024;

    // Apply translation progress
    if (isDesktop) {
      progressLine.style.width = `${(lerpedProgress * 100).toFixed(2)}%`;
      progressLine.style.height = '100%';
    } else {
      progressLine.style.height = `${(lerpedProgress * 100).toFixed(2)}%`;
      progressLine.style.width = '100%';
    }

    // Sequentially activate cards as timeline progress sweeps past their layouts
    stepCards.forEach((card, idx) => {
      // Approximate division slots
      const activationThreshold = (idx) / (stepCards.length - 0.5);
      if (lerpedProgress >= activationThreshold && lerpedProgress > 0.02) {
        if (!card.classList.contains('is-timeline-active')) {
          card.classList.add('is-timeline-active');
        }
      } else {
        if (card.classList.contains('is-timeline-active')) {
          card.classList.remove('is-timeline-active');
        }
      }
    });
  };

  // =====================================================
  // 2. 3D CARD TILT & SPOTLIGHT SHINE COORDINATE ENGINE
  // =====================================================
  if (!prefersReducedMotion) {
    stepCards.forEach((card, idx) => {
      card.addEventListener('mousemove', (e) => {
        activeCardIdx = idx;
        const rect = card.getBoundingClientRect();

        // Mouse coordinates relative to card center [-0.5 to 0.5]
        const cx = (e.clientX - rect.left) / rect.width - 0.5;
        const cy = (e.clientY - rect.top) / rect.height - 0.5;

        // Spotlight highlight positions relative to top-left [0% to 100%]
        const localX = (e.clientX - rect.left) / rect.width * 100;
        const localY = (e.clientY - rect.top) / rect.height * 100;
        card.style.setProperty('--mx', `${localX.toFixed(1)}%`);
        card.style.setProperty('--my', `${localY.toFixed(1)}%`);

        // Micro-tilts (max 10 degrees)
        cardTilt.tx = cy * -10;
        cardTilt.ty = cx * 10;
      }, { passive: true });

      card.addEventListener('mouseleave', () => {
        activeCardIdx = -1;
        cardTilt.tx = 0;
        cardTilt.ty = 0;
        
        // Reset custom shine coordinates slowly to center
        card.style.setProperty('--mx', '50%');
        card.style.setProperty('--my', '50%');
      }, { passive: true });
    });
  }

  // =====================================================
  // 3. MAIN MOTION ANIMATION LOOP
  // =====================================================
  const tick = () => {
    // 3A. Process Scroll Timeline Progress
    updateTimelineProgress();

    // 3B. Process 3D Card Tilting Frame Interpolation
    if (!prefersReducedMotion && activeCardIdx !== -1) {
      cardTilt.x += (cardTilt.tx - cardTilt.x) * 0.1;
      cardTilt.y += (cardTilt.ty - cardTilt.y) * 0.1;

      stepCards.forEach((card, idx) => {
        const inner = card.querySelector('.process-step__inner');
        if (!inner) return;

        if (idx === activeCardIdx) {
          inner.style.transform = `perspective(1000px) rotateX(${cardTilt.x.toFixed(2)}deg) rotateY(${cardTilt.y.toFixed(2)}deg) translateZ(10px)`;
        } else {
          inner.style.transform = '';
        }
      });
    } else if (!prefersReducedMotion) {
      // Clear transform on all cards when mouse leaves section
      stepCards.forEach((card) => {
        const inner = card.querySelector('.process-step__inner');
        if (inner && inner.style.transform !== '') {
          inner.style.transform = '';
        }
      });
    }

    rafId = requestAnimationFrame(tick);
  };

  tick();

  // Clean up animation frames
  window.addEventListener('beforeunload', () => {
    if (rafId) cancelAnimationFrame(rafId);
  });
});
