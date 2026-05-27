const express = require('express');
const pagesController = require('../controllers/pages.controller');

const router = express.Router();

router.get('/', pagesController.getHomePage);
router.get('/about', pagesController.getAboutPage);
router.get('/collection', pagesController.getCollectionPage);
router.get('/shagun-registration', pagesController.getShagunPage);
router.post('/shagun-registration/submit', pagesController.submitShagunRegistration);
router.get('/gallery', pagesController.getGalleryPage);
router.get('/custom-design', pagesController.getCustomDesignPage);
router.get('/testimonials', pagesController.getTestimonialsPage);
router.get('/blog', pagesController.getBlogPage);
router.get('/contact', pagesController.getContactPage);
router.post('/contact/submit', pagesController.submitContactInquiry);

module.exports = router;
