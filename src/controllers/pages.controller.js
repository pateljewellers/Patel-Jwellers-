const { getPageMeta } = require('../config/navigation');
const homeContent = require('../config/home-content');

function renderPage(pageId, viewName) {
  return function pageHandler(req, res) {
    const meta = getPageMeta(pageId);
    res.render(viewName, {
      title: meta.title,
      description: meta.description,
      page: pageId,
    });
  };
}

function getHomePage(req, res) {
  const meta = getPageMeta('home');
  res.render('pages/home', {
    title: meta.title,
    description: meta.description,
    page: 'home',
    bodyClass: 'page-home',
    home: homeContent,
  });
}

module.exports = {
  getHomePage,
  getAboutPage: renderPage('about', 'pages/about'),
  getCollectionPage: renderPage('collection', 'pages/collection'),
  getShagunPage: renderPage('shagun', 'pages/shagun-registration'),
  getGalleryPage: renderPage('gallery', 'pages/gallery'),
  getCustomDesignPage: renderPage('custom-design', 'pages/custom-design'),
  getTestimonialsPage: renderPage('testimonials', 'pages/testimonials'),
  getBlogPage: renderPage('blog', 'pages/blog'),
  getContactPage: renderPage('contact', 'pages/contact'),
};
