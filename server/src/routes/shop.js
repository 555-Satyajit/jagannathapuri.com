const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const isAuth = require('../middlewares/authMiddleware');

router.get('/', shopController.getHome);
router.get('/shop', shopController.getShop);
router.get('/about', shopController.getAbout);
router.get('/service', shopController.getService);
router.get('/library', shopController.getLibrary);
router.get('/library/:slug', shopController.getLibraryDetails);
router.get('/panchang', shopController.getPanchang);
router.get('/daily-rituals', shopController.getDailyRituals);
router.get('/api/product/:id', shopController.getProductApi);
router.get('/api/search', shopController.searchApi);
router.get('/product-details/:slug', shopController.getProductDetails);
router.get('/checkout', shopController.getCheckout);
router.post('/checkout', shopController.postCheckout);
router.get('/order-successful', shopController.getOrderSuccessful);
router.get('/wishlist', isAuth, shopController.getWishlist);
router.post('/api/wishlist/add', isAuth, shopController.addToWishlist);
router.post('/api/wishlist/remove', isAuth, shopController.removeFromWishlist);
router.post('/api/submit-review', isAuth, shopController.reviewUpload, shopController.submitReview);
router.post('/api/apply-coupon', shopController.applyCoupon);
router.post('/api/remove-coupon', shopController.removeCoupon);
router.get('/api/user/addresses', isAuth, shopController.getUserAddresses);
router.get('/contact', shopController.getContact);

module.exports = router;
