document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('site-header');
  const hero = document.getElementById('home-hero');
  const parallaxMedia = document.querySelector('[data-parallax="hero"]');

  if (header && hero) {
    header.classList.add('is-solid');
    const onHeroScroll = () => {
      const heroBottom = hero.offsetTop + hero.offsetHeight;
      header.classList.toggle('is-scrolled', window.scrollY > 40);
      header.classList.toggle('is-solid', window.scrollY > heroBottom - 80);
    };
    window.addEventListener('scroll', onHeroScroll, { passive: true });
    onHeroScroll();
  }

  if (parallaxMedia && window.matchMedia('(min-width: 768px)').matches) {
    window.addEventListener(
      'scroll',
      () => {
        const scrollY = window.scrollY;
        const heroHeight = hero ? hero.offsetHeight : 600;
        if (scrollY < heroHeight) {
          parallaxMedia.style.transform = `translate3d(0, ${scrollY * 0.35}px, 0) scale(1.05)`;
        }
      },
      { passive: true }
    );
  }

  const revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .animate-on-scroll');

  if (!revealEls.length) return;

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );

  revealEls.forEach((el) => revealObserver.observe(el));

  document.querySelectorAll('.btn--magnetic').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.08}px, ${y * 0.08}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
});
