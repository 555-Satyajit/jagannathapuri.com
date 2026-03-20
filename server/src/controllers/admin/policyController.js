const prisma = require('../../lib/prisma');
const configStore = require('../../lib/configStore');

const renderPolicyEdit = (req, res, title, configKey, saveUrl, activeMenu) => {
    prisma.siteConfig.findUnique({ where: { key: configKey } })
        .then(config => {
            const content = config ? config.value.content : '';
            res.render('pages/admin-policy-edit', { pageTitle: title, content, saveUrl }, (err, html) => {
                if (err) {
                    console.error(`Error rendering ${configKey} policy:`, err);
                    return res.status(500).send('Error rendering page');
                }
                res.render('layouts/admin-master', {
                    body: html,
                    title: `${title} - Jagannatha-puri Admin`,
                    activeMenu: activeMenu,
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
        })
        .catch(error => {
            console.error(`Error fetching ${configKey}:`, error);
            res.status(500).send('Internal Server Error');
        });
};

const savePolicy = async (req, res, configKey, redirectUrl) => {
    try {
        const { content } = req.body;

        await prisma.siteConfig.upsert({
            where: { key: configKey },
            update: { value: { content } },
            create: { key: configKey, value: { content } }
        });

        configStore.clearCache();
        res.redirect(redirectUrl);
    } catch (error) {
        console.error(`Error saving ${configKey}:`, error);
        res.status(500).send('Internal Server Error');
    }
};

// Privacy Policy
exports.getPrivacyPolicy = (req, res) => {
    renderPolicyEdit(req, res, 'Privacy Policy', 'privacy_policy', '/admin/settings/policies/privacy/save', 'privacy_policy');
};
exports.savePrivacyPolicy = (req, res) => {
    savePolicy(req, res, 'privacy_policy', '/admin/settings/policies/privacy');
};

// Terms & Conditions
exports.getTermsConditions = (req, res) => {
    renderPolicyEdit(req, res, 'Terms & Conditions', 'terms_conditions', '/admin/settings/policies/terms/save', 'terms_conditions');
};
exports.saveTermsConditions = (req, res) => {
    savePolicy(req, res, 'terms_conditions', '/admin/settings/policies/terms');
};

// Return Policy
exports.getReturnPolicy = (req, res) => {
    renderPolicyEdit(req, res, 'Return Policy', 'return_policy', '/admin/settings/policies/return/save', 'return_policy');
};
exports.saveReturnPolicy = (req, res) => {
    savePolicy(req, res, 'return_policy', '/admin/settings/policies/return');
};
