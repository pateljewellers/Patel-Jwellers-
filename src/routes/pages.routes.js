const express = require('express');
const pagesController = require('../controllers/pages.controller');

const router = express.Router();

router.get('/', pagesController.getHomePage);
router.get('/about', pagesController.getAboutPage);
router.get('/collection', pagesController.getCollectionPage);
router.get('/collection/heritage', pagesController.getHeritagePage);
router.get('/collection/temple-bangles', pagesController.getTempleBanglesPage);
router.get('/collection/:category', pagesController.getHeritagePage);
router.get('/shagun-registration', pagesController.getShagunPage);
router.post('/shagun-registration/submit', pagesController.submitShagunRegistration);
router.get('/contact', pagesController.getContactPage);
router.post('/contact/submit', pagesController.submitContactInquiry);

module.exports = router;
