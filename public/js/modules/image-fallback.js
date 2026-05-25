document.addEventListener('DOMContentLoaded', () => {
  const fallback = '/images/hero/slide-01.jpg';

  document.querySelectorAll('.main-content--home img[src]').forEach((img) => {
    img.addEventListener('error', function onError() {
      if (this.dataset.fallbackApplied) return;
      this.dataset.fallbackApplied = 'true';
      this.src = fallback;
    });
  });
});
