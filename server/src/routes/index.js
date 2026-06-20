const express = require('express');
const router = express.Router();

const shopRoutes = require('./shop');
const userRoutes = require('./user');
const authRoutes = require('./auth');
const cartRoutes = require('./cart');
// Use routes
router.use('/', shopRoutes);
router.use('/', authRoutes);
router.use('/', userRoutes); // Using root since /user-account is prefixed in user.js
router.use('/cart', cartRoutes);

module.exports = router;
