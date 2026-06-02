const fs = require('fs');
const path = require('path');
const { getPageMeta } = require('../config/navigation');
const homeContent = require('../config/home-content');
const aboutContent = require('../config/about-content');
const collectionContent = require('../config/collection-content');

const registrationFile = path.join(__dirname, '../..', 'data', 'shagun-registrations.json');
const inquiriesFile = path.join(__dirname, '../..', 'data', 'contact-inquiries.json');

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

function submitShagunRegistration(req, res) {
  try {
    const registration = {
      ...req.body,
      ip: req.ip,
      receivedAt: new Date().toISOString(),
    };

    if (!fs.existsSync(registrationFile)) {
      fs.mkdirSync(path.dirname(registrationFile), { recursive: true });
      fs.writeFileSync(registrationFile, '[]', 'utf8');
    }

    const rawData = fs.readFileSync(registrationFile, 'utf8');
    const items = Array.isArray(JSON.parse(rawData)) ? JSON.parse(rawData) : [];
    items.push(registration);
    fs.writeFileSync(registrationFile, JSON.stringify(items, null, 2), 'utf8');

    res.json({ success: true });
  } catch (error) {
    console.error('Shagun registration save failed:', error);
    res.status(500).json({ success: false, message: 'Unable to save registration.' });
  }
}

function submitContactInquiry(req, res) {
  try {
    const inquiry = {
      ...req.body,
      ip: req.ip,
      receivedAt: new Date().toISOString(),
    };

    if (!fs.existsSync(inquiriesFile)) {
      fs.mkdirSync(path.dirname(inquiriesFile), { recursive: true });
      fs.writeFileSync(inquiriesFile, '[]', 'utf8');
    }

    const rawData = fs.readFileSync(inquiriesFile, 'utf8');
    const items = Array.isArray(JSON.parse(rawData)) ? JSON.parse(rawData) : [];
    items.push(inquiry);
    fs.writeFileSync(inquiriesFile, JSON.stringify(items, null, 2), 'utf8');

    res.json({ success: true });
  } catch (error) {
    console.error('Contact inquiry save failed:', error);
    res.status(500).json({ success: false, message: 'Unable to save inquiry.' });
  }
}

function getHeritagePage(req, res) {
  const meta = getPageMeta('collection');
  const categorySlug = req.params.category || 'heritage';
  // Capitalise the slug for a nice title
  const categoryLabel = categorySlug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
  res.render('pages/heritage-jewellery', {
    title: `${categoryLabel} | Patel Jewellers`,
    description: 'Immerse yourself in our premium royal gold and handcrafted diamond heritage bridal masterpieces.',
    page: 'heritage-jewellery',
    bodyClass: 'page-heritage-jewellery',
    collection: collectionContent,
    categorySlug,
    categoryLabel,
  });
}

function getTempleBanglesPage(req, res) {
  const meta = getPageMeta('temple-bangles');
  res.render('pages/temple-bangles', {
    title: meta.title,
    description: meta.description,
    page: 'temple-bangles',
    bodyClass: 'page-temple-bangles',
  });
}

module.exports = {
  getHomePage,
  getAboutPage,
  getCollectionPage,
  getHeritagePage,
  getTempleBanglesPage,
  getShagunPage: renderPage('shagun', 'pages/shagun-registration'),
  submitShagunRegistration,
  submitContactInquiry,
  getGalleryPage: renderPage('gallery', 'pages/gallery'),
  getCustomDesignPage: renderPage('custom-design', 'pages/custom-design'),
  getTestimonialsPage: renderPage('testimonials', 'pages/testimonials'),
  getBlogPage: renderPage('blog', 'pages/blog'),
  getContactPage: renderPage('contact', 'pages/contact'),
};
