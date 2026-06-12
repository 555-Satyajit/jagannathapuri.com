require('dotenv').config();
const Razorpay = require('razorpay');

console.log("Key:", process.env.RAZORPAY_KEY_ID);
const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

instance.orders.create({ amount: 100, currency: "INR" })
    .then(console.log)
    .catch(console.error);
