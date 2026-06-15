const prisma = require('../../lib/prisma');
const configStore = require('../../lib/configStore');

exports.apiGetPolicy = async (req, res) => {
    try {
        const { type } = req.params;
        const configKey = `${type}_policy`; // e.g. privacy_policy, terms_policy

        // terms config is actually "terms_conditions" in the backend. 
        // We'll normalize it here.
        let actualKey = configKey;
        if (type === 'terms') actualKey = 'terms_conditions';

        const config = await prisma.siteConfig.findUnique({ where: { key: actualKey } });
        
        const content = config ? config.value.content : '';
        res.json({ success: true, data: { content } });
    } catch (error) {
        console.error(`Error fetching policy data:`, error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.apiSavePolicy = async (req, res) => {
    try {
        const { type } = req.params;
        const { content } = req.body;
        
        let actualKey = `${type}_policy`;
        if (type === 'terms') actualKey = 'terms_conditions';

        await prisma.siteConfig.upsert({
            where: { key: actualKey },
            update: { value: { content } },
            create: { key: actualKey, value: { content } }
        });

        configStore.clearCache();
        res.json({ success: true, message: 'Policy saved successfully.' });
    } catch (error) {
        console.error(`Error saving policy data:`, error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.apiGetGeneralSettings = async (req, res) => {
    try {
        const configKeys = ['header', 'contact', 'home', 'seo'];
        const configs = await prisma.siteConfig.findMany({
            where: { key: { in: configKeys } }
        });
        
        const data = { header: {}, footer: {}, home_timer: {}, seo: {} };
        configs.forEach(c => {
            if (c.key === 'header') {
                data.header = {
                    logo: c.value.logo || '',
                    supportPhone: c.value.support_phone || '',
                    promoBannerText: c.value.promo_text || '',
                    promoDiscountTag: c.value.promo_tag || '',
                    promoSuffixText: c.value.promo_suffix || '',
                    showPromoBanner: c.value.promo_status ?? true,
                    navbarSupportPhone: c.value.navbar_support_phone || '',
                    navLinks: c.value.navbar_links || [],
                    topBarLinks: c.value.top_bar_links || []
                };
            }
            if (c.key === 'contact') {
                data.footer = {
                    brandDescription: c.value.brand_description || '',
                    facebookUrl: c.value.facebook_url || '',
                    instagramUrl: c.value.instagram_url || '',
                    linkedinUrl: c.value.linkedin_url || '',
                    contactAddress: c.value.address || '',
                    contactPhone: c.value.phone || '',
                    contactEmail: c.value.email || ''
                };
            }
            if (c.key === 'home') {
                data.home_timer = {
                    timerTitle: c.value.timer_title || '',
                    timerEndDate: c.value.timer_end_date || '',
                    showTimer: c.value.timer_status ?? true
                };
            }
            if (c.key === 'seo') {
                data.seo = {
                    favicon: c.value.favicon || '',
                    defaultMetaTitle: c.value.meta_title || '',
                    defaultMetaDescription: c.value.meta_description || '',
                    globalMetaKeywords: c.value.meta_keywords || '',
                    ogTitle: c.value.og_title || '',
                    ogDescription: c.value.og_description || ''
                };
            }
        });

        res.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching general settings:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.apiSaveGeneralSettings = async (req, res) => {
    try {
        const settingsRaw = req.body.settings;
        if (!settingsRaw) {
            return res.status(400).json({ error: 'Missing settings payload' });
        }
        
        const settings = JSON.parse(settingsRaw);

        // Handle uploaded files
        if (req.files) {
            if (req.files.logo && req.files.logo[0]) {
                if (!settings.header) settings.header = {};
                settings.header.logo = req.files.logo[0].filename; // multer saves directly to public/uploads
            }
            if (req.files.favicon && req.files.favicon[0]) {
                if (!settings.seo) settings.seo = {};
                settings.seo.favicon = req.files.favicon[0].filename;
            }
        }

        // Mapping frontend payload to backend keys
        if (settings.header) {
            const val = {
                logo: settings.header.logo,
                support_phone: settings.header.supportPhone,
                promo_text: settings.header.promoBannerText,
                promo_tag: settings.header.promoDiscountTag,
                promo_suffix: settings.header.promoSuffixText,
                promo_status: settings.header.showPromoBanner,
                navbar_support_phone: settings.header.navbarSupportPhone,
                navbar_links: settings.header.navLinks,
                top_bar_links: settings.header.topBarLinks
            };
            await prisma.siteConfig.upsert({ where: { key: 'header' }, update: { value: val }, create: { key: 'header', value: val } });
        }
        if (settings.footer) {
            const existing = await prisma.siteConfig.findUnique({ where: { key: 'contact' } });
            const oldVal = existing ? existing.value : {};
            const val = {
                ...oldVal,
                brand_description: settings.footer.brandDescription,
                facebook_url: settings.footer.facebookUrl,
                instagram_url: settings.footer.instagramUrl,
                linkedin_url: settings.footer.linkedinUrl,
                address: settings.footer.contactAddress,
                phone: settings.footer.contactPhone,
                email: settings.footer.contactEmail
            };
            await prisma.siteConfig.upsert({ where: { key: 'contact' }, update: { value: val }, create: { key: 'contact', value: val } });
        }
        if (settings.home_timer) {
            const val = {
                timer_title: settings.home_timer.timerTitle,
                timer_end_date: settings.home_timer.timerEndDate,
                timer_status: settings.home_timer.showTimer
            };
            await prisma.siteConfig.upsert({ where: { key: 'home' }, update: { value: val }, create: { key: 'home', value: val } });
        }
        if (settings.seo) {
            const val = {
                favicon: settings.seo.favicon,
                meta_title: settings.seo.defaultMetaTitle,
                meta_description: settings.seo.defaultMetaDescription,
                meta_keywords: settings.seo.globalMetaKeywords,
                og_title: settings.seo.ogTitle,
                og_description: settings.seo.ogDescription
            };
            await prisma.siteConfig.upsert({ where: { key: 'seo' }, update: { value: val }, create: { key: 'seo', value: val } });
        }

        configStore.clearCache();
        res.json({ success: true, message: 'General settings saved successfully.' });
    } catch (error) {
        console.error('Error saving general settings:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

