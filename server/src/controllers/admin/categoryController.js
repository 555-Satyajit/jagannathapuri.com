const prisma = require('../../lib/prisma');
const { logAction } = require('../../lib/auditLogger');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

exports.getCategoryList = async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            where: { parentId: null },
            include: { subCategories: true }
        });

        res.render('pages/admin-category-list', { categories }, (err, html) => {
            if (err) {
                console.error('Error rendering admin category list:', err);
                return res.status(500).send('Error rendering admin category list');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: 'Categories List',
                styles: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-buttons-bs5/buttons.bootstrap5.css',
                    '/admin-assets/vendor/libs/select2/select2.css',
                    '/admin-assets/vendor/libs/@form-validation/umd/styles/index.min.css',
                    '/admin-assets/vendor/libs/quill/typography.css',
                    '/admin-assets/vendor/libs/quill/katex.css',
                    '/admin-assets/vendor/libs/quill/editor.css',
                    '/admin-assets/vendor/libs/sweetalert2/sweetalert2.css',
                    '/admin-assets/vendor/css/pages/app-ecommerce.css'
                ],
                scripts: [
                    '/admin-assets/vendor/libs/moment/moment.js',
                    '/admin-assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js',
                    '/admin-assets/vendor/libs/select2/select2.js',
                    '/admin-assets/vendor/libs/@form-validation/umd/bundle/popular.min.js',
                    '/admin-assets/vendor/libs/@form-validation/umd/plugin-bootstrap5/index.min.js',
                    '/admin-assets/vendor/libs/@form-validation/umd/plugin-auto-focus/index.min.js',
                    '/admin-assets/vendor/libs/quill/katex.js',
                    '/admin-assets/vendor/libs/quill/quill.js',
                    '/admin-assets/vendor/libs/sweetalert2/sweetalert2.js',
                    '/admin-assets/js/app-ecommerce-category-list.js'
                ]
            });
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getCategoryData = async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            include: {
                _count: {
                    select: { products: true }
                }
            }
        });

        const formattedData = categories.map(cat => ({
            id: cat.id,
            categories: cat.name,
            category_detail: cat.description || '',
            cat_image: cat.image || '',
            total_products: cat._count.products,
            total_earnings: "$0", // Placeholder for now
            status: cat.status,
            slug: cat.slug,
            meta_title: cat.meta_title || '',
            meta_description: cat.meta_description || '',
            meta_keywords: cat.meta_keywords || ''
        }));

        res.json({ data: formattedData });
    } catch (error) {
        console.error('Error fetching category data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.saveCategory = async (req, res) => {
    try {
        console.log('Saving category. body:', req.body);
        let { categoryTitle, slug, parentCategory, status, description, meta_title, meta_description, meta_keywords } = req.body;
        const image = req.file ? req.file.filename : null;

        if (Array.isArray(description)) {
            description = description.filter(d => d !== "").pop() || "";
        }

        // Sanitize description
        const sanitizedDescription = DOMPurify.sanitize(description);

        if (!categoryTitle || !slug) {
            return res.status(400).json({ success: false, error: 'Title and Slug are required' });
        }

        const newCategory = await prisma.category.create({
            data: {
                name: categoryTitle,
                slug: slug,
                description: sanitizedDescription,
                image: image,
                status: status || 'Scheduled',
                parentId: (parentCategory && parentCategory !== "") ? parseInt(parentCategory) : null,
                meta_title,
                meta_description,
                meta_keywords
            }
        });

        res.json({ success: true, category: newCategory });
        await logAction(req, 'CREATE_CATEGORY', 'Category', newCategory.id, `Created category: ${newCategory.name}`);
    } catch (error) {
        console.error('Error saving category:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({ success: false, error: 'A category with this name or slug already exists.' });
        }
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        let { categoryTitle, slug, parentCategory, status, description, meta_title, meta_description, meta_keywords } = req.body;
        const image = req.file ? req.file.filename : undefined;

        if (Array.isArray(description)) {
            description = description.filter(d => d !== "").pop() || "";
        }

        const updateData = {
            name: categoryTitle,
            slug: slug,
            description: DOMPurify.sanitize(description),
            status: status || 'Scheduled',
            parentId: (parentCategory && parentCategory !== "") ? parseInt(parentCategory) : null,
            meta_title,
            meta_description,
            meta_keywords
        };

        if (image) {
            const oldCategory = await prisma.category.findUnique({ where: { id: parseInt(id) } });
            if (oldCategory && oldCategory.image) {
                const fs = require('fs');
                const path = require('path');
                const oldImagePath = path.join(__dirname, '../../../../admin-panel/assets/img/ecommerce-images', oldCategory.image);
                if (fs.existsSync(oldImagePath)) {
                    try { fs.unlinkSync(oldImagePath); } catch (e) { console.error('Error deleting image:', e); }
                }
            }
            updateData.image = image;
        }

        const updatedCategory = await prisma.category.update({
            where: { id: parseInt(id) },
            data: updateData
        });

        res.json({ success: true, category: updatedCategory });
        await logAction(req, 'UPDATE_CATEGORY', 'Category', updatedCategory.id, `Updated category: ${updatedCategory.name}`);
    } catch (error) {
        console.error('Error updating category:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({ success: false, error: 'A category with this name or slug already exists.' });
        }
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const categoryId = parseInt(id);

        if (isNaN(categoryId)) {
            return res.status(400).json({ success: false, error: 'Invalid category ID' });
        }

        // Check for related products
        const productsCount = await prisma.product.count({ where: { category_id: categoryId } });
        if (productsCount > 0) {
            return res.json({ success: false, error: `Cannot delete category. It has ${productsCount} associated product(s). Please reassign or delete the products first.` });
        }

        // Check for subcategories
        const subCategoriesCount = await prisma.category.count({ where: { parentId: categoryId } });
        if (subCategoriesCount > 0) {
            return res.json({ success: false, error: `Cannot delete category. It has ${subCategoriesCount} subcategory(ies). Please delete or reassign them first.` });
        }

        // Check for home tabs
        const homeTabsCount = await prisma.homeTab.count({ where: { categoryId: categoryId } });
        if (homeTabsCount > 0) {
            return res.json({ success: false, error: `Cannot delete category. It is associated with ${homeTabsCount} home tab(s). Please remove them first.` });
        }

        const category = await prisma.category.findUnique({ where: { id: categoryId } });

        if (category && category.image) {
            const fs = require('fs');
            const path = require('path');
            const imagePath = path.join(__dirname, '../../../../admin-panel/assets/img/ecommerce-images', category.image);
            if (fs.existsSync(imagePath)) {
                try { fs.unlinkSync(imagePath); } catch (e) { console.error('Error deleting image:', e); }
            }
        }

        await prisma.category.delete({ where: { id: categoryId } });
        res.json({ success: true });
        await logAction(req, 'DELETE_CATEGORY', 'Category', categoryId, `Deleted category: ${category.name}`);
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.bulkDeleteCategories = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ success: false, error: 'No category IDs provided for deletion.' });
        }

        let deletedCount = 0;
        let skippedCategories = [];

        for (const id of ids) {
            const categoryId = parseInt(id);
            if (isNaN(categoryId)) continue;

            const category = await prisma.category.findUnique({ where: { id: categoryId } });
            if (!category) continue;

            // Check relations
            const productsCount = await prisma.product.count({ where: { category_id: categoryId } });
            const subCategoriesCount = await prisma.category.count({ where: { parentId: categoryId } });
            const homeTabsCount = await prisma.homeTab.count({ where: { categoryId: categoryId } });

            if (productsCount > 0 || subCategoriesCount > 0 || homeTabsCount > 0) {
                skippedCategories.push(category.name);
                continue;
            }

            if (category.image) {
                const fs = require('fs');
                const path = require('path');
                const imagePath = path.join(__dirname, '../../../../admin-panel/assets/img/ecommerce-images', category.image);
                if (fs.existsSync(imagePath)) {
                    try { fs.unlinkSync(imagePath); } catch (e) { console.error('Error deleting image:', e); }
                }
            }

            await prisma.category.delete({ where: { id: categoryId } });
            deletedCount++;
        }

        if (skippedCategories.length > 0) {
            return res.json({
                success: true,
                message: `Successfully deleted ${deletedCount} category(ies). Skipped the following categories because they are in use: ${skippedCategories.join(', ')}.`
            });
        }

        res.json({ success: true, message: `Successfully deleted ${deletedCount} category(ies).` });
        await logAction(req, 'BULK_DELETE_CATEGORIES', 'Category', null, `Bulk deleted ${deletedCount} categories. Skipped: ${skippedCategories.length}`);

    } catch (error) {
        console.error('Error bulk deleting categories:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
