require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

async function runWithRetry(fn, retries = 5) {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (e) {
            if (i === retries - 1) throw e;
            console.log(`Attempt ${i + 1} failed: ${e.message}`);
            console.log('Retrying in 5 seconds...');
            await new Promise(r => setTimeout(r, 5000));
        }
    }
}

async function main() {
    console.log('--- Updating Site Config (with Retry) ---');

    const defaultSiteConfig = {
        header: {
            logo: '/assets/images/logo.png',
            support_phone: '+91 6752 123456',
            top_bar_links: [
                { label: 'About us', url: '/about' },
                { label: 'My Account', url: '/user-account' },
                { label: 'My Wishlist', url: '/wishlist' },
                { label: 'Order Tracking', url: '#' }
            ],
            navbar_links: [
                { label: 'Home', url: '/' },
                {
                    label: 'Temple',
                    url: '#',
                    sub_links: [
                        { label: 'Daily Rituals', url: '/daily-rituals' },
                        { label: 'Panchangs', url: '/panchang' }
                    ]
                },
                { label: 'Shop', url: '/shop' },
                { label: 'Library', url: '/library' },
                { label: 'Service', url: '/service' },
                { label: 'About', url: '/about' },
                { label: 'Contact', url: '/contact' }
            ],
            navbar_support_phone: '+91 6752 123456'
        },
        footer: {
            brand_description: 'Your one-stop shop for authentic Puri Dham specialties, from Mahaprasad to Handlooms.',
            facebook: '#', instagram: '#', linkedin: '#', pinterest: '#', behance: '#',
            contact_address: 'Grand Road, Puri, Odisha, 752001',
            contact_phone: '+91 6752 123456',
            contact_email: 'support@puristore.com'
        }
    };

    await runWithRetry(async () => {
        await prisma.siteConfig.upsert({
            where: { key: 'header' },
            update: { value: defaultSiteConfig.header },
            create: { key: 'header', value: defaultSiteConfig.header }
        });

        await prisma.siteConfig.upsert({
            where: { key: 'footer' },
            update: { value: defaultSiteConfig.footer },
            create: { key: 'footer', value: defaultSiteConfig.footer }
        });
    });

    console.log('--- Site Config Updated Successfully ---');
}

main()
    .catch(e => {
        console.error('Update Failed after retries:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
