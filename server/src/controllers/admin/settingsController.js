const prisma = require('../../lib/prisma');
const configStore = require('../../lib/configStore');
const moment = require('moment');
const { logAction } = require('../../lib/auditLogger');

exports.getGeneralSettings = async (req, res) => {
    try {
        const configs = await prisma.siteConfig.findMany();
        const settings = {};
        configs.forEach(c => {
            settings[c.key] = c.value;
        });

        // Default values if not set
        const defaultSettings = {
            header: {
                logo: '/assets/images/logo.png',
                support_phone: '(480) 555-0103',
                promo_text: 'Fashion Category',
                promo_tag: '25% OFF',
                promo_suffix: 'Today',
                promo_status: true,
                navbar_support_phone: '888-777-999',
                navbar_links: [
                    { label: 'Home', url: '/' },
                    { label: 'About Us', url: '/about' },
                    { label: 'Shop', url: '/shop' },
                    { label: 'Services', url: '/service' },
                    { label: 'Library', url: '/library' },
                    { label: 'Daily Rituals', url: '/daily-rituals' },
                    { label: 'Panchang', url: '/panchang' },
                    { label: 'Contact', url: '/contact' }
                ],
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
            },
            home: {
                timer_title: 'Ends in :',
                timer_end_date: '2026-12-13T00:00',
                timer_status: true
            },
            seo: {
                meta_title: 'Jagannathapuri - Authentic Puri Dham Specialties',
                meta_description: 'Your one-stop shop for authentic Puri Dham specialties, from Mahaprasad to Handlooms.',
                meta_keywords: 'Puri, Jagannath, Mahaprasad, Handloom, Odisha',
                og_title: 'Jagannathapuri Store',
                og_description: 'Authentic Puri Dham Specialties',
                favicon: '/assets/images/favicon.png'
            }
        };

        const finalSettings = {
            header: { ...defaultSettings.header, ...(settings.header || {}) },
            footer: { ...defaultSettings.footer, ...(settings.footer || {}) },
            home: { ...defaultSettings.home, ...(settings.home || {}) },
            seo: { ...defaultSettings.seo, ...(settings.seo || {}) }
        };

        req.app.render('pages/admin-general-settings', { settings: finalSettings }, (err, html) => {
            if (err) {
                console.error('Error rendering general settings:', err);
                return res.status(500).send('Error rendering page');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: 'General Settings - Jagannatha-puri Admin',
                styles: [],
                scripts: [
                    '/admin-assets/vendor/libs/jquery-repeater/jquery-repeater.js'
                ]
            });
        });
    } catch (error) {
        console.error('Error in getGeneralSettings:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.saveGeneralSettings = async (req, res) => {
    try {
        const { header_json, footer_json, home_json, seo_json } = req.body;
        const headerData = JSON.parse(header_json);
        const footerData = JSON.parse(footer_json);
        const homeData = home_json ? JSON.parse(home_json) : null;
        const seoData = seo_json ? JSON.parse(seo_json) : null;

        // Handle file uploads
        if (req.files) {
            if (req.files['logo'] && req.files['logo'][0]) {
                headerData.logo = `/uploads/${req.files['logo'][0].filename}`;
            }
            if (req.files['favicon'] && req.files['favicon'][0]) {
                if (seoData) {
                    seoData.favicon = `/uploads/${req.files['favicon'][0].filename}`;
                }
            }
        }

        const updates = [
            prisma.siteConfig.upsert({
                where: { key: 'header' },
                update: { value: headerData },
                create: { key: 'header', value: headerData }
            }),
            prisma.siteConfig.upsert({
                where: { key: 'footer' },
                update: { value: footerData },
                create: { key: 'footer', value: footerData }
            })
        ];

        if (homeData) {
            updates.push(prisma.siteConfig.upsert({
                where: { key: 'home' },
                update: { value: homeData },
                create: { key: 'home', value: homeData }
            }));
        }

        if (seoData) {
            updates.push(prisma.siteConfig.upsert({
                where: { key: 'seo' },
                update: { value: seoData },
                create: { key: 'seo', value: seoData }
            }));
        }

        await prisma.$transaction(updates);

        configStore.clearCache();

        res.redirect('/admin/settings/general');
        await logAction(req, 'UPDATE_SETTINGS', 'Settings', 'General', 'Updated general admin settings (Logo, Hero, SEO, etc.)');
    } catch (error) {
        console.error('Error saving general settings:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getShippingPaymentSettings = async (req, res) => {
    try {
        const config = await prisma.siteConfig.findUnique({ where: { key: 'shipping_payment' } });
        const settings = config ? config.value : {
            shipping: { flat_rate: 10, free_shipping_threshold: 100 },
            payment: { cod_enabled: true, online_payment_enabled: true }
        };

        req.app.render('pages/admin-shipping-payment-settings', { settings }, (err, html) => {
            if (err) {
                console.error('Error rendering shipping payment settings:', err);
                return res.status(500).send('Error rendering page');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: 'Shipping & Payment Settings - Jagannatha-puri Admin'
            });
        });
    } catch (error) {
        console.error('Error in getShippingPaymentSettings:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.saveShippingPaymentSettings = async (req, res) => {
    try {
        const settings = req.body;
        await prisma.siteConfig.upsert({
            where: { key: 'shipping_payment' },
            update: { value: settings },
            create: { key: 'shipping_payment', value: settings }
        });
        res.redirect('/admin/settings/shipping-payment');
        await logAction(req, 'UPDATE_SETTINGS', 'Settings', 'Shipping/Payment', 'Updated shipping and payment settings');
    } catch (error) {
        console.error('Error saving shipping payment settings:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getContactSettings = async (req, res) => {
    try {
        const config = await prisma.siteConfig.findUnique({ where: { key: 'contact' } });
        const defaultSettings = {
            email: 'support@jagannathapuri.com',
            phone: '+91 6752 123456',
            address: 'Grand Road, Puri, Odisha, 752001',
            website: 'www.jagannathapuri.com',
            faqs: [
                {
                    question: 'What payment methods do you accept?',
                    answer: 'We accept all major credit cards, debit cards, and UPI.'
                },
                {
                    question: 'How can I track my order?',
                    answer: 'You can track your order in the My Account section after logging in.'
                }
            ]
        };
        const settings = config ? { ...defaultSettings, ...config.value } : defaultSettings;

        req.app.render('pages/admin-contact', { settings }, (err, html) => {
            if (err) {
                console.error('Error rendering contact settings:', err);
                return res.status(500).send('Error rendering page');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: 'Manage Contact - Jagannatha-puri Admin',
                styles: [],
                scripts: [
                    '/admin-assets/vendor/libs/jquery-repeater/jquery-repeater.js'
                ]
            });
        });
    } catch (error) {
        console.error('Error in getContactSettings:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.saveContactSettings = async (req, res) => {
    try {
        const { contact_json } = req.body;
        const contactData = JSON.parse(contact_json);

        await prisma.siteConfig.upsert({
            where: { key: 'contact' },
            update: { value: contactData },
            create: { key: 'contact', value: contactData }
        });

        configStore.clearCache();
        res.redirect('/admin/store/contact');
    } catch (error) {
        console.error('Error saving contact settings:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getContactMessages = async (req, res) => {
    try {
        const messages = await prisma.feedback.findMany({
            orderBy: { created_at: 'desc' }
        });

        req.app.render('pages/admin-feedback-list', { messages, moment }, (err, html) => {
            if (err) {
                console.error('Error rendering feedback list:', err);
                return res.status(500).send('Error rendering page');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: 'Contact Messages - Jagannatha-puri Admin',
                styles: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.css',
                    '/admin-assets/vendor/libs/sweetalert2/sweetalert2.css'
                ],
                scripts: [
                    '/admin-assets/vendor/libs/moment/moment.js',
                    '/admin-assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js',
                    '/admin-assets/vendor/libs/sweetalert2/sweetalert2.js'
                ]
            });
        });
    } catch (error) {
        console.error('Error in getContactMessages:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.deleteContactMessage = async (req, res) => {
    try {
        await prisma.feedback.delete({
            where: { id: parseInt(req.params.id) }
        });
        res.json({ success: true, message: 'Message deleted successfully' });
    } catch (error) {
        console.error('Error deleting contact message:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};
