require('dotenv').config({ path: './.env' });
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for 465, false for 587
    auth: {
        user: 'satyajitpujapanda9@gmail.com',
        // Replace this with the App Password if you want to test hardcoded, 
        // or ensure it's in your .env file as SMTP_PASSWORD
        pass: process.env.SMTP_PASSWORD || 'shdy diqp oaea oleb'
    }
});

async function verifySMTP() {
    console.log('Attempting to connect to Gmail SMTP...');
    try {
        const info = await transporter.verify();
        console.log('✅ Connection Successful!', info);
        console.log('Your SMTP settings satisfy Nodemailer. The issue might be specific to Supabase or the password formatting.');
    } catch (error) {
        console.error('❌ Connection Failed!');
        console.error('Error:', error.message);
        if (error.code === 'EAUTH') {
            console.error('-> Authentication failed. Double-check your Username and App Password.');
        } else if (error.code === 'ESOCKET') {
            console.error('-> Network issue. Check if Port 465 is blocked or try Port 587 with secure: false.');
        }
    }
}

verifySMTP();
