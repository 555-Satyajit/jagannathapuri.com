const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

router.get('/', cartController.getCart);
router.get('/api', cartController.getCartApi);
router.post('/add', cartController.addItem);
router.post('/update', cartController.updateQuantity);
router.post('/add-bulk', cartController.addBulkItems);
router.post('/sync', cartController.syncCart);
router.post('/remove', cartController.removeItem);
router.get('/similar', cartController.getSimilarProducts);

module.exports = router;
