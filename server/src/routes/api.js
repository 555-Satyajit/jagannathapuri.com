const express = require('express');
const router = express.Router();
const newsletterController = require('../controllers/newsletterController');

const configStore = require('../lib/configStore');

// Site Config route for Next.js SEO
router.get('/site-config', async (req, res) => {
    try {
        const config = await configStore.getConfig();
        res.json(config);
    } catch (error) {
        console.error('Error fetching site config:', error);
        res.status(500).json({ error: 'Failed to load site config' });
    }
});

// Newsletter routes
router.post('/newsletter/subscribe', newsletterController.subscribeNewsletter);

module.exports = router;
