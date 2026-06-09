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

  // ——— Combined Scroll Animations (Hero Parallax & Brand Intro Dynamic Arch) ———
  const heroEl = document.querySelector('.hero-interactive-container');
  const heroBg = document.querySelector('.hero-bg-parallax');
  const isMobileIOS = /iP(hone|ad|od)/.test(navigator.userAgent);
  const brandIntro = document.getElementById('brand-intro');
  const brandIntroBg = document.querySelector('.brand-intro-bg-parallax');

  if (!reducedMotion) {
    let ticking = false;

    const handleScrollAnimations = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const vh = window.innerHeight;

      // 1. Hero Parallax Content & Background Layers
      if (heroEl && !isMobileIOS) {
        const heroRect = heroEl.getBoundingClientRect();
        if (heroRect.bottom > 0) {
          // Translate background image layer at 15% of scroll speed to accommodate tall combined height
          if (heroBg) {
            heroBg.style.transform = `translate3d(0, ${scrollY * 0.15}px, 0)`;
          }

          // Content layers vertical translations
          const heroContent = heroEl.querySelector('.home-hero__content');
          const canvasEl = heroEl.querySelector('.hero-interactive-canvas');
          const ringsEl = heroEl.querySelector('.parallax-rings-container');
          const tagsEl = heroEl.querySelector('.hero-quicktags');

          if (heroContent) {
            heroContent.style.transform = `translate3d(0, ${scrollY * 0.25}px, 0)`;
            heroContent.style.opacity = Math.max(0, 1 - scrollY / 700);
          }
          if (canvasEl) {
            canvasEl.style.transform = `translate3d(0, ${scrollY * 0.12}px, 0)`;
          }
          if (ringsEl) {
            ringsEl.style.transform = `translate3d(0, ${scrollY * 0.18}px, 0)`;
          }
          if (tagsEl) {
            tagsEl.style.transform = `translate3d(0, ${scrollY * 0.08}px, 0)`;
          }
        }
      }

      // 2. Brand Intro Dynamic Arch Border-Radius & Background Parallax
      if (brandIntro) {
        const rect = brandIntro.getBoundingClientRect();
        if (rect.top < vh && rect.bottom > 0) {
          // Progress of page scrolling down from 0 to 600px
          let scrollProgress = scrollY / 600;
          scrollProgress = Math.max(0, Math.min(1, scrollProgress));

          // Calculate top border-radius based on scrollProgress
          // At scrollY = 0: border-radius is a perfect semicircle arch (50vw or innerWidth / 2)
          // As scrollY increases to 600px: border-radius flattens out smoothly to 24px
          const maxRadius = window.innerWidth / 2;
          const minRadius = 24;
          const currentRadius = maxRadius - (maxRadius - minRadius) * scrollProgress;

          brandIntro.style.borderTopLeftRadius = `${currentRadius}px`;
          brandIntro.style.borderTopRightRadius = `${currentRadius}px`;

          // Parallax for the contained background image
          if (brandIntroBg) {
            // Visibility progress: 0 when top is at bottom of viewport, 1 when top aligns with top of viewport
            let visibilityProgress = (vh - rect.top) / vh;
            visibilityProgress = Math.max(0, Math.min(1, visibilityProgress));
            
            // Translate it vertically inside the section clipping boundary
            const maxTravel = rect.height * 0.22; // 22% of section height safety range
            const yOffset = (visibilityProgress - 0.5) * maxTravel; 
            brandIntroBg.style.transform = `translate3d(0, ${yOffset}px, 0)`;
          }
        }
      }

      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(handleScrollAnimations);
        ticking = true;
      }
    }, { passive: true });

    // Set initial position & styles
    if (heroEl && !isMobileIOS) {
      heroEl.style.backgroundAttachment = 'scroll';
    }
    handleScrollAnimations();
  }
});
