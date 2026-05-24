const prisma = require('../../lib/prisma');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);
const moment = require('moment');
const { logAction } = require('../../lib/auditLogger');
const fs = require('fs');
const path = require('path');

exports.getServiceList = async (req, res) => {
    try {
        const services = await prisma.service.findMany({
            orderBy: { created_at: 'desc' }
        });
        res.render('pages/admin-service-list', { services }, (err, html) => {
            if (err) {
                console.error('Error rendering service list:', err);
                return res.status(500).send('Error rendering page');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: 'Manage Services - Jagannatha-puri Admin',
                styles: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css'
                ],
                scripts: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js'
                ]
            });
        });
    } catch (error) {
        console.error('Error in getServiceList:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getAddService = (req, res) => {
    req.app.render('pages/admin-service-add', { service: null }, (err, html) => {
        if (err) {
            console.error('Error rendering service add:', err);
            return res.status(500).send('Error rendering page');
        }
        res.render('layouts/admin-master', {
            body: html,
            title: 'Add Service - Jagannatha-puri Admin',
            styles: [
                '/admin-assets/vendor/libs/select2/select2.css'
            ],
            scripts: [
                '/admin-assets/vendor/libs/select2/select2.js'
            ]
        });
    });
};

exports.getEditService = async (req, res) => {
    try {
        const service = await prisma.service.findUnique({
            where: { id: parseInt(req.params.id) }
        });
        if (!service) return res.status(404).send('Service not found');

        res.render('pages/admin-service-add', { service }, (err, html) => {
            if (err) {
                console.error('Error rendering service edit:', err);
                return res.status(500).send('Error rendering page');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: 'Edit Service - Jagannatha-puri Admin',
                styles: [
                    '/admin-assets/vendor/libs/select2/select2.css'
                ],
                scripts: [
                    '/admin-assets/vendor/libs/select2/select2.js'
                ]
            });
        });
    } catch (error) {
        console.error('Error in getEditService:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.saveService = async (req, res) => {
    try {
        const { id, title, slug, subtitle, description, icon, phone, rating, reviewsCount, link, status } = req.body;

        let serviceData = {
            title,
            slug,
            subtitle,
            description: DOMPurify.sanitize(description || ''),
            icon,
            phone,
            rating: rating ? parseFloat(rating) : 5.0,
            reviewsCount: reviewsCount ? parseInt(reviewsCount) : 0,
            link: link || '/service',
            status: status || 'Active',
            image: req.file ? req.file.filename : (req.body.existing_image || null)
        };

        if (id) {
            await prisma.service.update({
                where: { id: parseInt(id) },
                data: serviceData
            });
        } else {
            await prisma.service.create({
                data: serviceData
            });
        }

        return res.json({ success: true, message: `Service ${id ? 'updated' : 'created'} successfully` });
        await logAction(req, id ? 'UPDATE_SERVICE' : 'CREATE_SERVICE', 'Service', id || null, `Saved service: ${title}`);
    } catch (error) {
        console.error('Error in saveService:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.deleteService = async (req, res) => {
    try {
        const serviceId = parseInt(req.params.id);
        const service = await prisma.service.findUnique({ where: { id: serviceId } });
        await prisma.service.delete({
            where: { id: serviceId }
        });
        res.json({ success: true });
        await logAction(req, 'DELETE_SERVICE', 'Service', serviceId, `Deleted service: ${service ? service.title : serviceId}`);
    } catch (error) {
        console.error('Error in deleteService:', error);
        res.status(500).json({ success: false });
    }
};

exports.getHeroList = async (req, res) => {
    try {
        const heroes = await prisma.heroSection.findMany({
            orderBy: { order: 'asc' }
        });
        res.render('pages/admin-hero-list', { heroes }, (err, html) => {
            if (err) {
                console.error('Error rendering hero list:', err);
                return res.status(500).send('Error rendering page');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: 'Manage Hero Section - Jagannatha-puri Admin',
                styles: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css'
                ],
                scripts: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js'
                ]
            });
        });
    } catch (error) {
        console.error('Error in getHeroList:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getAddHero = (req, res) => {
    req.app.render('pages/admin-hero-add', { hero: null }, (err, html) => {
        if (err) {
            console.error('Error rendering hero add:', err);
            return res.status(500).send('Error rendering page');
        }
        res.render('layouts/admin-master', {
            body: html,
            title: 'Add Hero Section - Jagannatha-puri Admin',
            styles: [
                '/admin-assets/vendor/libs/quill/typography.css',
                '/admin-assets/vendor/libs/quill/katex.css',
                '/admin-assets/vendor/libs/quill/editor.css',
                '/admin-assets/vendor/libs/dropzone/dropzone.css'
            ],
            scripts: [
                '/admin-assets/vendor/libs/quill/katex.js',
                '/admin-assets/vendor/libs/quill/quill.js',
                '/admin-assets/vendor/libs/dropzone/dropzone.js'
            ]
        });
    });
};

exports.getEditHero = async (req, res) => {
    try {
        const hero = await prisma.heroSection.findUnique({
            where: { id: parseInt(req.params.id) }
        });
        if (!hero) return res.status(404).send('Hero not found');

        res.render('pages/admin-hero-add', { hero }, (err, html) => {
            if (err) {
                console.error('Error rendering hero edit:', err);
                return res.status(500).send('Error rendering page');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: 'Edit Hero Section - Jagannatha-puri Admin',
                styles: [
                    '/admin-assets/vendor/libs/quill/typography.css',
                    '/admin-assets/vendor/libs/quill/katex.css',
                    '/admin-assets/vendor/libs/quill/editor.css',
                    '/admin-assets/vendor/libs/dropzone/dropzone.css'
                ],
                scripts: [
                    '/admin-assets/vendor/libs/quill/katex.js',
                    '/admin-assets/vendor/libs/quill/quill.js',
                    '/admin-assets/vendor/libs/dropzone/dropzone.js'
                ]
            });
        });
    } catch (error) {
        console.error('Error in getEditHero:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.saveHero = async (req, res) => {
    try {
        const { id, header, title, buttonText, buttonLink, description } = req.body;

        const uploadedImage = req.files && req.files['image'] ? req.files['image'][0].filename : null;
        const uploadedMobileImage = req.files && req.files['mobileImage'] ? req.files['mobileImage'][0].filename : null;

        let heroData = {
            header,
            title,
            buttonText,
            buttonLink,
            description,
            image: uploadedImage ? uploadedImage : (req.body.existing_image || ''),
            mobileImage: uploadedMobileImage ? uploadedMobileImage : (req.body.existing_mobile_image || '')
        };

        if (id) {
            await prisma.heroSection.update({
                where: { id: parseInt(id) },
                data: heroData
            });
        } else {
            await prisma.heroSection.create({
                data: heroData
            });
        }

        return res.json({ success: true, message: `Hero slide ${id ? 'updated' : 'created'} successfully` });
        // unreachable await logAction, but keeping structure as is
    } catch (error) {
        console.error('Error in saveHero:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.deleteHero = async (req, res) => {
    try {
        const heroId = parseInt(req.params.id);
        const hero = await prisma.heroSection.findUnique({ where: { id: heroId } });
        await prisma.heroSection.delete({
            where: { id: heroId }
        });
        res.json({ success: true });
        await logAction(req, 'DELETE_HERO', 'HeroSection', heroId, `Deleted hero section: ${hero ? hero.title : heroId}`);
    } catch (error) {
        console.error('Error in deleteHero:', error);
        res.status(500).json({ success: false });
    }
};

exports.getPromoList = async (req, res) => {
    try {
        const promos = await prisma.promoBanner.findMany({
            orderBy: { order: 'asc' }
        });
        res.render('pages/admin-promo-list', { promos }, (err, html) => {
            if (err) {
                console.error('Error rendering promo list:', err);
                return res.status(500).send('Error rendering page');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: 'Manage Promo Banners - Jagannatha-puri Admin',
                styles: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css'
                ],
                scripts: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js'
                ]
            });
        });
    } catch (error) {
        console.error('Error in getPromoList:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getAddPromo = (req, res) => {
    req.app.render('pages/admin-promo-add', { promo: null }, (err, html) => {
        if (err) {
            console.error('Error rendering promo add:', err);
            return res.status(500).send('Error rendering page');
        }
        res.render('layouts/admin-master', {
            body: html,
            title: 'Add Promo Banner - Jagannatha-puri Admin',
            styles: [
                '/admin-assets/vendor/libs/quill/typography.css',
                '/admin-assets/vendor/libs/quill/katex.css',
                '/admin-assets/vendor/libs/quill/editor.css'
            ],
            scripts: [
                '/admin-assets/vendor/libs/quill/katex.js',
                '/admin-assets/vendor/libs/quill/quill.js'
            ]
        });
    });
};

exports.getEditPromo = async (req, res) => {
    try {
        const promo = await prisma.promoBanner.findUnique({
            where: { id: parseInt(req.params.id) }
        });
        if (!promo) return res.status(404).send('Promo not found');

        res.render('pages/admin-promo-add', { promo }, (err, html) => {
            if (err) {
                console.error('Error rendering promo edit:', err);
                return res.status(500).send('Error rendering page');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: 'Edit Promo Banner - Jagannatha-puri Admin',
                styles: [
                    '/admin-assets/vendor/libs/quill/typography.css',
                    '/admin-assets/vendor/libs/quill/katex.css',
                    '/admin-assets/vendor/libs/quill/editor.css'
                ],
                scripts: [
                    '/admin-assets/vendor/libs/quill/katex.js',
                    '/admin-assets/vendor/libs/quill/quill.js'
                ]
            });
        });
    } catch (error) {
        console.error('Error in getEditPromo:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.savePromo = async (req, res) => {
    try {
        const { id, icon, title, subtitle } = req.body;

        let promoData = {
            icon,
            title,
            subtitle
        };

        if (id) {
            await prisma.promoBanner.update({
                where: { id: parseInt(id) },
                data: promoData
            });
        } else {
            await prisma.promoBanner.create({
                data: promoData
            });
        }

        return res.json({ success: true, message: `Promo banner ${id ? 'updated' : 'created'} successfully` });
        await logAction(req, id ? 'UPDATE_PROMO' : 'CREATE_PROMO', 'PromoBanner', id || null, `Saved promo banner: ${title}`);
    } catch (error) {
        console.error('Error in savePromo:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.deletePromo = async (req, res) => {
    try {
        const promoId = parseInt(req.params.id);
        const promo = await prisma.promoBanner.findUnique({ where: { id: promoId } });
        await prisma.promoBanner.delete({ where: { id: promoId } });
        res.json({ success: true });
        await logAction(req, 'DELETE_PROMO', 'PromoBanner', promoId, `Deleted promo banner: ${promo ? promo.title : promoId}`);
    } catch (error) {
        console.error('Error in deletePromo:', error);
        res.status(500).json({ success: false });
    }
};

exports.getHomeTabList = async (req, res) => {
    try {
        const categories = await prisma.category.findMany({ select: { id: true, name: true } });
        res.render('pages/admin-home-tabs', { categories }, (err, html) => {
            if (err) {
                console.error('Error rendering home tabs:', err);
                return res.status(500).send('Error rendering page');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: 'Home Tabs - Jagannatha-puri Admin',
                styles: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-buttons-bs5/buttons.bootstrap5.css',
                    '/admin-assets/vendor/libs/select2/select2.css',
                    '/admin-assets/vendor/libs/@form-validation/umd/styles/index.min.css',
                    '/admin-assets/vendor/css/pages/app-ecommerce.css'
                ],
                scripts: [
                    '/admin-assets/vendor/libs/moment/moment.js',
                    '/admin-assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js',
                    '/admin-assets/vendor/libs/select2/select2.js',
                    '/admin-assets/vendor/libs/@form-validation/umd/bundle/popular.min.js',
                    '/admin-assets/vendor/libs/@form-validation/umd/plugin-bootstrap5/index.min.js',
                    '/admin-assets/vendor/libs/@form-validation/umd/plugin-auto-focus/index.min.js',
                    '/admin-assets/js/app-ecommerce-home-tab-list.js'
                ]
            });
        });
    } catch (error) {
        console.error('Error in getHomeTabList:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getHomeTabData = async (req, res) => {
    try {
        const tabs = await prisma.homeTab.findMany({
            include: { category: true },
            orderBy: { order: 'asc' }
        });
        res.status(200).json({ data: tabs });
    } catch (error) {
        console.error('Error fetching home tab data:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.saveHomeTab = async (req, res) => {
    try {
        const { id, title, categoryId, order, status } = req.body;
        const data = {
            title,
            categoryId: parseInt(categoryId),
            order: parseInt(order) || 0,
            status: status || 'Active'
        };

        if (id) {
            await prisma.homeTab.update({ where: { id: parseInt(id) }, data });
            res.status(200).json({ success: true, message: 'Tab updated successfully' });
        } else {
            await prisma.homeTab.create({ data });
            res.status(200).json({ success: true, message: 'Tab added successfully' });
        }
    } catch (error) {
        console.error('Error saving home tab:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.deleteHomeTab = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.homeTab.delete({ where: { id: parseInt(id) } });
        res.status(200).json({ success: true, message: 'Tab deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getPopupList = async (req, res) => {
    try {
        const popups = await prisma.popup.findMany({
            orderBy: { created_at: 'desc' }
        });

        res.render('pages/admin-popup-list', { popups, moment }, (err, html) => {
            if (err) {
                console.error('Error rendering admin popup list:', err);
                return res.status(500).send('Error rendering admin popup list');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: 'Manage Popups',
                styles: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.css',
                    '/admin-assets/vendor/libs/flatpickr/flatpickr.css'
                ],
                scripts: [
                    '/admin-assets/vendor/libs/moment/moment.js',
                    '/admin-assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js',
                    '/admin-assets/vendor/libs/flatpickr/flatpickr.js'
                ]
            });
        });
    } catch (error) {
        console.error('Error in getPopupList:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.savePopup = async (req, res) => {
    try {
        const { id, startTime, endTime, status } = req.body;
        const image = req.file ? req.file.filename : req.body.existingImage;

        if (!image) {
            return res.status(400).json({ success: false, error: 'Image is required' });
        }

        const data = {
            image,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            status: status || 'Active'
        };

        if (id) {
            await prisma.popup.update({ where: { id: parseInt(id) }, data });
            res.status(200).json({ success: true, message: 'Popup updated successfully' });
        } else {
            await prisma.popup.create({ data });
            res.status(200).json({ success: true, message: 'Popup added successfully' });
        }
    } catch (error) {
        console.error('Error saving popup:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.deletePopup = async (req, res) => {
    try {
        const { id } = req.params;
        const popup = await prisma.popup.findUnique({ where: { id: parseInt(id) } });

        if (popup && popup.image) {
            const imagePath = path.join(__dirname, '../../../admin-panel/assets/uploads', popup.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await prisma.popup.delete({ where: { id: parseInt(id) } });
        res.status(200).json({ success: true, message: 'Popup deleted successfully' });
    } catch (error) {
        console.error('Error deleting popup:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getNewsletterList = async (req, res) => {
    try {
        const subscribers = await prisma.newsletter.findMany({
            orderBy: { createdAt: 'desc' }
        });

        res.render('pages/admin-newsletter-list', { subscribers, moment }, (err, html) => {
            if (err) {
                console.error('Error rendering admin newsletter list:', err);
                return res.status(500).send('Error rendering admin newsletter list');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: 'Newsletter Subscribers',
                activeMenu: 'newsletter',
                styles: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.css'
                ],
                scripts: [
                    '/admin-assets/vendor/libs/moment/moment.js',
                    '/admin-assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js'
                ]
            });
        });
    } catch (error) {
        console.error('Error fetching newsletter list:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.deleteNewsletter = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.newsletter.delete({
            where: { id: parseInt(id) }
        });
        res.json({ success: true, message: 'Subscriber deleted successfully' });
    } catch (error) {
        console.error('Error deleting subscriber:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};
