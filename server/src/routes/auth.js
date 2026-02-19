const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);

router.get('/register', authController.getRegister);
router.post('/register', authController.postRegister);

router.post('/send-otp', authController.postSendOTP);
router.post('/verify-otp', authController.postVerifyOTP);

router.post('/change-password', authController.postChangePassword);

router.get('/logout', authController.logout);

router.get('/auth/callback', authController.getGoogleCallback);
router.post('/auth/session/verify', authController.postSessionVerify);

module.exports = router;
