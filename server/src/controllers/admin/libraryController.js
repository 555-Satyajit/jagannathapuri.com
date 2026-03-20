const prisma = require('../../lib/prisma');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);
const { logAction } = require('../../lib/auditLogger');

exports.getLibCategoryList = async (req, res) => {
    try {
        const categories = await prisma.libraryCategory.findMany({
            orderBy: { created_at: 'desc' },
            include: { _count: { select: { contents: true } } }
        });

        res.render('pages/admin-library-category-list', { categories }, (err, html) => {
            if (err) {
                console.error('Error rendering page:', err);
                return res.status(500).send('Internal Server Error');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: 'Library Categories - Jagannatha-puri Admin',
                styles: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-buttons-bs5/buttons.bootstrap5.css',
                    '/admin-assets/vendor/libs/sweetalert2/sweetalert2.css',
                ],
                scripts: [
                    '/admin-assets/vendor/libs/moment/moment.js',
                    '/admin-assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js',
                    '/admin-assets/vendor/libs/sweetalert2/sweetalert2.js',
                    '/admin-assets/js/app-library-category-list.js'
                ]
            });
        });
    } catch (error) {
        console.error('Error fetching library categories:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getLibCategoryData = async (req, res) => {
    try {
        const categories = await prisma.libraryCategory.findMany({
            include: { _count: { select: { contents: true } } },
            orderBy: { created_at: 'desc' }
        });
        res.json({ data: categories });
    } catch (error) {
        console.error('Error fetching library category data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.saveLibCategory = async (req, res) => {
    try {
        const { id, name, description, status, show_on_home, meta_title, meta_description, meta_keywords } = req.body;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const imageData = req.file ? req.file.filename : undefined;
        const isShowOnHome = show_on_home === 'on' || show_on_home === true || show_on_home === 'true';

        if (id) {
            // Update
            const updateData = { name, slug, description, status, show_on_home: isShowOnHome, meta_title, meta_description, meta_keywords };
            if (imageData) updateData.image = imageData;
            await prisma.libraryCategory.update({
                where: { id: parseInt(id) },
                data: updateData
            });
        } else {
            // Create
            await prisma.libraryCategory.create({
                data: {
                    name,
                    slug,
                    description,
                    status: status || 'Active',
                    show_on_home: isShowOnHome,
                    image: imageData,
                    meta_title,
                    meta_description,
                    meta_keywords
                }
            });
        }
        res.json({ success: true });
        await logAction(req, id ? 'UPDATE_LIB_CATEGORY' : 'CREATE_LIB_CATEGORY', 'LibraryCategory', id || null, `Saved library category: ${name}`);
    } catch (error) {
        console.error('Error saving library category:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

exports.deleteLibCategory = async (req, res) => {
    try {
        const catId = parseInt(req.params.id);
        const category = await prisma.libraryCategory.findUnique({ where: { id: catId } });
        await prisma.libraryCategory.delete({
            where: { id: catId }
        });
        res.json({ success: true });
        await logAction(req, 'DELETE_LIB_CATEGORY', 'LibraryCategory', catId, `Deleted library category: ${category ? category.name : catId}`);
    } catch (error) {
        console.error('Error deleting library category:', error);
        res.status(500).json({ success: false, error: 'Cannot delete category with contents' });
    }
};

exports.searchLibTags = async (req, res) => {
    try {
        const { q } = req.query;
        const tags = await prisma.libraryTag.findMany({
            where: {
                name: { contains: q, mode: 'insensitive' }
            },
            take: 10
        });
        res.json(tags.map(t => ({ id: t.id, text: t.name })));
    } catch (error) {
        console.error('Error searching tags:', error);
        res.status(500).json([]);
    }
};

exports.getLibContentList = async (req, res) => {
    try {
        const categories = await prisma.libraryCategory.findMany({
            where: { status: 'Active' },
            orderBy: { name: 'asc' }
        });

        res.render('pages/admin-library-content-list', { categories }, (err, html) => {
            if (err) {
                console.error('Error rendering page:', err);
                return res.status(500).send('Internal Server Error');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: 'Library Content - Jagannatha-puri Admin',
                styles: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-buttons-bs5/buttons.bootstrap5.css',
                    '/admin-assets/vendor/libs/sweetalert2/sweetalert2.css',
                    '/admin-assets/vendor/libs/select2/select2.css',
                    '/admin-assets/vendor/libs/spinkit/spinkit.css'
                ],
                scripts: [
                    '/admin-assets/vendor/libs/moment/moment.js',
                    '/admin-assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js',
                    '/admin-assets/vendor/libs/sweetalert2/sweetalert2.js',
                    '/admin-assets/vendor/libs/select2/select2.js',
                    '/admin-assets/vendor/libs/block-ui/block-ui.js',
                    '/admin-assets/js/app-library-content-list.js'
                ]
            });
        });
    } catch (error) {
        console.error('Error fetching library contents:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getLibContentData = async (req, res) => {
    try {
        const { categoryId } = req.query;
        let where = {};
        if (categoryId && categoryId !== '') {
            where.categories = {
                some: {
                    id: parseInt(categoryId)
                }
            };
        }

        const contents = await prisma.libraryContent.findMany({
            where,
            include: { categories: true, tags: true },
            orderBy: { created_at: 'desc' }
        });
        res.json({ data: contents });
    } catch (error) {
        console.error('Error fetching library content data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getAddLibContent = async (req, res) => {
    try {
        const categories = await prisma.libraryCategory.findMany({
            where: { status: 'Active' }
        });
        const tags = await prisma.libraryTag.findMany();

        res.render('pages/admin-library-content-add', { categories, tags, content: null }, (err, html) => {
            if (err) return res.status(500).send('Error rendering page');
            res.render('layouts/admin-master', {
                body: html,
                title: 'Add Library Content - Jagannatha-puri Admin',
                styles: [
                    '/admin-assets/vendor/libs/quill/typography.css',
                    '/admin-assets/vendor/libs/quill/editor.css',
                    '/admin-assets/vendor/libs/select2/select2.css',
                    '/admin-assets/vendor/libs/tagify/tagify.css',
                    '/admin-assets/vendor/libs/sweetalert2/sweetalert2.css',
                ],
                scripts: [
                    '/admin-assets/vendor/libs/quill/quill.js',
                    '/admin-assets/vendor/libs/select2/select2.js',
                    '/admin-assets/vendor/libs/tagify/tagify.js',
                    '/admin-assets/vendor/libs/sweetalert2/sweetalert2.js',
                ]
            });
        });
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
};

exports.getEditLibContent = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const [content, categories, tags] = await Promise.all([
            prisma.libraryContent.findUnique({
                where: { id: id },
                include: { tags: true, categories: true }
            }),
            prisma.libraryCategory.findMany({ where: { status: 'Active' } }),
            prisma.libraryTag.findMany()
        ]);

        if (!content) return res.status(404).send('Content not found');

        res.render('pages/admin-library-content-add', { categories, tags, content }, (err, html) => {
            if (err) return res.status(500).send('Error rendering page');
            res.render('layouts/admin-master', {
                body: html,
                title: 'Edit Library Content - Jagannatha-puri Admin',
                styles: [
                    '/admin-assets/vendor/libs/quill/typography.css',
                    '/admin-assets/vendor/libs/quill/editor.css',
                    '/admin-assets/vendor/libs/select2/select2.css',
                    '/admin-assets/vendor/libs/tagify/tagify.css',
                    '/admin-assets/vendor/libs/sweetalert2/sweetalert2.css',
                ],
                scripts: [
                    '/admin-assets/vendor/libs/quill/quill.js',
                    '/admin-assets/vendor/libs/select2/select2.js',
                    '/admin-assets/vendor/libs/tagify/tagify.js',
                    '/admin-assets/vendor/libs/sweetalert2/sweetalert2.js',
                ]
            });
        });
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
};

exports.saveLibContent = async (req, res) => {
    try {
        let { id, title, subtitle, summary, content, categoryId, status, author, tags, meta_title, meta_description, meta_keywords } = req.body;
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const image = req.file ? req.file.filename : undefined;

        // Handle Categories (could be single ID or array)
        let categoryData = [];
        if (categoryId) {
            const categoryIds = Array.isArray(categoryId) ? categoryId : [categoryId];
            categoryData = categoryIds.map(cid => ({ id: parseInt(cid) }));
        }

        // Handle Tags (Support both raw string and Tagify JSON)
        let tagData = [];
        if (tags) {
            let tagArray = [];
            try {
                const parsed = JSON.parse(tags);
                if (Array.isArray(parsed)) {
                    tagArray = parsed.map(t => t.value);
                } else {
                    tagArray = [tags];
                }
            } catch (e) {
                tagArray = Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',') : [tags]);
            }

            for (const tagRaw of tagArray) {
                if (tagRaw.trim() === '') continue;
                if (/^\d+$/.test(tagRaw)) {
                    tagData.push({ id: parseInt(tagRaw) });
                } else {
                    const tagSlug = tagRaw.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    const existingTag = await prisma.libraryTag.upsert({
                        where: { name: tagRaw },
                        update: { slug: tagSlug },
                        create: { name: tagRaw, slug: tagSlug }
                    });
                    tagData.push({ id: existingTag.id });
                }
            }
        }

        const libraryData = {
            title,
            slug,
            subtitle,
            summary: DOMPurify.sanitize(summary || ''),
            content: DOMPurify.sanitize(content || ''),
            status,
            author,
            meta_title,
            meta_description,
            meta_keywords
        };

        if (image) libraryData.image = image;

        if (id && id !== '') {
            await prisma.libraryContent.update({
                where: { id: parseInt(id) },
                data: {
                    ...libraryData,
                    categories: { set: categoryData },
                    tags: { set: tagData }
                }
            });
        } else {
            await prisma.libraryContent.create({
                data: {
                    ...libraryData,
                    categories: { connect: categoryData },
                    tags: { connect: tagData }
                }
            });
        }
        res.json({ success: true });
        await logAction(req, id && id !== '' ? 'UPDATE_LIBRARY' : 'CREATE_LIBRARY', 'Library', id || null, `Saved library content: ${title}`);
    } catch (error) {
        console.error('Error saving library content:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

exports.deleteLibContent = async (req, res) => {
    try {
        const libId = parseInt(req.params.id);
        const libContent = await prisma.libraryContent.findUnique({ where: { id: libId } });
        await prisma.libraryContent.delete({
            where: { id: libId }
        });
        res.json({ success: true });
        await logAction(req, 'DELETE_LIBRARY', 'Library', libId, `Deleted library content: ${libContent ? libContent.title : libId}`);
    } catch (error) {
        console.error('Error deleting library content:', error);
        res.status(500).json({ success: false });
    }
};

exports.uploadLibraryImage = (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
    res.json({ url: `/uploads/${req.file.filename}` });
};
