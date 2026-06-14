const prisma = require('../../lib/prisma');
const { logAction } = require('../../lib/auditLogger');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const moment = require('moment');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

exports.getProductList = async (req, res) => {
    try {
        const [categories, totalProducts, activeProducts, onSaleProducts, lowStockProducts] = await Promise.all([
            prisma.category.findMany(),
            prisma.product.count(),
            prisma.product.count({ where: { status: 1 } }),
            prisma.product.count({ where: { on_sale: true } }),
            prisma.product.count({ where: { quantity: { lte: 10 } } })
        ]);

        res.render('pages/admin-product-list', {
            categories,
            totalProducts,
            activeProducts,
            onSaleProducts,
            lowStockProducts
        }, (err, html) => {
            if (err) {
                console.error('Error rendering admin product list:', err);
                return res.status(500).send('Error rendering admin product list');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: 'Products List',
                styles: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-buttons-bs5/buttons.bootstrap5.css',
                    '/admin-assets/vendor/libs/select2/select2.css',
                    '/admin-assets/vendor/libs/sweetalert2/sweetalert2.css'
                ],
                scripts: [
                    '/admin-assets/vendor/libs/moment/moment.js',
                    '/admin-assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js',
                    '/admin-assets/vendor/libs/select2/select2.js',
                    '/admin-assets/vendor/libs/sweetalert2/sweetalert2.js',
                    '/admin-assets/js/app-ecommerce-product-list.js'
                ]
            });
        });
    } catch (error) {
        console.error('Error in getProductList:', error);
        res.status(500).send('Internal Server Error');
    }
};


