const prisma = require('./prisma');

const defaultSettings = {
    header: {
        logo: '/assets/images/logo.png',
        support_phone: '(480) 555-0103',
        top_bar_links: [
            { label: 'About us', url: '/about' },
            { label: 'My Account', url: '/user-account' },
            { label: 'My Wishlist', url: '/wishlist' },
            { label: 'Order Tracking', url: '#' }
        ]
    },
    footer: {
        brand_description: 'Your one-stop shop for authentic Puri Dham specialties, from Mahaprasad to Handlooms.',
        facebook: '#', instagram: '#', linkedin: '#', pinterest: '#', behance: '#',
        contact_address: 'Grand Road, Puri, Odisha, 752001',
        contact_phone: '+91 6752 123456',
        contact_email: 'support@puristore.com'
    }
};

let cache = null;

const getConfig = async () => {
    if (cache) {
        return cache;
    }

    try {
        const configs = await prisma.siteConfig.findMany();
        const settings = { ...defaultSettings };

        configs.forEach(c => {
            settings[c.key] = c.value;
        });

        cache = settings;
        return cache;
    } catch (error) {
        console.error('Error fetching config for cache:', error);
        // Return defaults as a fallback to prevent app crash
        return defaultSettings;
    }
};

const clearCache = () => {
    cache = null;
};

module.exports = {
    getConfig,
    clearCache
};
