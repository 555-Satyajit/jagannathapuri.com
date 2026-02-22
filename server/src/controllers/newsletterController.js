const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.subscribeNewsletter = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || !email.includes('@')) {
            return res.status(400).json({ success: false, error: 'Please provide a valid email address.' });
        }

        // Check if already subscribed
        const existing = await prisma.newsletter.findUnique({
            where: { email: email.toLowerCase() }
        });

        if (existing) {
            return res.status(400).json({ success: false, error: 'This email is already subscribed.' });
        }

        await prisma.newsletter.create({
            data: {
                email: email.toLowerCase(),
                status: 'Active'
            }
        });

        res.json({ success: true, message: 'Thank you for subscribing to our newsletter!' });
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        res.status(500).json({ success: false, error: 'An error occurred. Please try again later.' });
    }
};
