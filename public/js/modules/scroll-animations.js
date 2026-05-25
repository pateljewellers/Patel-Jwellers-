document.addEventListener('DOMContentLoaded', () => {
  const elements = document.querySelectorAll('.animate-on-scroll');

  if (!elements.length) return;

  if (!('IntersectionObserver' in window)) {
    elements.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -40px 0px', threshold: 0.1 }
  );

  elements.forEach((el) => observer.observe(el));
});
