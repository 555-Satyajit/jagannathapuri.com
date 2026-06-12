const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const isAuth = require('../middlewares/customerAuth');

router.get('/api/product/:id', shopController.getProductApi);
router.get('/api/search', shopController.searchApi);
router.post('/checkout', shopController.postCheckout);
router.post('/verify-razorpay-payment', shopController.verifyRazorpayPayment);
router.get('/api/wishlist/items', isAuth, shopController.getWishlistApi);
router.post('/api/wishlist/add', isAuth, shopController.addToWishlist);
router.post('/api/wishlist/remove', isAuth, shopController.removeFromWishlist);
router.post('/api/submit-review', isAuth, shopController.reviewUpload, shopController.submitReview);
router.post('/api/apply-coupon', shopController.applyCoupon);
router.post('/api/remove-coupon', shopController.removeCoupon);
router.post('/api/submit-feedback', shopController.submitFeedback);
router.get('/api/user/addresses', isAuth, shopController.getUserAddresses);

module.exports = router;
