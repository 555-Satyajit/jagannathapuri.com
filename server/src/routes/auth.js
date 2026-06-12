const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.postLogin);
router.post('/register', authController.postRegister);

router.post('/send-otp', authController.postSendOTP);
router.post('/verify-otp', authController.postVerifyOTP);

router.post('/change-password', authController.postChangePassword);

router.get('/logout', authController.logout);
router.post('/logout', authController.logout);

router.post('/auth/session/verify', authController.postSessionVerify);

module.exports = router;
