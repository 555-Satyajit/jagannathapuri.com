const express = require('express');
const router = express.Router();
const newsletterController = require('../controllers/newsletterController');

// Newsletter routes
router.post('/newsletter/subscribe', newsletterController.subscribeNewsletter);

module.exports = router;
