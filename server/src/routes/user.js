const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const isAuth = require('../middlewares/customerAuth');

router.post('/user-update-profile', isAuth, userController.updateProfile);
router.get('/user-addresses', isAuth, userController.getAddresses);
router.post('/user-address-add', isAuth, userController.addAddress);
router.post('/user-address-edit/:id', isAuth, userController.editAddress);
router.post('/user-address-delete/:id', isAuth, userController.deleteAddress);
router.post('/user-change-password', isAuth, userController.changePassword);
router.get('/user-invoice/:orderId', isAuth, userController.downloadInvoice);
router.get('/user-order-details-api/:id', isAuth, userController.getOrderDetailsApi);
router.get('/user-orders', isAuth, userController.getOrdersApi);

module.exports = router;
