document.addEventListener('DOMContentLoaded', () => {
  const hero = document.getElementById('home-hero');
  const slider = document.getElementById('hero-slider');
  const track = document.getElementById('hero-track');
  if (!hero || !slider || !track) return;

  const slides = Array.from(track.querySelectorAll('.hero-slide'));
  const captions = Array.from(slider.querySelectorAll('.hero-slide__caption'));
  const dots = Array.from(slider.querySelectorAll('.hero-slider__dot'));
  const prevBtn = document.getElementById('hero-prev');
  const nextBtn = document.getElementById('hero-next');
  const progressBar = document.getElementById('hero-progress');

  if (slides.length < 2) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const intervalMs = parseInt(hero.dataset.slideInterval, 10) || 6500;
  let current = 0;
  let timer = null;
  let touchStartX = 0;
  let isPaused = false;

  hero.style.setProperty('--hero-interval', `${intervalMs}ms`);
  track.style.setProperty('--slide-count', slides.length);

  function goTo(index, direction = 1) {
    const next = (index + slides.length) % slides.length;
    if (next === current) return;

    slider.classList.remove('is-direction-next', 'is-direction-prev');
    slider.classList.add(direction >= 0 ? 'is-direction-next' : 'is-direction-prev');

    slides.forEach((s, i) => s.classList.toggle('is-active', i === next));
    captions.forEach((c, i) => c.classList.toggle('is-active', i === next));
    dots.forEach((d, i) => {
      d.classList.toggle('is-active', i === next);
      d.setAttribute('aria-selected', i === next ? 'true' : 'false');
    });

    track.style.transform = `translate3d(-${next * 100}%, 0, 0)`;
    current = next;
    resetProgress();
  }

  function next() {
    goTo(current + 1, 1);
  }

  function prev() {
    goTo(current - 1, -1);
  }

  function resetProgress() {
    if (!progressBar || reducedMotion) return;
    progressBar.classList.remove('is-animating');
    void progressBar.offsetWidth;
    progressBar.classList.add('is-animating');
  }

  function stopAutoplay() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function startAutoplay() {
    if (reducedMotion || isPaused) return;
    stopAutoplay();
    resetProgress();
    timer = setInterval(next, intervalMs);
  }

  prevBtn?.addEventListener('click', () => {
    prev();
    startAutoplay();
  });

  nextBtn?.addEventListener('click', () => {
    next();
    startAutoplay();
  });

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.dataset.goto, 10);
      if (!Number.isNaN(idx)) {
        goTo(idx, idx > current ? 1 : -1);
        startAutoplay();
      }
    });
  });

  slider.addEventListener('mouseenter', () => {
    isPaused = true;
    stopAutoplay();
  });

  slider.addEventListener('mouseleave', () => {
    isPaused = false;
    startAutoplay();
  });

  slider.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  slider.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 45) {
      if (diff > 0) next();
      else prev();
      startAutoplay();
    }
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAutoplay();
    else startAutoplay();
  });

  if (reducedMotion) {
    track.style.transition = 'none';
  }

  startAutoplay();
});
