document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('site-header');

  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
});
