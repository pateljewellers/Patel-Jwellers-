const { getPageMeta } = require('../config/navigation');
const homeContent = require('../config/home-content');
const aboutContent = require('../config/about-content');
const collectionContent = require('../config/collection-content');

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

function getAboutPage(req, res) {
  const meta = getPageMeta('about');
  res.render('pages/about', {
    title: meta.title,
    description: meta.description,
    page: 'about',
    bodyClass: 'page-about',
    about: aboutContent,
  });
}

function getCollectionPage(req, res) {
  const meta = getPageMeta('collection');
  const selectedCategory = req.query.category || collectionContent.defaultCategory;
  const category = collectionContent.categories.find((item) => item.id === selectedCategory) || collectionContent.categories[0];
  const isCategoryView = typeof req.query.category !== 'undefined';

  res.render('pages/collection', {
    title: meta.title,
    description: meta.description,
    page: 'collection',
    bodyClass: 'page-collection',
    collection: collectionContent,
    selectedCategory,
    category,
    isCategoryView,
  });
}

module.exports = {
  getHomePage,
  getAboutPage,
  getCollectionPage,
  getShagunPage: renderPage('shagun', 'pages/shagun-registration'),
  getGalleryPage: renderPage('gallery', 'pages/gallery'),
  getCustomDesignPage: renderPage('custom-design', 'pages/custom-design'),
  getTestimonialsPage: renderPage('testimonials', 'pages/testimonials'),
  getBlogPage: renderPage('blog', 'pages/blog'),
  getContactPage: renderPage('contact', 'pages/contact'),
};
