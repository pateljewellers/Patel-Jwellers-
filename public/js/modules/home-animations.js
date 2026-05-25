document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('site-header');
  const hero = document.getElementById('home-hero');

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

  document.querySelectorAll('.btn--magnetic').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });

  const heroContent = document.querySelector('.home-hero__content');
  if (heroContent) {
    setTimeout(() => {
      heroContent.querySelectorAll('.reveal-up, .reveal-blur').forEach((el) => {
        el.classList.add('is-visible');
      });
    }, 450);
  }
});