exports.addProduct = async (req, res) => {
    try {
        const attributes = await prisma.attribute.findMany();
        const categories = await prisma.category.findMany();

        res.render('pages/admin-product-add', { attributes, categories }, (err, html) => {
            if (err) {
                console.error('Error rendering admin product add:', err);
                return res.status(500).send('Error rendering admin product add');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: 'Add Products',
                styles: [
                    '/admin-assets/vendor/libs/quill/typography.css',
                    '/admin-assets/vendor/libs/quill/katex.css',
                    '/admin-assets/vendor/libs/quill/editor.css',
                    '/admin-assets/vendor/libs/select2/select2.css',
                    '/admin-assets/vendor/libs/dropzone/dropzone.css',
                    '/admin-assets/vendor/libs/flatpickr/flatpickr.css',
                    '/admin-assets/vendor/libs/tagify/tagify.css'
                ],
                scripts: [
                    '/admin-assets/vendor/libs/quill/katex.js',
                    '/admin-assets/vendor/libs/quill/quill.js',
                    '/admin-assets/vendor/libs/select2/select2.js',
                    '/admin-assets/vendor/libs/dropzone/dropzone.js',
                    '/admin-assets/vendor/libs/jquery-repeater/jquery-repeater.js',
                    '/admin-assets/vendor/libs/flatpickr/flatpickr.js',
                    '/admin-assets/vendor/libs/tagify/tagify.js',
                    '/admin-assets/js/app-ecommerce-product-add.js'
                ]
            });
        });
    } catch (error) {
        console.error('Error in addProduct:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.editProduct = async (req, res) => {
    try {
        const attributes = await prisma.attribute.findMany();
        const categories = await prisma.category.findMany();
        const product = await prisma.product.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { category: true }
        });

        if (!product) {
            return res.status(404).send('Product not found');
        }

        res.render('pages/admin-product-edit', { product, attributes, categories }, (err, html) => {
            if (err) {
                console.error('Error rendering admin product edit:', err);
                return res.status(500).send('Error rendering admin product edit');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: 'Edit Products',
                styles: [
                    '/admin-assets/vendor/libs/quill/typography.css',
                    '/admin-assets/vendor/libs/quill/katex.css',
                    '/admin-assets/vendor/libs/quill/editor.css',
                    '/admin-assets/vendor/libs/select2/select2.css',
                    '/admin-assets/vendor/libs/dropzone/dropzone.css',
                    '/admin-assets/vendor/libs/flatpickr/flatpickr.css',
                    '/admin-assets/vendor/libs/tagify/tagify.css'
                ],
                scripts: [
                    '/admin-assets/vendor/libs/quill/katex.js',
                    '/admin-assets/vendor/libs/quill/quill.js',
                    '/admin-assets/vendor/libs/select2/select2.js',
                    '/admin-assets/vendor/libs/dropzone/dropzone.js',
                    '/admin-assets/vendor/libs/jquery-repeater/jquery-repeater.js',
                    '/admin-assets/vendor/libs/flatpickr/flatpickr.js',
                    '/admin-assets/vendor/libs/tagify/tagify.js',
                    '/admin-assets/js/app-ecommerce-product-add.js'
                ]
            });
        });
    } catch (error) {
        console.error('Error in editProduct:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.debugProduct = async (req, res) => {
    try {
        const product = await prisma.product.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { category: true }
        });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getProductData = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            include: { category: true }
        });

        const formattedData = products.map(product => ({
            id: product.id,
            product_name: product.product_name,
            category: product.category ? product.category.name : 'Uncategorized',
            sku: product.sku,
            price: product.price,
            qty: product.quantity,
            status: product.status === 1 ? 'Published' : product.status === 2 ? 'Scheduled' : 'Inactive',
            is_featured: product.is_featured,
            image: product.images[0] || '',
            product_brand: product.product_brand || ''
        }));

        res.json({ data: formattedData });
    } catch (error) {
        console.error('Error in getProductData:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.uploadProductImages = (req, res) => {
    try {
        console.log('--- PRODUCT IMAGE UPLOAD DEBUG ---');
        console.log('Files received:', req.files ? req.files.length : 0);
        if (!req.files || req.files.length === 0) {
            console.warn('No files in request');
            return res.status(400).json({ success: false, error: 'No files uploaded' });
        }
        const filenames = req.files.map(file => file.filename);
        console.log('--- NEW UPLOAD SYSTEM HIT ---');
        console.log('Saved filenames:', filenames);
        res.json({ success: true, filenames, debug: 'NEW_UPLOAD_SYSTEM_HIT' });
    } catch (error) {
        console.error('CRITICAL Error uploading product images:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

exports.saveProduct = async (req, res) => {
    try {
        console.log('--- SAVE PRODUCT DEBUG ---');
        console.log('Body specifications:', req.body.specifications);
        let { product_name, product_brand, slug, sku, price, regular_price, sale_price, costPrice, on_sale, quantity, lowStockThreshold, category, status, product_type, specifications, description, is_cod, is_featured, show_in_explore, product_images, meta_title, meta_description, meta_keywords, image_alt } = req.body;

        const uploadedFilenames = req.files ? req.files.map(f => f.filename) : [];
        let finalImages = uploadedFilenames;

        if (product_images) {
            const jsonImages = Array.isArray(product_images) ? product_images : [product_images];
            finalImages = [...new Set([...finalImages, ...jsonImages])];
        }

        const categoryId = parseInt(category);
        if (isNaN(categoryId)) {
            return res.status(400).json({ success: false, error: 'Valid category is required' });
        }

        if (specifications && typeof specifications === 'string') {
            try {
                specifications = JSON.parse(specifications);
            } catch (e) {
                console.error('Error parsing specifications:', e);
                specifications = [];
            }
        }

        const newProduct = await prisma.product.create({
            data: {
                product_name,
                product_brand,
                slug,
                description: DOMPurify.sanitize(description),
                sku,
                price,
                regular_price: parseFloat(regular_price) || parseFloat(price) || 0,
                sale_price: sale_price ? parseFloat(sale_price) : null,
                costPrice: costPrice ? parseFloat(costPrice) : 0,
                on_sale: on_sale === true || on_sale === 'true' || on_sale === 'on',
                price_amount: parseFloat(regular_price) || parseFloat(price) || 0,
                quantity: parseInt(quantity) || 0,
                lowStockThreshold: parseInt(lowStockThreshold) || 10,
                category_id: categoryId,
                status: parseInt(status) || 1,
                is_cod: is_cod === true || is_cod === 'true' || is_cod === 'on',
                is_featured: is_featured === true || is_featured === 'true' || is_featured === 'on',
                show_in_explore: show_in_explore === true || show_in_explore === 'true' || show_in_explore === 'on',
                product_type: product_type || 'Simple',
                specifications: specifications || [],
                images: Array.isArray(finalImages) ? finalImages : (finalImages ? [finalImages] : []),
                meta_title,
                meta_description,
                meta_keywords,
                image_alt
            }
        });

        await logAction(req, 'CREATE_PRODUCT', 'Product', newProduct.id, `Created product: ${product_name}`);
        res.status(200).json({ success: true, message: 'Product added successfully', redirectUrl: '/admin/ecommerce/products' });
    } catch (error) {
        console.error('Error saving product:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('--- UPDATE PRODUCT DEBUG ---');
        console.log('Product ID:', id);
        console.log('Body specifications:', req.body.specifications);
        let { product_name, product_brand, slug, sku, price, regular_price, sale_price, costPrice, on_sale, quantity, lowStockThreshold, category, status, product_type, specifications, description, is_cod, is_featured, show_in_explore, product_images, meta_title, meta_description, meta_keywords, image_alt } = req.body;

        const uploadedFilenames = req.files ? req.files.map(f => f.filename) : [];

        let existingImages = [];
        if (product_images) {
            existingImages = Array.isArray(product_images) ? product_images : [product_images];
        }

        console.log('--- PRODUCT IMAGE DEBUG ---');
        console.log('Existing Images (from body):', existingImages);
        console.log('Uploaded Images:', uploadedFilenames);

        const finalImages = [...new Set([...existingImages, ...uploadedFilenames])];
        console.log('Final Images:', finalImages);

        const categoryId = parseInt(category);
        if (isNaN(categoryId)) {
            return res.status(400).json({ success: false, error: 'Valid category is required' });
        }

        if (specifications && typeof specifications === 'string') {
            try {
                specifications = JSON.parse(specifications);
            } catch (e) {
                console.error('Error parsing specifications:', e);
                specifications = [];
            }
        }

        const updatedProduct = await prisma.product.update({
            where: { id: parseInt(id) },
            data: {
                product_name,
                product_brand,
                slug,
                description: DOMPurify.sanitize(description),
                sku,
                price,
                regular_price: parseFloat(regular_price) || parseFloat(price) || 0,
                sale_price: sale_price ? parseFloat(sale_price) : null,
                costPrice: costPrice ? parseFloat(costPrice) : 0,
                on_sale: on_sale === true || on_sale === 'true' || on_sale === 'on',
                price_amount: parseFloat(regular_price) || parseFloat(price) || 0,
                quantity: parseInt(quantity) || 0,
                lowStockThreshold: parseInt(lowStockThreshold) || 10,
                category_id: categoryId,
                status: parseInt(status) || 1,
                is_cod: is_cod === true || is_cod === 'true' || is_cod === 'on',
                is_featured: is_featured === true || is_featured === 'true' || is_featured === 'on',
                show_in_explore: show_in_explore === true || show_in_explore === 'true' || show_in_explore === 'on',
                product_type: product_type || 'Simple',
                specifications: specifications || [],
                images: Array.isArray(finalImages) ? finalImages : (finalImages ? [finalImages] : []),
                meta_title,
                meta_description,
                meta_keywords,
                image_alt
            }
        });

        // Check for Low Stock and Trigger Notification
        const threshold = updatedProduct.lowStockThreshold !== null ? updatedProduct.lowStockThreshold : 10;
        console.log(`[DEBUG] UpdateProduct: ID ${updatedProduct.id}, Qty: ${updatedProduct.quantity}, Threshold: ${threshold}`);

        if (updatedProduct.quantity <= threshold) {
            console.log('[DEBUG] Creating Low Stock Notification...');
            await prisma.notification.create({
                data: {
                    type: 'low_stock',
                    message: `Low Stock Alert: ${updatedProduct.product_name} has ${updatedProduct.quantity} remaining.`,
                    link: `/admin/ecommerce/products/view/${updatedProduct.id}`,
                    isRead: false
                }
            });
        }

        await logAction(req, 'UPDATE_PRODUCT', 'Product', updatedProduct.id, `Updated product: ${product_name}`);
        // Return JSON success for client-side redirection
        res.status(200).json({ success: true, message: 'Product updated successfully', redirectUrl: '/admin/ecommerce/products' });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.viewProduct = async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: { category: true }
        });

        if (!product) return res.status(404).send('Product not found');

        // Inject Mock Rating (sync with frontend)
        product.mockRating = (product.id % 5) + 1;

        // Fetch Related Products (same category, limit 4)
        let relatedProducts = [];
        try {
            relatedProducts = await prisma.product.findMany({
                where: {
                    category_id: product.category_id,
                    id: { not: product.id },
                    status: 1
                },
                take: 4,
                select: {
                    id: true,
                    product_name: true,
                    slug: true,
                    price: true,
                    images: true,
                    category: {
                        select: { name: true }
                    }
                }
            });
        } catch (relatedError) {
            console.error('Error fetching related products for admin:', relatedError);
        }

        // Fetch real reviews from database with customer info
        const reviewsData = await prisma.review.findMany({
            where: { productId: productId },
            include: { customer: true },
            orderBy: { created_at: 'desc' }
        });

        const reviews = reviewsData.map(r => ({
            ...r,
            date: moment(r.created_at).format('DD MMM, YYYY')
        }));
        // Robustness for template
        if (!product.images || !Array.isArray(product.images)) {
            product.images = [];
        }
        if (!product.specifications || !Array.isArray(product.specifications)) {
            product.specifications = [];
        }

        res.render('pages/admin-product-view', { product, reviews, relatedProducts }, (err, html) => {
            if (err) {
                console.error('Error rendering product view:', err);
                return res.status(500).send('Error rendering product view');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: 'View Product Details',
                styles: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-buttons-bs5/buttons.bootstrap5.css'
                ],
                scripts: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js'
                ]
            });
        });
    } catch (error) {
        console.error('Error in viewProduct:', error);
        res.status(500).send('Internal Server Error');
    }
};
exports.apiViewProduct = async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: { category: true }
        });

        if (!product) return res.status(404).json({ success: false, error: 'Product not found' });

        // Inject Mock Rating
        product.mockRating = (product.id % 5) + 1;

        // Fetch Related Products
        let relatedProducts = [];
        try {
            relatedProducts = await prisma.product.findMany({
                where: {
                    category_id: product.category_id,
                    id: { not: product.id },
                    status: 1
                },
                take: 4,
                select: {
                    id: true,
                    product_name: true,
                    slug: true,
                    price: true,
                    images: true,
                    category: { select: { name: true } }
                }
            });
        } catch (e) {
            console.error('Error related:', e);
        }

        // Fetch real reviews
        const reviewsData = await prisma.review.findMany({
            where: { productId: productId },
            include: { customer: true },
            orderBy: { created_at: 'desc' }
        });

        const reviews = reviewsData.map(r => ({
            ...r,
            date: moment(r.created_at).format('DD MMM, YYYY')
        }));

        if (!product.images || !Array.isArray(product.images)) product.images = [];
        if (!product.specifications || !Array.isArray(product.specifications)) product.specifications = [];

        res.json({ success: true, product, reviews, relatedProducts });
    } catch (error) {
        console.error('Error in apiViewProduct:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const productId = parseInt(id);

        if (isNaN(productId)) {
            return res.status(400).json({ success: false, error: 'Invalid product ID' });
        }

        // Check for related order items (purchased products)
        const orderItemsCount = await prisma.orderItem.count({ where: { productId: productId } });
        if (orderItemsCount > 0) {
            return res.json({ success: false, error: `Cannot delete product. It is part of ${orderItemsCount} order(s). Please remove from orders or suspend the product instead.` });
        }

        // Check for related cart items
        const cartItemsCount = await prisma.cartItem.count({ where: { productId: productId } });
        if (cartItemsCount > 0) {
            return res.json({ success: false, error: `Cannot delete product. It is in ${cartItemsCount} customer cart(s).` });
        }

        const product = await prisma.product.findUnique({ where: { id: productId } });

        // Optional: Delete related reviews and wishlist items before deleting the product
        await prisma.review.deleteMany({ where: { productId: productId } });
        await prisma.wishlistItem.deleteMany({ where: { productId: productId } });

        await prisma.product.delete({
            where: { id: productId }
        });

        if (product) {
            await logAction(req, 'DELETE_PRODUCT', 'Product', product.id, `Deleted product: ${product.product_name}`);
        }

        res.json({ success: true, message: 'Product deleted successfully.' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.bulkDeleteProducts = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ success: false, error: 'No product IDs provided for deletion.' });
        }

        let deletedCount = 0;
        let skippedProducts = [];

        for (const id of ids) {
            const productId = parseInt(id);
            if (isNaN(productId)) continue;

            const product = await prisma.product.findUnique({ where: { id: productId } });
            if (!product) continue;

            const orderItemsCount = await prisma.orderItem.count({ where: { productId: productId } });
            const cartItemsCount = await prisma.cartItem.count({ where: { productId: productId } });

            if (orderItemsCount > 0 || cartItemsCount > 0) {
                skippedProducts.push(product.product_name || `ID ${productId}`);
                continue;
            }

            await prisma.review.deleteMany({ where: { productId: productId } });
            await prisma.wishlistItem.deleteMany({ where: { productId: productId } });

            await prisma.product.delete({ where: { id: productId } });
            deletedCount++;

            await logAction(req, 'DELETE_PRODUCT', 'Product', product.id, `Bulk deleted product: ${product.product_name}`);
        }

        if (skippedProducts.length > 0) {
            return res.json({
                success: true,
                message: `Successfully deleted ${deletedCount} product(s). Skipped the following because they are in orders or carts: ${skippedProducts.join(', ')}.`
            });
        }

        res.json({ success: true, message: `Successfully deleted ${deletedCount} product(s).` });

    } catch (error) {
        console.error('Error bulk deleting products:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.apiToggleStatus = async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
        
        const newStatus = product.status === 1 ? 2 : 1;
        const updatedProduct = await prisma.product.update({
            where: { id: productId },
            data: { status: newStatus }
        });
        
        res.json({ success: true, data: updatedProduct });
    } catch (error) {
        console.error('Error toggling product status:', error);
        res.status(500).json({ success: false, error: 'Error toggling product status' });
    }
};
