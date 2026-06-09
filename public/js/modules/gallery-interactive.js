/**
 * SIGNATURE GALLERY INTERACTIVE SCROLL PINNING & SCRUBBING ENGINE
 * Coordinates section pinning, progress calculation, LERP interpolation,
 * and smooth image translate scrubbing inside the centered display screen.
 *
 * Patel Jewellers Mehsanawala
 */

document.addEventListener('DOMContentLoaded', () => {
  const section = document.getElementById('signature-gallery');
  const image = document.querySelector('.gallery-scrollable-image');
  const container = document.querySelector('.gallery-scrollable-image-container');
  const header = document.querySelector('.gallery-header');

  if (!section || !image || !container) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let currentTranslateY = 0;
  let targetTranslateY = 0;
  let currentHeaderY = 0;
  let targetHeaderY = 0;
  let rafId = null;

  const handleScroll = () => {
    const sectionRect = section.getBoundingClientRect();
    const sectionHeight = section.offsetHeight;
    
    if (sectionHeight <= 0) return;

    // Calculate scroll progress from the moment the section top enters the bottom of the screen
    // to the moment the section scrolls past completely.
    let progress = (window.innerHeight - sectionRect.top) / sectionHeight;
    progress = Math.max(0, Math.min(1, progress));

    // Calculate how many pixels the image can slide inside the screen frame
    const maxImageScroll = image.offsetHeight - container.offsetHeight;

    if (maxImageScroll > 0) {
      targetTranslateY = -progress * maxImageScroll;
    } else {
      targetTranslateY = 0;
    }

    // Translate the header slowly upwards to create a subtle secondary parallax effect (scrolling less)
    if (header) {
      targetHeaderY = -progress * 75; // Slowly moves up to 75px
    }
  };

  // Animation frame loop for linear interpolation (LERP) scroll smoothing
  const tick = () => {
    if (prefersReducedMotion) {
      currentTranslateY = targetTranslateY;
      currentHeaderY = targetHeaderY;
    } else {
      currentTranslateY += (targetTranslateY - currentTranslateY) * 0.085; // Smooth LERP factor
      currentHeaderY += (targetHeaderY - currentHeaderY) * 0.085;
    }
    
    image.style.transform = `translate3d(0, ${currentTranslateY.toFixed(2)}px, 0)`;
    if (header) {
      header.style.transform = `translate3d(0, ${currentHeaderY.toFixed(2)}px, 0)`;
    }
    rafId = requestAnimationFrame(tick);
  };

  // Attach event listeners
  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', handleScroll, { passive: true });

  // Initialize once image is fully loaded to fetch correct clientHeight
  if (image.complete) {
    handleScroll();
  } else {
    image.addEventListener('load', () => {
      handleScroll();
    });
  }

  // Double check after window loads and layout settles
  window.addEventListener('load', handleScroll, { passive: true });

  // Kick off requestAnimationFrame LERP loop
  tick();

  // Cleanup loops on page leave
  window.addEventListener('beforeunload', () => {
    if (rafId) cancelAnimationFrame(rafId);
  });
});
