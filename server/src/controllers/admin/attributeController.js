const prisma = require('../../lib/prisma');

exports.getAttributeList = async (req, res) => {
    try {
        const attributes = await prisma.attribute.findMany({
            orderBy: { created_at: 'desc' }
        });

        res.render('pages/admin-attribute-list', { attributes }, (err, html) => {
            if (err) {
                console.error('Error rendering attribute list:', err);
                return res.status(500).send('Error rendering attribute list');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: 'Attributes - Catalog',
                styles: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.css',
                    '/admin-assets/vendor/libs/select2/select2.css'
                ],
                scripts: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js',
                    '/admin-assets/vendor/libs/select2/select2.js'
                ]
            });
        });
    } catch (error) {
        console.error('Error fetching attribute list:', error);
        res.status(500).send('Error fetching attribute list');
    }
};
exports.getAttributeData = async (req, res) => {
    try {
        const attributes = await prisma.attribute.findMany({
            orderBy: { created_at: 'desc' }
        });
        const formattedData = attributes.map(attr => ({
            id: attr.id,
            name: attr.name,
            description: attr.description || ''
        }));
        res.json({ data: formattedData });
    } catch (error) {
        console.error('Error fetching attribute data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.saveAttribute = async (req, res) => {
    try {
        const { name, description } = req.body;
        await prisma.attribute.create({
            data: { name, description }
        });
        res.redirect('/admin/ecommerce/attributes');
    } catch (error) {
        console.error('Error saving attribute:', error);
        res.status(500).json({ error: 'Error saving attribute' });
    }
};

exports.updateAttribute = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        await prisma.attribute.update({
            where: { id: parseInt(id) },
            data: { name, description }
        });
        res.redirect('/admin/ecommerce/attributes');
    } catch (error) {
        console.error('Error updating attribute:', error);
        res.status(500).json({ error: 'Error updating attribute' });
    }
};

exports.deleteAttribute = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.attribute.delete({
            where: { id: parseInt(id) }
        });
        res.status(200).json({ success: true, message: 'Attribute deleted successfully' });
    } catch (error) {
        console.error('Error deleting attribute:', error);
        res.status(500).json({ success: false, error: 'Error deleting attribute' });
    }
};

exports.apiSaveAttribute = async (req, res) => {
    try {
        const { name, description } = req.body;
        const attr = await prisma.attribute.create({
            data: { name, description }
        });
        res.json({ success: true, data: attr });
    } catch (error) {
        console.error('Error saving attribute:', error);
        res.status(500).json({ success: false, error: 'Error saving attribute' });
    }
};

exports.apiUpdateAttribute = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const attr = await prisma.attribute.update({
            where: { id: parseInt(id) },
            data: { name, description }
        });
        res.json({ success: true, data: attr });
    } catch (error) {
        console.error('Error updating attribute:', error);
        res.status(500).json({ success: false, error: 'Error updating attribute' });
    }
};
