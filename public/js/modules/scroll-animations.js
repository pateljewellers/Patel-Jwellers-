document.addEventListener('DOMContentLoaded', () => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const flyDirections = [
    'reveal-fly--from-left',
    'reveal-fly--from-right',
    'reveal-fly--from-top',
    'reveal-fly--from-bottom',
    'reveal-fly--from-far',
  ];

  document.querySelectorAll('[data-fly]').forEach((el) => {
    el.classList.add('reveal-fly', `reveal-fly--from-${el.dataset.fly}`);
  });

  document.querySelectorAll('.stagger-group').forEach((group) => {
    const children = group.querySelectorAll(
      '.collection-card, .gallery-item, .gallery-3d-card, .process-step, .testimonial-card, .social-grid__item'
    );
    const step = parseInt(group.dataset.stagger, 10) || 130;
    children.forEach((child, i) => {
      child.style.setProperty('--stagger-index', i);
      child.style.setProperty('--stagger-step', `${step}ms`);

      const flyTarget = child.querySelector('.img-fly');
      if (flyTarget) {
        flyTarget.classList.add('reveal-fly', flyDirections[i % flyDirections.length]);
        if (!child.classList.contains('reveal-up')) {
          child.classList.add('reveal-up');
        }
      } else if (
        child.classList.contains('gallery-item') ||
        child.classList.contains('gallery-3d-card') ||
        child.classList.contains('social-grid__item')
      ) {
        child.classList.add('reveal-up');
      } else if (!child.classList.contains('reveal-up')) {
        child.classList.add('reveal-up');
      }
    });
  });

  document.querySelectorAll('.img-fly').forEach((el) => {
    if (!el.classList.contains('reveal-fly')) {
      el.classList.add('reveal-fly', flyDirections[0]);
    }
  });

  const revealSelectors = [
    '.scroll-section',
    '.reveal-up',
    '.reveal-down',
    '.reveal-left',
    '.reveal-right',
    '.reveal-scale',
    '.reveal-blur',
    '.reveal-rotate',
    '.reveal-fly',
    '.animate-on-scroll',
  ].join(',');

  const elements = document.querySelectorAll(revealSelectors);

  if (reducedMotion || !elements.length) {
    elements.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  if (!('IntersectionObserver' in window)) {
    elements.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        } else if (entry.boundingClientRect.top > window.innerHeight || entry.boundingClientRect.bottom < 0) {
          entry.target.classList.remove('is-visible');
        }
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );

  elements.forEach((el) => observer.observe(el));

  requestAnimationFrame(() => {
    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
        el.classList.add('is-visible');
      }
    });
  });

  const parallaxEls = document.querySelectorAll('[data-parallax="soft"]');
  if (parallaxEls.length && !reducedMotion) {
    let ticking = false;
    const updateParallax = () => {
      const vh = window.innerHeight;
      parallaxEls.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > vh) return;
        const offset = (rect.top + rect.height / 2 - vh / 2) * 0.03;
        el.style.transform = `translate3d(0, ${offset}px, 0)`;
      });
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
    updateParallax();
  }
});
