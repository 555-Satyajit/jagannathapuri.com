const prisma = require('../lib/prisma');
const configStore = require('../lib/configStore');
const moment = require('moment');
const bcrypt = require('bcryptjs');

const parsePrice = (priceStr) => {
    if (!priceStr) return 0;
    const cleanPrice = priceStr.toString().replace(/[^\d.]/g, '');
    return parseFloat(cleanPrice) || 0;
};

const { logAction } = require('../lib/auditLogger');

// ... existing imports

exports.getAuditLogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const skip = (page - 1) * limit;

        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    admin: {
                        select: { full_name: true, username: true, avatar: true }
                    }
                }
            }),
            prisma.auditLog.count()
        ]);

        const totalPages = Math.ceil(total / limit);

        req.app.render('pages/audit-logs', {
            logs,
            currentPage: page,
            totalPages,
            user: req.user
        }, (err, html) => {
            if (err) {
                console.error('Error rendering audit logs:', err);
                return res.status(500).send('Error rendering audit logs');
            }

            res.render('layouts/admin-master', {
                body: html,
                title: 'Audit Logs',
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
        console.error('Error fetching audit logs:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getDashboard = async (req, res) => {
    try {
        const staffId = req.session.admin ? req.session.admin.id : null;
        const staff = staffId ? await prisma.staff.findUnique({ where: { id: staffId }, include: { role: true } }) : null;

        const now = new Date();
        const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const [
            totalRevenueAgg,
            totalOrders,
            totalProducts,
            totalCustomers,
            recentOrders,
            lowStockProducts,
            last7DaysOrders,
            paidOrdersForProfit,
            currentMonthOrders,
            lastMonthOrders
        ] = await Promise.all([
            prisma.order.aggregate({
                _sum: { totalAmount: true },
                where: {
                    paymentStatus: 1 // Paid
                }
            }),
            prisma.order.count(),
            prisma.product.count(),
            prisma.customer.count(),
            prisma.order.findMany({
                take: 5,
                orderBy: { created_at: 'desc' },
                include: { customer: true }
            }),
            prisma.$queryRaw`SELECT * FROM "Product" WHERE quantity <= "lowStockThreshold" ORDER BY quantity ASC LIMIT 5`,

            prisma.order.findMany({
                where: {
                    created_at: {
                        gte: sevenDaysAgo
                    },
                    paymentStatus: 1
                },
                select: {
                    created_at: true,
                    totalAmount: true
                }
            }),
            prisma.order.findMany({
                where: {
                    paymentStatus: 1
                },
                include: {
                    items: {
                        include: {
                            product: {
                                select: { costPrice: true }
                            }
                        }
                    }
                }
            }),
            prisma.order.aggregate({
                _sum: { totalAmount: true },
                where: {
                    paymentStatus: 1,
                    created_at: { gte: firstDayCurrentMonth }
                }
            }),
            prisma.order.aggregate({
                _sum: { totalAmount: true },
                where: {
                    paymentStatus: 1,
                    created_at: { gte: firstDayLastMonth, lte: lastDayLastMonth }
                }
            }),
            prisma.order.groupBy({
                by: ['status'],
                _count: { status: true }
            })
        ]);

        const totalRevenue = totalRevenueAgg._sum.totalAmount || 0;

        // Calculate Profit
        let totalProfit = 0;
        paidOrdersForProfit.forEach(order => {
            order.items.forEach(item => {
                const cost = item.product.costPrice || 0;
                const sellingPrice = item.price;
                const profit = (sellingPrice - cost) * item.quantity;
                totalProfit += profit;
            });
        });

        // Sales Overview Data
        const currentMonthRevenue = currentMonthOrders._sum.totalAmount || 0;
        const lastMonthRevenue = lastMonthOrders._sum.totalAmount || 0;
        const averageDailySales = currentMonthRevenue / now.getDate();
        const salesPerformance = lastMonthRevenue > 0 ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 100;

        // Process last 7 days revenue (Revenue Growth Chart)
        const salesData = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            salesData[d.toISOString().split('T')[0]] = 0;
        }

        last7DaysOrders.forEach(order => {
            const date = order.created_at.toISOString().split('T')[0];
            if (salesData[date] !== undefined) {
                salesData[date] += order.totalAmount;
            }
        });

        const revenueChartLabels = Object.keys(salesData);
        const revenueChartData = Object.values(salesData);

        // Weekly Order Summary (Area Chart) - Using Revenue for graph
        const weeklyOrderSummaryData = Object.values(salesData); // Reuse same daily data for consistency
        const weeklyOrderSummaryLabels = Object.keys(salesData);

        // Order Status Overview (Donut Chart)
        const [orderStatusCounts, failedOrdersCount] = await Promise.all([
            prisma.order.groupBy({
                by: ['status'],
                _count: { status: true },
                where: {
                    paymentStatus: { notIn: [3, 4] } // Exclude Failed/Cancelled from active/completed counts
                }
            }),
            prisma.order.count({
                where: {
                    paymentStatus: { in: [3, 4] } // 3: Failed, 4: Cancelled
                }
            })
        ]);

        let completed = 0, active = 0;
        orderStatusCounts.forEach(stat => {
            if (stat.status === 2) {
                completed += stat._count.status; // Delivered
            } else {
                active += stat._count.status; // 1, 3, 4 are active states
            }
        });

        const orderStatusSeries = [completed, active, failedOrdersCount];

        req.app.render('pages/admin-dashboard', {
            totalRevenue,
            totalProfit,
            totalOrders,
            totalProducts,
            totalCustomers,
            recentOrders,
            lowStockProducts,
            revenueChartLabels: JSON.stringify(revenueChartLabels),
            revenueChartData: JSON.stringify(revenueChartData),
            weeklyOrderSummaryData: JSON.stringify(weeklyOrderSummaryData),
            weeklyOrderSummaryLabels: JSON.stringify(weeklyOrderSummaryLabels),
            orderStatusSeries: JSON.stringify(orderStatusSeries),
            orderStatusLabels: JSON.stringify(['Completed', 'Pending', 'Failed']),
            currentMonthRevenue,
            averageDailySales,
            salesPerformance: salesPerformance.toFixed(1),
            staff
        }, (err, html) => {
            if (err) {
                console.error('Error rendering admin dashboard:', err);
                return res.status(500).send('Error rendering admin dashboard');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: 'Admin Dashboard',
                staff,
                scripts: ['/admin-assets/vendor/libs/apex-charts/apexcharts.js', '/admin-assets/js/admin-dashboard-real.js']
            });
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getCategoryList = async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            where: { parentId: null },
            include: { subCategories: true }
        });

        req.app.render('pages/admin-category-list', { categories }, (err, html) => {
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
            slug: cat.slug
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
        let { categoryTitle, slug, parentCategory, status, description } = req.body;
        const image = req.file ? req.file.filename : null;

        if (Array.isArray(description)) {
            description = description.filter(d => d !== "").pop() || "";
        }

        if (!categoryTitle || !slug) {
            return res.status(400).json({ success: false, error: 'Title and Slug are required' });
        }

        const newCategory = await prisma.category.create({
            data: {
                name: categoryTitle,
                slug: slug,
                description: description,
                image: image,
                status: status || 'Scheduled',
                parentId: (parentCategory && parentCategory !== "") ? parseInt(parentCategory) : null
            }
        });

        res.json({ success: true, category: newCategory });
    } catch (error) {
        console.error('Error saving category:', error);
        res.status(500).json({ success: false, error: error.message, stack: error.stack });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await prisma.category.findUnique({ where: { id: parseInt(id) } });

        if (category && category.image) {
            const fs = require('fs');
            const path = require('path');
            const imagePath = path.join(__dirname, '../../../admin-panel/assets/img/ecommerce-images', category.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await prisma.category.delete({ where: { id: parseInt(id) } });
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getProductList = async (req, res) => {
    try {
        const [categories, totalProducts, activeProducts, onSaleProducts, lowStockProducts] = await Promise.all([
            prisma.category.findMany(),
            prisma.product.count(),
            prisma.product.count({ where: { status: 1 } }),
            prisma.product.count({ where: { on_sale: true } }),
            prisma.product.count({ where: { quantity: { lte: 10 } } })
        ]);

        req.app.render('pages/admin-product-list', {
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
                    '/admin-assets/vendor/libs/select2/select2.css'
                ],
                scripts: [
                    '/admin-assets/vendor/libs/moment/moment.js',
                    '/admin-assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js',
                    '/admin-assets/vendor/libs/select2/select2.js',
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

        req.app.render('pages/admin-product-add', { attributes, categories }, (err, html) => {
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

        req.app.render('pages/admin-product-edit', { product, attributes, categories }, (err, html) => {
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
        let { product_name, product_brand, slug, sku, price, regular_price, sale_price, costPrice, on_sale, quantity, lowStockThreshold, category, status, product_type, specifications, description, is_cod, is_featured, show_in_explore, product_images } = req.body;

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
                description,
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
                images: Array.isArray(finalImages) ? finalImages : (finalImages ? [finalImages] : [])
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
        let { product_name, product_brand, slug, sku, price, regular_price, sale_price, costPrice, on_sale, quantity, lowStockThreshold, category, status, product_type, specifications, description, is_cod, is_featured, show_in_explore, product_images } = req.body;

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
                description,
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
                images: Array.isArray(finalImages) ? finalImages : (finalImages ? [finalImages] : [])
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

exports.deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.notification.update({
            where: { id: parseInt(id) },
            data: { isArchived: true }
        });
        res.json({ success: true, message: 'Notification removed' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.markNotificationRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await prisma.notification.update({
            where: { id: parseInt(id) },
            data: { isRead: true }
        });

        // Redirect to the notification's link (Product View page)
        res.redirect(notification.link);
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.redirect('/admin'); // Fallback
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await prisma.product.findUnique({ where: { id: parseInt(id) } }); // Fetch before delete to get name

        await prisma.product.delete({
            where: { id: parseInt(id) }
        });

        if (product) {
            await logAction(req, 'DELETE_PRODUCT', 'Product', product.id, `Deleted product: ${product.product_name}`);
        }

        res.redirect('/admin/ecommerce/products');
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getCouponList = async (req, res) => {
    try {
        const coupons = await prisma.coupon.findMany({
            orderBy: { created_at: 'desc' }
        });

        // Format dates for display
        const formattedCoupons = coupons.map(coupon => ({
            ...coupon,
            expiry: coupon.expiry_date ? coupon.expiry_date.toISOString().split('T')[0] : 'No expiry',
            type: coupon.discount_type,
            amount: coupon.discount_amount
        }));

        req.app.render('pages/admin-coupon-list', { coupons: formattedCoupons }, (err, html) => {
            if (err) {
                console.error('Error rendering admin coupon list:', err);
                return res.status(500).send('Error rendering admin coupon list');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: 'Coupons List',
                styles: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-buttons-bs5/buttons.bootstrap5.css',
                    '/admin-assets/vendor/libs/select2/select2.css'
                ],
                scripts: [
                    '/admin-assets/vendor/libs/moment/moment.js',
                    '/admin-assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js',
                    '/admin-assets/vendor/libs/select2/select2.js',
                    '/admin-assets/js/app-ecommerce-coupon-list.js'
                ]
            });
        });
    } catch (error) {
        console.error('Error fetching coupon list:', error);
        res.status(500).send('Error fetching coupon list');
    }
};

exports.addCoupon = (req, res) => {
    req.app.render('pages/admin-coupon-add', (err, html) => {
        if (err) {
            console.error('Error rendering admin coupon add:', err);
            return res.status(500).send('Error rendering admin coupon add');
        }
        res.render('layouts/admin-master', {
            body: html,
            title: 'Add Coupons',
            styles: [
                '/admin-assets/vendor/libs/flatpickr/flatpickr.css',
                '/admin-assets/vendor/libs/select2/select2.css'
            ],
            scripts: [
                '/admin-assets/vendor/libs/flatpickr/flatpickr.js',
                '/admin-assets/vendor/libs/select2/select2.js'
            ]
        });
    });
};

exports.saveCoupon = async (req, res) => {
    try {
        const { code, type, amount, expiry, status, usage_limit, per_user_limit } = req.body;
        await prisma.coupon.create({
            data: {
                code,
                discount_type: type,
                discount_amount: parseFloat(amount),
                expiry_date: expiry ? new Date(expiry) : null,
                status,
                usage_limit: usage_limit ? parseInt(usage_limit) : null,
                per_user_limit: per_user_limit ? parseInt(per_user_limit) : null
            }
        });
        res.redirect('/admin/ecommerce/coupons');
    } catch (error) {
        console.error('Error saving coupon:', error);
        res.status(500).send('Error saving coupon');
    }
};

exports.editCoupon = async (req, res) => {
    try {
        const coupon = await prisma.coupon.findUnique({
            where: { id: parseInt(req.params.id) }
        });

        if (!coupon) {
            return res.status(404).send('Coupon not found');
        }

        // Format date for the input[type=date]
        const formattedCoupon = {
            ...coupon,
            expiry: coupon.expiry_date ? coupon.expiry_date.toISOString().split('T')[0] : '',
            type: coupon.discount_type,
            amount: coupon.discount_amount,
            per_user_limit: coupon.per_user_limit
        };

        req.app.render('pages/admin-coupon-edit', { coupon: formattedCoupon }, (err, html) => {
            if (err) {
                console.error('Error rendering admin coupon edit:', err);
                return res.status(500).send('Error rendering admin coupon edit');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: 'Edit Coupons',
                styles: [
                    '/admin-assets/vendor/libs/flatpickr/flatpickr.css',
                    '/admin-assets/vendor/libs/select2/select2.css'
                ],
                scripts: [
                    '/admin-assets/vendor/libs/flatpickr/flatpickr.js',
                    '/admin-assets/vendor/libs/select2/select2.js'
                ]
            });
        });
    } catch (error) {
        console.error('Error fetching coupon for edit:', error);
        res.status(500).send('Error fetching coupon');
    }
};

exports.updateCoupon = async (req, res) => {
    try {
        const { code, type, amount, expiry, status, usage_limit, per_user_limit } = req.body;
        await prisma.coupon.update({
            where: { id: parseInt(req.params.id) },
            data: {
                code,
                discount_type: type,
                discount_amount: parseFloat(amount),
                expiry_date: expiry ? new Date(expiry) : null,
                status,
                usage_limit: usage_limit ? parseInt(usage_limit) : null,
                per_user_limit: per_user_limit ? parseInt(per_user_limit) : null
            }
        });
        res.redirect('/admin/ecommerce/coupons');
    } catch (error) {
        console.error('Error updating coupon:', error);
        res.status(500).send('Error updating coupon');
    }
};

exports.deleteCoupon = async (req, res) => {
    try {
        await prisma.coupon.delete({
            where: { id: parseInt(req.params.id) }
        });
        res.json({ success: true, message: 'Coupon deleted successfully' });
    } catch (error) {
        console.error('Error deleting coupon:', error);
        res.status(500).json({ success: false, error: 'Error deleting coupon' });
    }
};

exports.getOrderList = async (req, res) => {
    try {
        const [pendingPayment, completed, failed, cancelled] = await Promise.all([
            prisma.order.count({ where: { paymentStatus: 2 } }),
            prisma.order.count({ where: { paymentStatus: 1 } }),
            prisma.order.count({ where: { paymentStatus: 3 } }),
            prisma.order.count({ where: { paymentStatus: 4 } })
        ]);

        const stats = {
            pendingPayment,
            completed,
            failed,
            cancelled
        };

        req.app.render('pages/admin-order-list', { stats }, (err, html) => {
            if (err) {
                console.error('Error rendering admin order list:', err);
                return res.status(500).send('Error rendering admin order list');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: 'Orders List',
                styles: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-buttons-bs5/buttons.bootstrap5.css'
                ],
                scripts: [
                    '/admin-assets/vendor/libs/moment/moment.js',
                    '/admin-assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js',
                    '/admin-assets/js/app-ecommerce-order-list.js'
                ]
            });
        });
    } catch (error) {
        console.error('Error fetching order stats:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getOrderData = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            include: {
                customer: true
            },
            orderBy: {
                date: 'desc'
            }
        });

        const formattedOrders = orders.map(order => {
            // Map payment methods to available icons in admin-panel/assets/img/icons/payments
            let methodIcon = 'mastercard'; // default
            const pm = (order.paymentMethod || '').toLowerCase();
            if (pm.includes('visa')) methodIcon = 'visa';
            else if (pm.includes('paypal')) methodIcon = 'paypal';
            else if (pm.includes('cash') || pm.includes('delivery')) methodIcon = 'mastercard'; // Fallback to mastercard or generic
            else if (pm.includes('bank')) methodIcon = 'visa'; // Fallback

            return {
                id: order.id,
                order: order.orderNumber,
                date: order.date.toISOString(),
                customer: order.customer.fullName,
                customer_id: order.customer.id,
                email: order.customer.email,
                avatar: order.customer.avatar || '',
                payment: order.paymentStatus,
                status: order.status,
                method: methodIcon,
                method_number: order.methodNumber || 'COD'
            };
        });

        res.json({ data: formattedOrders });
    } catch (error) {
        console.error('Error fetching order data:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch order data' });
    }
};

exports.deleteOrder = async (req, res) => {
    try {
        const orderId = parseInt(req.params.id);

        // Use a transaction to delete items and then the order
        await prisma.$transaction([
            prisma.orderItem.deleteMany({
                where: { orderId: orderId }
            }),
            prisma.order.delete({
                where: { id: orderId }
            })
        ]);

        res.json({ success: true, message: 'Order deleted successfully' });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ success: false, error: 'Failed to delete order' });
    }
};

exports.getOrderDetails = async (req, res) => {
    try {
        const orderId = parseInt(req.params.id);
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                customer: {
                    include: {
                        addresses: true
                    }
                },
                shippingAddress: true,
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        if (!order) {
            return res.status(404).send('Order not found');
        }

        req.app.render('pages/admin-order-details', { order }, (err, html) => {
            if (err) {
                console.error('Error rendering admin order details:', err);
                return res.status(500).send('Error rendering admin order details');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: 'Order Details',
                styles: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-buttons-bs5/buttons.bootstrap5.css',
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
        console.error('Error fetching order details:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const orderId = parseInt(req.params.id);
        const { status, paymentStatus } = req.body;

        const updateData = {};
        if (status !== undefined) updateData.status = parseInt(status);
        if (paymentStatus !== undefined) updateData.paymentStatus = parseInt(paymentStatus);

        await prisma.order.update({
            where: { id: orderId },
            data: updateData
        });

        res.json({ success: true, message: 'Order status updated successfully' });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ success: false, error: 'Failed to update order status' });
    }
};

const invoiceService = require('../services/invoiceService');

exports.downloadInvoice = async (req, res) => {
    try {
        const orderId = parseInt(req.params.id);

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: { product: true }
                },
                customer: true,
                shippingAddress: true
            }
        });

        if (!order) {
            return res.status(404).send('Order not found');
        }

        // Render the EJS template to a string
        req.app.render('pages/invoice-print', { order }, async (err, html) => {
            if (err) {
                console.error('Error rendering invoice template:', err);
                return res.status(500).send('Error generating invoice');
            }

            try {
                const pdfBuffer = await invoiceService.generateInvoicePdf(html);

                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.orderNumber}.pdf`);
                res.send(pdfBuffer);
            } catch (pdfError) {
                console.error('Error causing PDF generation:', pdfError);
                res.status(500).send('Error generating PDF');
            }
        });

    } catch (error) {
        console.error('Error downloading invoice:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getCustomerList = (req, res) => {
    req.app.render('pages/admin-customer-list', (err, html) => {
        if (err) {
            console.error('Error rendering admin customer list:', err);
            return res.status(500).send('Error rendering admin customer list');
        }
        res.render('layouts/admin-master', {
            body: html,
            title: 'Customers List',
            styles: [
                '/admin-assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css',
                '/admin-assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.css',
                '/admin-assets/vendor/libs/datatables-buttons-bs5/buttons.bootstrap5.css',
                '/admin-assets/vendor/libs/select2/select2.css',
                '/admin-assets/vendor/libs/formvalidation/dist/css/formValidation.min.css'
            ],
            scripts: [
                '/admin-assets/vendor/libs/moment/moment.js',
                '/admin-assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js',
                '/admin-assets/vendor/libs/select2/select2.js',
                '/admin-assets/vendor/libs/formvalidation/dist/js/FormValidation.min.js',
                '/admin-assets/vendor/libs/formvalidation/dist/js/plugins/Bootstrap5.min.js',
                '/admin-assets/vendor/libs/formvalidation/dist/js/plugins/AutoFocus.min.js',
                '/admin-assets/vendor/libs/cleavejs/cleave.js',
                '/admin-assets/vendor/libs/cleavejs/cleave-phone.js',
                '/admin-assets/js/app-ecommerce-customer-all.js'
            ]
        });
    });
};

exports.getCustomerData = async (req, res) => {
    try {
        const customers = await prisma.customer.findMany({
            include: {
                addresses: {
                    where: { isDefault: true }
                }
            }
        });

        const formattedData = customers.map(c => ({
            id: c.id,
            customer: c.fullName,
            customer_id: c.id.toString().padStart(4, '0'),
            country: c.addresses[0]?.country || 'N/A',
            country_code: 'in', // Defaulting to India for now or mapping if needed
            order: c.orderCount,
            total_spent: `₹${c.totalSpent}`,
            email: c.email,
            image: c.avatar || ''
        }));

        res.json({ data: formattedData });
    } catch (error) {
        console.error('Error fetching customer data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.saveCustomer = async (req, res) => {
    try {
        const { customerName, customerEmail, customerContact, customerAddress1, customerAddress2, customerTown, customerState, pin } = req.body;

        // Basic implementation: Create customer and their default shipping address
        const newCustomer = await prisma.customer.create({
            data: {
                fullName: customerName,
                email: customerEmail,
                phone: customerContact,
                status: 'Active',
                addresses: {
                    create: {
                        addressLine1: customerAddress1,
                        addressLine2: customerAddress2,
                        city: customerTown,
                        state: customerState,
                        zipCode: pin,
                        country: 'India', // Hardcoded for now as per the select in EJS
                        isDefault: true,
                        type: 'Shipping'
                    }
                }
            }
        });

        res.json({ success: true, customer: newCustomer });
    } catch (error) {
        console.error('Error saving customer:', error);

        if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
            return res.status(400).json({ success: false, error: 'A customer with this email already exists.' });
        }

        res.status(500).json({ success: false, error: 'An unexpected error occurred while saving the customer.' });
    }
};

exports.getCustomerDetails = async (req, res) => {
    try {
        const customerId = parseInt(req.params.id);
        const tab = req.params.tab || 'overview';

        const customer = await prisma.customer.findUnique({
            where: { id: customerId },
            include: {
                addresses: true,
                orders: true
            }
        });

        if (!customer) {
            return res.status(404).send('Customer not found');
        }

        // Format for EJS (mapping Prisma model to expected UI object if needed)
        const formattedCustomer = {
            ...customer,
            customer: customer.fullName, // UI expects .customer
            customer_id: customer.id.toString().padStart(4, '0'),
            total_spent: `₹${customer.totalSpent}`,
            order: customer.orderCount,
            image: customer.avatar || '',
            phone: customer.phone || '',
            username: customer.fullName.toLowerCase().replace(/\s/g, '.'),
            country: customer.addresses.find(a => a.isDefault)?.country || 'N/A'
        };

        req.app.render('pages/admin-customer-details', { customer: formattedCustomer, activeTab: tab }, (err, html) => {
            if (err) {
                console.error('Error rendering page:', err);
                return res.status(500).send('Internal Server Error');
            }

            const scripts = [
                '/admin-assets/vendor/libs/moment/moment.js',
                '/admin-assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js',
                '/admin-assets/vendor/libs/sweetalert2/sweetalert2.js',
                '/admin-assets/vendor/libs/cleavejs/cleave.js',
                '/admin-assets/vendor/libs/cleavejs/cleave-phone.js',
                '/admin-assets/vendor/libs/select2/select2.js',
                '/admin-assets/vendor/libs/formvalidation/dist/js/FormValidation.min.js',
                '/admin-assets/vendor/libs/formvalidation/dist/js/plugins/Bootstrap5.min.js',
                '/admin-assets/vendor/libs/formvalidation/dist/js/plugins/AutoFocus.min.js',
                '/admin-assets/js/app-ecommerce-customer-detail.js'
            ];

            if (tab === 'overview') {
                scripts.push('/admin-assets/js/app-ecommerce-customer-detail-overview.js');
            } else if (tab === 'security') {
                scripts.push('/admin-assets/js/modal-enable-otp.js');
                scripts.push('/admin-assets/js/app-user-view-security.js');
            }

            res.render('layouts/admin-master', {
                body: html,
                title: 'Customer Details - Customers',
                styles: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-buttons-bs5/buttons.bootstrap5.css',
                    '/admin-assets/vendor/libs/animate-css/animate.css',
                    '/admin-assets/vendor/libs/sweetalert2/sweetalert2.css',
                    '/admin-assets/vendor/libs/select2/select2.css',
                    '/admin-assets/vendor/libs/formvalidation/dist/css/formValidation.min.css'
                ],
                scripts: scripts
            });
        });
    } catch (error) {
        console.error('Error fetching customer details:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getCustomerOrdersData = async (req, res) => {
    try {
        const customerId = parseInt(req.params.id);
        const orders = await prisma.order.findMany({
            where: { customer_id: customerId },
            orderBy: { id: 'desc' }
        });

        // Mapping statuses to the ones expected by the JS
        // 1: Ready to Pickup, 2: Dispatched, 3: Delivered, 4: Out for delivery
        const statusMap = {
            'Pending': 1,
            'Dispatched': 2,
            'Delivered': 3,
            'Out for delivery': 4
        };

        const formattedOrders = orders.map(o => ({
            id: o.id,
            order: o.id.toString().padStart(4, '0'),
            date: o.created_at || new Date(),
            status: statusMap[o.status] || 1,
            spent: `₹${o.totalAmount || 0}`
        }));

        res.json({ data: formattedOrders });
    } catch (error) {
        console.error('Error fetching customer orders:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.deleteCustomer = async (req, res) => {
    try {
        const customerId = parseInt(req.params.id);

        // Delete associated addresses and orders first
        await prisma.address.deleteMany({ where: { customer_id: customerId } });
        await prisma.order.deleteMany({ where: { customer_id: customerId } });

        await prisma.customer.delete({
            where: { id: customerId }
        });

        res.json({ success: true, message: 'Customer deleted successfully' });
    } catch (error) {
        console.error('Error deleting customer:', error);
        res.status(500).json({ success: false, error: 'Failed to delete customer' });
    }
};

exports.getTransactionList = async (req, res) => {
    try {
        const [totalCount, totalAmountResult, successfulCount, otherCount] = await Promise.all([
            prisma.transaction.count(),
            prisma.transaction.aggregate({
                _sum: { amount: true }
            }),
            prisma.transaction.count({ where: { status: 'Paid' } }),
            prisma.transaction.count({ where: { status: { in: ['Pending', 'Failed'] } } })
        ]);

        const stats = {
            totalCount,
            totalAmount: totalAmountResult._sum.amount || 0,
            successfulCount,
            otherCount
        };

        req.app.render('pages/admin-transaction-list', { stats }, (err, html) => {
            if (err) {
                console.error('Error rendering page:', err);
                return res.status(500).send('Internal Server Error');
            }

            res.render('layouts/admin-master', {
                body: html,
                title: 'Transactions - eCommerce',
                styles: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-buttons-bs5/buttons.bootstrap5.css'
                ],
                scripts: [
                    '/admin-assets/vendor/libs/moment/moment.js',
                    '/admin-assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js',
                    '/admin-assets/js/app-ecommerce-transaction-list.js'
                ]
            });
        });
    } catch (error) {
        console.error('Error fetching transaction stats:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getTransactionData = async (req, res) => {
    try {
        const transactions = await prisma.transaction.findMany({
            include: {
                customer: true
            },
            orderBy: {
                date: 'desc'
            }
        });

        const formattedTransactions = transactions.map(t => ({
            id: t.id,
            transaction_id: t.transactionId,
            customer_id: t.customer_id,
            customer_name: t.customer.fullName,
            customer_email: t.customer.email,
            amount: t.amount,
            date: t.date.toISOString(),
            payment_method: t.paymentMethod,
            payment_last4: t.paymentLast4,
            status: t.status
        }));

        res.json({ data: formattedTransactions });
    } catch (error) {
        console.error('Error fetching transaction data:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch transaction data' });
    }
};



exports.getStaffList = async (req, res) => {

    try {
        const staffList = await prisma.staff.findMany({
            orderBy: { created_at: 'desc' },
            include: { role: true } // Include role relation
        });

        const roles = await prisma.role.findMany(); // Fetch all roles

        // Format date for display
        const formattedStaff = staffList.map(staff => ({
            ...staff,
            role: staff.role ? staff.role.name : 'N/A', // Display role name
            joining_date: staff.joining_date || new Date(staff.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        }));

        req.app.render('pages/admin-staff-list', { staffList: formattedStaff, roles }, (err, html) => {
            if (err) {
                console.error('Error rendering page:', err);
                return res.status(500).send('Internal Server Error');
            }

            res.render('layouts/admin-master', {
                body: html,
                title: 'Our Staff - Jay Subhdra Admin',
                styles: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-buttons-bs5/buttons.bootstrap5.css',
                    '/admin-assets/vendor/libs/select2/select2.css',
                    '/admin-assets/vendor/libs/@form-validation/umd/styles/index.min.css'
                ],
                scripts: [
                    '/admin-assets/vendor/libs/moment/moment.js',
                    '/admin-assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js',
                    '/admin-assets/vendor/libs/select2/select2.js',
                    '/admin-assets/vendor/libs/@form-validation/umd/bundle/popular.min.js',
                    '/admin-assets/vendor/libs/@form-validation/umd/plugin-bootstrap5/index.min.js',
                    '/admin-assets/vendor/libs/@form-validation/umd/plugin-auto-focus/index.min.js',
                    '/admin-assets/vendor/libs/cleavejs/cleave.js',
                    '/admin-assets/vendor/libs/cleavejs/cleave-phone.js',
                    '/admin-assets/js/app-staff-list.js'
                ]
            });
        });
    } catch (error) {
        console.error('Error fetching staff list:', error);
        res.status(500).send('Error fetching staff list');
    }
};

exports.getStaffView = async (req, res) => {
    try {
        const staffId = parseInt(req.params.id);
        const staff = await prisma.staff.findUnique({
            where: { id: staffId }
        });

        if (!staff) {
            return res.status(404).send('Staff member not found');
        }

        req.app.render('pages/admin-staff-view', { staff }, (err, html) => {
            if (err) {
                console.error('Error rendering page:', err);
                return res.status(500).send('Internal Server Error');
            }

            res.render('layouts/admin-master', {
                body: html,
                title: 'Staff View - Jay Subhdra Admin',
                styles: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-buttons-bs5/buttons.bootstrap5.css',
                    '/admin-assets/vendor/libs/animate-css/animate.css',
                    '/admin-assets/vendor/libs/sweetalert2/sweetalert2.css',
                    '/admin-assets/vendor/libs/select2/select2.css',
                    '/admin-assets/vendor/libs/@form-validation/umd/styles/index.min.css'
                ],
                scripts: [
                    '/admin-assets/vendor/libs/moment/moment.js',
                    '/admin-assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js',
                    '/admin-assets/vendor/libs/sweetalert2/sweetalert2.js',
                    '/admin-assets/vendor/libs/cleavejs/cleave.js',
                    '/admin-assets/vendor/libs/cleavejs/cleave-phone.js',
                    '/admin-assets/vendor/libs/select2/select2.js',
                    '/admin-assets/vendor/libs/@form-validation/umd/bundle/popular.min.js',
                    '/admin-assets/vendor/libs/@form-validation/umd/plugin-bootstrap5/index.min.js',
                    '/admin-assets/vendor/libs/@form-validation/umd/plugin-auto-focus/index.min.js',
                    '/admin-assets/js/app-staff-view.js',
                    '/admin-assets/js/app-user-view.js',
                    '/admin-assets/js/app-user-view-account.js'
                ]

            });
        });
    } catch (error) {
        console.error('Error fetching staff details:', error);
        res.status(500).send('Error fetching staff details');
    }
};

exports.saveStaff = async (req, res) => {
    try {
        const { userFullname, userEmail, userContact, userRole, userPassword } = req.body;

        // Check if user exists
        const existingUser = await prisma.staff.findFirst({
            where: {
                OR: [
                    { email: userEmail },
                    { username: userEmail } // Using email as username for now as per form
                ]
            }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        // Find role
        const role = await prisma.role.findUnique({
            where: { name: userRole }
        });

        // Hash password
        const hashedPassword = await bcrypt.hash(userPassword, 10);

        const newStaff = await prisma.staff.create({
            data: {
                full_name: userFullname,
                email: userEmail,
                username: userEmail, // Defaulting username to email
                contact: userContact,
                password: hashedPassword,
                roleId: role ? role.id : null,
                // role: userRole, // Deprecated string field
                status: 'Active',
                avatar: '' // Default empty
            }
        });

        res.status(200).json({ message: 'Staff added successfully', staff: newStaff });
        await logAction(req, 'CREATE_STAFF', 'Staff', newStaff.id, `Created staff member: ${userFullname} (${userRole})`);
    } catch (error) {
        console.error('Error saving staff:', error);
        res.status(500).json({ error: 'Error saving staff' });
    }
};

exports.updateStaff = async (req, res) => {
    try {
        const {
            staff_id,
            modalEditUserFirstName,
            modalEditUserLastName,
            modalEditUserName,
            modalEditUserEmail,
            modalEditUserStatus,
            modalEditUserPhone,
            modalEditUserPassword // New field
        } = req.body;

        const updateData = {
            full_name: `${modalEditUserFirstName} ${modalEditUserLastName}`.trim(),
            username: modalEditUserName,
            email: modalEditUserEmail,
            status: modalEditUserStatus,
            contact: modalEditUserPhone
        };

        // Update password only if provided
        if (modalEditUserPassword && modalEditUserPassword.trim() !== '') {
            updateData.password = await bcrypt.hash(modalEditUserPassword, 10);
        }

        await prisma.staff.update({
            where: { id: parseInt(staff_id) },
            data: updateData
        });

        res.redirect(`/admin/staff/view/${staff_id}`);
        await logAction(req, 'UPDATE_STAFF', 'Staff', staff_id, `Updated staff member: ${updateData.full_name}`);
    } catch (error) {
        console.error('Error updating staff:', error);
        res.status(500).send('Error updating staff');
    }
};

exports.getLogin = (req, res) => {
    res.render('pages/admin-login', {
        title: 'Login - Jay Subhdra Admin',
        error: req.query.error
    });
};

exports.postLogin = async (req, res) => {
    const { 'email-username': emailOrUsername, password } = req.body;

    try {
        const user = await prisma.staff.findFirst({
            where: {
                OR: [
                    { email: emailOrUsername },
                    { username: emailOrUsername }
                ]
            },
            include: { role: true } // Include role for permissions
        });

        if (user) {
            if (user.status !== 'Active') {
                return res.redirect('/admin/login?error=Your account is inactive. Please contact Super Admin.');
            }

            // Verify Password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                await logAction(req, 'LOGIN_FAILED', 'Staff', user.id, `Failed login attempt with incorrect password for username: ${user.username}`);
                return res.redirect('/admin/login?error=Invalid email/username or password.');
            }

            req.session.admin = {
                id: user.id
                // Thin session: We only store ID. Middleware fetches the rest.
            };

            await logAction(req, 'LOGIN', 'Staff', user.id, `Admin logged in: ${user.username}`);

            // Force session save before redirect to prevent race conditions on fast redirects
            return req.session.save((err) => {
                if (err) console.error('Session save error:', err);
                res.redirect('/admin');
            });
        } else {
            await logAction(req, 'LOGIN_FAILED', 'Staff', null, `Failed login attempt for username: ${emailOrUsername}`);
            return res.render('pages/admin-login', { error: 'Invalid email/username or password.' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.redirect('/admin/login?error=System error. Please try again later.');
    }
};

exports.logout = async (req, res) => {
    if (req.session.admin) {
        await logAction(req, 'LOGOUT', 'Staff', req.session.admin.id, 'Admin logged out');
        req.session.destroy();
    }
    res.redirect('/admin/login');
};

exports.getTicketList = async (req, res) => {
    try {
        const tickets = await prisma.ticket.findMany({
            include: {
                customer: true,
                assignee: true
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        const [totalCount, openCount, inProgressCount, closedCount] = await Promise.all([
            prisma.ticket.count(),
            prisma.ticket.count({ where: { status: 'Open' } }),
            prisma.ticket.count({ where: { status: 'In Progress' } }),
            prisma.ticket.count({ where: { status: 'Closed' } })
        ]);

        const stats = {
            totalCount,
            openCount,
            inProgressCount,
            closedCount,
            // Simple percentage examples (could be calculated dynamically)
            totalGrowth: '+18%',
            openGrowth: '+25%',
            inProgressGrowth: '-14%',
            closedGrowth: '+31%'
        };

        req.app.render('pages/admin-ticket-list', { tickets, stats }, (err, html) => {
            if (err) {
                console.error('Error rendering page:', err);
                return res.status(500).send('Internal Server Error');
            }

            res.render('layouts/admin-master', {
                body: html,
                title: 'Tickets - Jay Subhdra Admin',
                styles: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-buttons-bs5/buttons.bootstrap5.css',
                    '/admin-assets/vendor/libs/select2/select2.css',
                    '/admin-assets/vendor/libs/formvalidation/dist/css/formValidation.min.css'
                ],
                scripts: [
                    '/admin-assets/vendor/libs/moment/moment.js',
                    '/admin-assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js',
                    '/admin-assets/vendor/libs/select2/select2.js',
                    '/admin-assets/vendor/libs/formvalidation/dist/js/FormValidation.min.js',
                    '/admin-assets/vendor/libs/formvalidation/dist/js/plugins/Bootstrap5.min.js',
                    '/admin-assets/vendor/libs/formvalidation/dist/js/plugins/AutoFocus.min.js',
                    '/admin-assets/js/app-ticket-list.js'
                ]
            });
        });
    } catch (error) {
        console.error('Error fetching ticket list:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getTicketData = async (req, res) => {
    try {
        const tickets = await prisma.ticket.findMany({
            include: {
                customer: true,
                assignee: true
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        const formattedTickets = tickets.map(t => ({
            id: t.id,
            ticket_id: t.ticketId,
            subject: t.subject,
            customer: t.customer ? t.customer.fullName : 'Guest',
            priority: t.priority,
            status: t.status,
            created_at: moment(t.created_at).format('DD MMM YYYY'),
            assignee: t.assignee ? t.assignee.full_name : 'Unassigned',
            action: ''
        }));

        res.json({ data: formattedTickets });
    } catch (error) {
        console.error('Error fetching ticket data:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch ticket data' });
    }
};

exports.getTicketView = async (req, res) => {
    try {
        const ticketId = parseInt(req.params.id);
        const ticket = await prisma.ticket.findUnique({
            where: { id: ticketId },
            include: {
                customer: true,
                assignee: true,
                messages: {
                    include: {
                        authorStaff: true,
                        authorCustomer: true,
                        attachments: true
                    },
                    orderBy: {
                        created_at: 'asc'
                    }
                }
            }
        });

        if (!ticket) return res.status(404).send('Ticket not found');

        // Fetch all staff for assignee modal
        const staffList = await prisma.staff.findMany({
            where: { status: 'Active' },
            include: { role: true }
        });

        req.app.render('pages/admin-ticket-view', { ticket, staffList }, (err, html) => {
            if (err) {
                console.error('Error rendering page:', err);
                return res.status(500).send('Internal Server Error');
            }

            res.render('layouts/admin-master', {
                body: html,
                title: `Ticket ${ticket.ticketId} - Jay Subhdra Admin`,
                styles: [
                    '/admin-assets/vendor/libs/select2/select2.css'
                ],
                scripts: [
                    '/admin-assets/vendor/libs/select2/select2.js'
                ]
            });
        });
    } catch (error) {
        console.error('Error fetching ticket view:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.saveTicket = async (req, res) => {
    try {
        const { ticketSubject, ticketCustomer, ticketPriority, ticketDescription } = req.body;

        // Find existing customer or handle if not found
        let customer = await prisma.customer.findFirst({
            where: { fullName: { contains: ticketCustomer } }
        });

        if (!customer) {
            customer = await prisma.customer.findFirst(); // Fallback for testing
        }

        const count = await prisma.ticket.count();
        const ticketId = `TKT-${1001 + count}`;

        const ticket = await prisma.ticket.create({
            data: {
                ticketId,
                subject: ticketSubject,
                description: ticketDescription,
                priority: ticketPriority,
                customer_id: customer.id,
                messages: {
                    create: {
                        content: ticketDescription,
                        authorCustomer_id: customer.id
                    }
                }
            }
        });

        // Handle initial attachments
        if (req.files && req.files.length > 0) {
            const message = await prisma.ticketMessage.findFirst({
                where: { ticket_id: ticket.id },
                orderBy: { created_at: 'asc' }
            });

            for (const file of req.files) {
                await prisma.attachment.create({
                    data: {
                        message_id: message.id,
                        file_name: file.originalname,
                        file_path: `/uploads/${file.filename}`,
                        file_type: file.mimetype
                    }
                });
            }
        }

        res.redirect('/admin/tickets/list');
    } catch (error) {
        console.error('Error saving ticket:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.performTicketAction = async (req, res) => {
    try {
        const { ticket_id, action, reply_content, staff_id } = req.body;
        const id = parseInt(ticket_id);

        if (action === 'reply') {
            const adminId = req.session.admin.id;
            const message = await prisma.ticketMessage.create({
                data: {
                    ticket_id: id,
                    content: reply_content,
                    authorStaff_id: adminId
                }
            });

            if (req.files && req.files.length > 0) {
                for (const file of req.files) {
                    await prisma.attachment.create({
                        data: {
                            message_id: message.id,
                            file_name: file.originalname,
                            file_path: `/uploads/${file.filename}`,
                            file_type: file.mimetype
                        }
                    });
                }
            }
            return res.redirect(`/admin/tickets/view/${id}`);
        } else if (action === 'assign') {
            await prisma.ticket.update({
                where: { id },
                data: {
                    assignee_id: parseInt(staff_id),
                    status: 'In Progress'
                }
            });
            return res.redirect(`/admin/tickets/view/${id}`);
        } else if (action === 'close') {
            await prisma.ticket.update({
                where: { id },
                data: { status: 'Closed' }
            });
            return res.redirect(`/admin/tickets/view/${id}`);
        }

        res.redirect('/admin/tickets/list');
    } catch (error) {
        console.error('Error performing ticket action:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getAttributeList = async (req, res) => {
    try {
        const attributes = await prisma.attribute.findMany({
            orderBy: { created_at: 'desc' }
        });

        req.app.render('pages/admin-attribute-list', { attributes }, (err, html) => {
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
        res.status(200).json({ message: 'Attribute deleted successfully' });
    } catch (error) {
        console.error('Error deleting attribute:', error);
        res.status(500).json({ error: 'Error deleting attribute' });
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

        req.app.render('pages/admin-product-view', { product, reviews, relatedProducts }, (err, html) => {
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
exports.getInvoice = async (req, res) => {
    try {
        const orderId = parseInt(req.params.id);
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                customer: {
                    include: {
                        addresses: true
                    }
                },
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        if (!order) {
            return res.status(404).send('Order not found');
        }

        // Use stored totals from the database
        const subtotal = order.subtotal;
        const tax = order.tax;
        const total = order.totalAmount;

        req.app.render('pages/admin-invoice-view', { order, subtotal, tax, total }, (err, html) => {
            if (err) {
                console.error('Error rendering invoice view:', err);
                return res.status(500).send('Error rendering invoice view');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: 'Invoice Details',
                styles: [
                    '/admin-assets/vendor/css/pages/app-invoice.css'
                ],
                scripts: [
                    '/admin-assets/js/offcanvas-add-payment.js',
                    '/admin-assets/js/offcanvas-send-invoice.js'
                ]
            });
        });
    } catch (error) {
        console.error('Error fetching invoice data:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getShippingPaymentSettings = (req, res) => {
    const fs = require('fs');
    const path = require('path');
    const settingsPath = path.join(__dirname, '../../../admin-panel/assets/json/settings-shipping-payment.json');

    fs.readFile(settingsPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading settings file:', err);
            return res.status(500).send('Error reading settings data');
        }

        const settings = JSON.parse(data);
        req.app.render('pages/admin-settings-shipping-payment', { settings: settings }, (err, html) => {
            if (err) {
                console.error('Error rendering page:', err);
                return res.status(500).send('Error rendering settings page');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: 'Shipping & Payment Configuration - Jay Subhdra Admin',
                styles: [],
                scripts: []
            });
        });
    });
};

exports.saveShippingPaymentSettings = (req, res) => {
    const fs = require('fs');
    const path = require('path');
    const settingsPath = path.join(__dirname, '../../../admin-panel/assets/json/settings-shipping-payment.json');

    const newSettings = req.body;

    fs.writeFile(settingsPath, JSON.stringify(newSettings, null, 2), 'utf8', (err) => {
        if (err) {
            console.error('Error writing settings file:', err);
            return res.status(500).json({ error: 'Error saving settings data' });
        }
        res.status(200).json({ message: 'Settings updated successfully' });
    });
};

exports.getRoleList = async (req, res) => {
    try {
        const roles = await prisma.role.findMany({
            include: {
                permissions: true,
                staff: true
            }
        });

        const permissions = await prisma.permission.findMany();

        req.app.render('pages/admin-role-list', { roles, permissions }, (err, html) => {
            if (err) {
                console.error('Error rendering role list:', err);
                return res.status(500).send('Error rendering role list');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: 'Roles List - Jay Subhdra Admin',
                styles: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.css',
                    '/admin-assets/vendor/libs/@form-validation/umd/styles/index.min.css',
                ],
                scripts: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js',
                    '/admin-assets/vendor/libs/@form-validation/umd/bundle/popular.min.js',
                    '/admin-assets/vendor/libs/@form-validation/umd/plugin-bootstrap5/index.min.js',
                    '/admin-assets/vendor/libs/@form-validation/umd/plugin-auto-focus/index.min.js',
                    '/admin-assets/js/app-access-roles.js'
                ]
            });
        });
    } catch (error) {
        console.error('Error fetching role list:', error);
        res.status(500).send('Error fetching role list');
    }
};

exports.getPermissionList = async (req, res) => {
    try {
        const permissions = await prisma.permission.findMany({
            orderBy: { id: 'desc' }
        });

        req.app.render('pages/admin-permission-list', { permissions }, (err, html) => {
            if (err) {
                console.error('Error rendering permission list:', err);
                return res.status(500).send('Error rendering permission list');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: 'Permissions List - Jay Subhdra Admin',
                styles: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-buttons-bs5/buttons.bootstrap5.css',
                    '/admin-assets/vendor/libs/@form-validation/umd/styles/index.min.css'
                ],
                scripts: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js',
                    '/admin-assets/vendor/libs/@form-validation/umd/bundle/popular.min.js',
                    '/admin-assets/vendor/libs/@form-validation/umd/plugin-bootstrap5/index.min.js',
                    '/admin-assets/vendor/libs/@form-validation/umd/plugin-auto-focus/index.min.js',
                    '/admin-assets/js/app-access-permission.js'
                ]
            });
        });
    } catch (error) {
        console.error('Error fetching permission list:', error);
        res.status(500).send('Error fetching permission list');
    }
};

exports.saveRole = async (req, res) => {
    try {
        const { modalRoleName, userManagementRead, userManagementWrite, userManagementCreate } = req.body;
        // Note: The frontend sends checkbox IDs as keys if checked.
        // We need to map these keys to permission names.
        // But for now, let's just log what we get to debug if needed, or assume a mapping.
        // Actually, the frontend JS handles collecting data. I'll need to check app-access-roles.js
        // For now, I'll rely on it sending 'permissions' or handle it there.
        // Let's assume for now the frontend sends 'modalRoleName' and we'll fix JS to send 'permissions' array.

        // Wait, looking at admin-role-list.ejs, the checkboxes have IDs like 'userManagementRead'.
        // If the form is serialized, these will be present if checked.
        // I should update the JS to collect these into an array of names.

        // This saveRole implementation assumes `permissions` is passed in body using JS update.
        // I will update app-access-roles.js to send 'permissions' array.

        const { permissions } = req.body;

        if (!modalRoleName) {
            return res.status(400).json({ error: 'Role name is required' });
        }

        const existingRole = await prisma.role.findUnique({
            where: { name: modalRoleName }
        });

        if (existingRole) {
            return res.status(400).json({ error: 'Role already exists' });
        }

        let permsToConnect = [];
        if (permissions && Array.isArray(permissions)) {
            // Find permissions by name
            const permissionRecords = await prisma.permission.findMany({
                where: { name: { in: permissions } }
            });
            permsToConnect = permissionRecords.map(p => ({ id: p.id }));
        }

        const newRole = await prisma.role.create({
            data: {
                name: modalRoleName,
                permissions: {
                    connect: permsToConnect
                }
            }
        });

        res.status(200).json({ message: 'Role created successfully', role: newRole });

    } catch (error) {
        console.error('Error saving role:', error);
        res.status(500).json({ error: 'Error saving role' });
    }
};

exports.savePermission = async (req, res) => {
    try {
        const { modalPermissionName } = req.body;

        if (!modalPermissionName) {
            return res.status(400).json({ error: 'Permission name is required' });
        }

        const existingPermission = await prisma.permission.findUnique({
            where: { name: modalPermissionName }
        });

        if (existingPermission) {
            return res.status(400).json({ error: 'Permission already exists' });
        }

        const newPermission = await prisma.permission.create({
            data: {
                name: modalPermissionName
            }
        });

        res.status(200).json({ message: 'Permission created successfully', permission: newPermission });

    } catch (error) {
        console.error('Error saving permission:', error);
        res.status(500).json({ error: 'Error saving permission' });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        let { categoryTitle, slug, parentCategory, status, description } = req.body;
        const image = req.file ? req.file.filename : undefined;

        if (Array.isArray(description)) {
            description = description.filter(d => d !== "").pop() || "";
        }

        const updateData = {
            name: categoryTitle,
            slug: slug,
            description: description,
            status: status || 'Scheduled',
            parentId: (parentCategory && parentCategory !== "") ? parseInt(parentCategory) : null
        };

        if (image) {
            const oldCategory = await prisma.category.findUnique({ where: { id: parseInt(id) } });
            if (oldCategory && oldCategory.image) {
                const fs = require('fs');
                const path = require('path');
                const oldImagePath = path.join(__dirname, '../../../admin-panel/assets/img/ecommerce-images', oldCategory.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            updateData.image = image;
        }

        const updatedCategory = await prisma.category.update({
            where: { id: parseInt(id) },
            data: updateData
        });

        res.json({ success: true, category: updatedCategory });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ success: false, error: error.message, stack: error.stack });
    }
};

// --- HOME MANAGEMENT ---
// Dedicated tables: HeroSection and PromoBanner are used directly.

// ... existing Hero and Promo controllers ...

// Pilgrimage Services Controllers
exports.getServiceList = async (req, res) => {
    try {
        const services = await prisma.service.findMany({
            orderBy: { created_at: 'desc' }
        });
        req.app.render('pages/admin-service-list', { services }, (err, html) => {
            if (err) {
                console.error('Error rendering service list:', err);
                return res.status(500).send('Error rendering page');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: 'Manage Services - Jay Subhdra Admin',
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
            title: 'Add Service - Jay Subhdra Admin',
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

        req.app.render('pages/admin-service-add', { service }, (err, html) => {
            if (err) {
                console.error('Error rendering service edit:', err);
                return res.status(500).send('Error rendering page');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: 'Edit Service - Jay Subhdra Admin',
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
            description,
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

        res.redirect('/admin/store/home/service/list');
    } catch (error) {
        console.error('Error in saveService:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.deleteService = async (req, res) => {
    try {
        await prisma.service.delete({
            where: { id: parseInt(req.params.id) }
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Error in deleteService:', error);
        res.status(500).json({ success: false });
    }
};

// Hero Slider Controllers
exports.getHeroList = async (req, res) => {
    try {
        const heroes = await prisma.heroSection.findMany({
            orderBy: { order: 'asc' }
        });
        req.app.render('pages/admin-hero-list', { heroes }, (err, html) => {
            if (err) {
                console.error('Error rendering hero list:', err);
                return res.status(500).send('Error rendering page');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: 'Manage Hero Section - Jay Subhdra Admin',
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
            title: 'Add Hero Section - Jay Subhdra Admin',
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

        req.app.render('pages/admin-hero-add', { hero }, (err, html) => {
            if (err) {
                console.error('Error rendering hero edit:', err);
                return res.status(500).send('Error rendering page');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: 'Edit Hero Section - Jay Subhdra Admin',
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

        let heroData = {
            header,
            title,
            buttonText,
            buttonLink,
            description,
            image: req.file ? req.file.filename : (req.body.existing_image || '')
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

        res.redirect('/admin/store/home/hero/list');
    } catch (error) {
        console.error('Error in saveHero:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.deleteHero = async (req, res) => {
    try {
        await prisma.heroSection.delete({
            where: { id: parseInt(req.params.id) }
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Error in deleteHero:', error);
        res.status(500).json({ success: false });
    }
};

// Promo Banner Controllers
exports.getPromoList = async (req, res) => {
    try {
        const promos = await prisma.promoBanner.findMany({
            orderBy: { order: 'asc' }
        });
        req.app.render('pages/admin-promo-list', { promos }, (err, html) => {
            if (err) {
                console.error('Error rendering promo list:', err);
                return res.status(500).send('Error rendering page');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: 'Manage Promo Banners - Jay Subhdra Admin',
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
            title: 'Add Promo Banner - Jay Subhdra Admin',
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

        req.app.render('pages/admin-promo-add', { promo }, (err, html) => {
            if (err) {
                console.error('Error rendering promo edit:', err);
                return res.status(500).send('Error rendering page');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: 'Edit Promo Banner - Jay Subhdra Admin',
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

        res.redirect('/admin/store/home/promo/list');
    } catch (error) {
        console.error('Error in savePromo:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.deletePromo = async (req, res) => {
    try {
        await prisma.promoBanner.delete({
            where: { id: parseInt(req.params.id) }
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Error in deletePromo:', error);
        res.status(500).json({ success: false });
    }
};

// --- Manage Library ---

exports.getLibCategoryList = async (req, res) => {
    try {
        const categories = await prisma.libraryCategory.findMany({
            orderBy: { created_at: 'desc' },
            include: { _count: { select: { contents: true } } }
        });

        req.app.render('pages/admin-library-category-list', { categories }, (err, html) => {
            if (err) {
                console.error('Error rendering page:', err);
                return res.status(500).send('Internal Server Error');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: 'Library Categories - Jay Subhdra Admin',
                styles: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-buttons-bs5/buttons.bootstrap5.css',
                    '/admin-assets/vendor/libs/sweetalert2/sweetalert2.css',
                ],
                scripts: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js',
                    '/admin-assets/vendor/libs/sweetalert2/sweetalert2.js',
                ]
            });
        });
    } catch (error) {
        console.error('Error fetching library categories:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.saveLibCategory = async (req, res) => {
    try {
        const { id, name, description, status, show_on_home } = req.body;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const imageData = req.file ? req.file.filename : undefined;
        const isShowOnHome = show_on_home === 'on' || show_on_home === true || show_on_home === 'true';

        if (id) {
            // Update
            const updateData = { name, slug, description, status, show_on_home: isShowOnHome };
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
                    image: imageData
                }
            });
        }
        res.redirect('/admin/library/categories');
    } catch (error) {
        console.error('Error saving library category:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.deleteLibCategory = async (req, res) => {
    try {
        await prisma.libraryCategory.delete({
            where: { id: parseInt(req.params.id) }
        });
        res.json({ success: true });
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
        const contents = await prisma.libraryContent.findMany({
            orderBy: { created_at: 'desc' },
            include: { category: true, tags: true }
        });

        req.app.render('pages/admin-library-content-list', { contents }, (err, html) => {
            if (err) {
                console.error('Error rendering page:', err);
                return res.status(500).send('Internal Server Error');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: 'Library Content - Jay Subhdra Admin',
                styles: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-buttons-bs5/buttons.bootstrap5.css',
                    '/admin-assets/vendor/libs/sweetalert2/sweetalert2.css',
                ],
                scripts: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js',
                    '/admin-assets/vendor/libs/sweetalert2/sweetalert2.js',
                ]
            });
        });
    } catch (error) {
        console.error('Error fetching library contents:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getAddLibContent = async (req, res) => {
    try {
        const categories = await prisma.libraryCategory.findMany({
            where: { status: 'Active' }
        });
        const tags = await prisma.libraryTag.findMany();

        req.app.render('pages/admin-library-content-add', { categories, tags, content: null }, (err, html) => {
            if (err) return res.status(500).send('Error rendering page');
            res.render('layouts/admin-master', {
                body: html,
                title: 'Add Library Content - Jay Subhdra Admin',
                styles: [
                    '/admin-assets/vendor/libs/quill/typography.css',
                    '/admin-assets/vendor/libs/quill/editor.css',
                    '/admin-assets/vendor/libs/select2/select2.css',
                    '/admin-assets/vendor/libs/tagify/tagify.css',
                ],
                scripts: [
                    '/admin-assets/vendor/libs/quill/quill.js',
                    '/admin-assets/vendor/libs/select2/select2.js',
                    '/admin-assets/vendor/libs/tagify/tagify.js',
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
                include: { tags: true }
            }),
            prisma.libraryCategory.findMany({ where: { status: 'Active' } }),
            prisma.libraryTag.findMany()
        ]);

        if (!content) return res.status(404).send('Content not found');

        req.app.render('pages/admin-library-content-add', { categories, tags, content }, (err, html) => {
            if (err) return res.status(500).send('Error rendering page');
            res.render('layouts/admin-master', {
                body: html,
                title: 'Edit Library Content - Jay Subhdra Admin',
                styles: [
                    '/admin-assets/vendor/libs/quill/typography.css',
                    '/admin-assets/vendor/libs/quill/editor.css',
                    '/admin-assets/vendor/libs/select2/select2.css',
                    '/admin-assets/vendor/libs/tagify/tagify.css',
                ],
                scripts: [
                    '/admin-assets/vendor/libs/quill/quill.js',
                    '/admin-assets/vendor/libs/select2/select2.js',
                    '/admin-assets/vendor/libs/tagify/tagify.js',
                ]
            });
        });
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
};

exports.saveLibContent = async (req, res) => {
    try {
        const { id, title, subtitle, summary, content, categoryId, status, author, tags } = req.body;
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const image = req.file ? req.file.filename : undefined;

        // Handle Tags (Support both raw string and Tagify JSON)
        let tagData = [];
        if (tags) {
            let tagArray = [];
            try {
                // Try parsing as JSON (Tagify format)
                const parsed = JSON.parse(tags);
                if (Array.isArray(parsed)) {
                    tagArray = parsed.map(t => t.value);
                } else {
                    tagArray = [tags];
                }
            } catch (e) {
                // Not JSON, handle as comma-separated or array
                tagArray = Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',') : [tags]);
            }

            for (let tagEntry of tagArray) {
                const tagRaw = typeof tagEntry === 'string' ? tagEntry.trim() : (tagEntry.value ? tagEntry.value.trim() : '');
                if (!tagRaw) continue;

                // If tag is an ID (integer string), use it directly
                if (/^\d+$/.test(tagRaw)) {
                    tagData.push({ id: parseInt(tagRaw) });
                } else {
                    const tagSlug = tagRaw.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

                    // Upsert by name to prevent name collisions, updating slug if name found
                    const existingTag = await prisma.libraryTag.upsert({
                        where: { name: tagRaw },
                        update: { slug: tagSlug },
                        create: {
                            name: tagRaw,
                            slug: tagSlug
                        }
                    });
                    tagData.push({ id: existingTag.id });
                }
            }
        }

        const libraryData = {
            title,
            slug,
            subtitle,
            summary,
            content,
            author: author || 'Jay Subhdra Team',
            status: status || 'Active',
            categoryId: parseInt(categoryId),
        };
        if (image) libraryData.image = image;

        if (id) {
            await prisma.libraryContent.update({
                where: { id: parseInt(id) },
                data: {
                    ...libraryData,
                    tags: {
                        set: [], // Clear existing tags for update
                        connect: tagData
                    }
                }
            });
        } else {
            await prisma.libraryContent.create({
                data: {
                    ...libraryData,
                    tags: {
                        connect: tagData
                    }
                }
            });
        }
        res.redirect('/admin/library/content');
    } catch (error) {
        console.error('Error saving library content:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.deleteLibContent = async (req, res) => {
    try {
        await prisma.libraryContent.delete({
            where: { id: parseInt(req.params.id) }
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting library content:', error);
        res.status(500).json({ success: false });
    }
};

exports.uploadLibraryImage = (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
    res.json({ url: `/uploads/${req.file.filename}` });
};

// --- Manage Daily Rituals ---

exports.getDailyRitualsAdmin = async (req, res) => {
    try {
        const [rituals, darshans, facts] = await Promise.all([
            prisma.dailyRitual.findMany({ orderBy: { time: 'asc' } }),
            prisma.darshanTiming.findMany({ orderBy: { created_at: 'asc' } }),
            prisma.templeFact.findMany({ orderBy: { created_at: 'desc' } })
        ]);

        req.app.render('pages/admin-rituals-list', { rituals, darshans, facts }, (err, html) => {
            if (err) {
                console.error('Error rendering rituals admin:', err);
                return res.status(500).send('Error rendering page');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: 'Manage Daily Rituals - Jay Subhdra Admin',
                styles: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css',
                    '/admin-assets/vendor/libs/sweetalert2/sweetalert2.css',
                ],
                scripts: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js',
                    '/admin-assets/vendor/libs/sweetalert2/sweetalert2.js',
                ]
            });
        });
    } catch (error) {
        console.error('Error in getDailyRitualsAdmin:', error);
        res.status(500).send('Internal Server Error');
    }
};

// Rituals CRUD
exports.saveRitual = async (req, res) => {
    try {
        const { id, name, time, icon, status } = req.body;
        const data = { name, time, icon, status: status || 'Active' };

        if (id) {
            await prisma.dailyRitual.update({ where: { id: parseInt(id) }, data });
        } else {
            await prisma.dailyRitual.create({ data });
        }
        res.redirect('/admin/daily-rituals');
    } catch (error) {
        console.error('Error saving ritual:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.deleteRitual = async (req, res) => {
    try {
        await prisma.dailyRitual.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting ritual:', error);
        res.status(500).json({ success: false });
    }
};

// Darshan Timings CRUD
exports.saveDarshanTiming = async (req, res) => {
    try {
        const { id, name, timeRange, type, status } = req.body;
        const data = { name, timeRange, type, status: status || 'Active' };

        if (id) {
            await prisma.darshanTiming.update({ where: { id: parseInt(id) }, data });
        } else {
            await prisma.darshanTiming.create({ data });
        }
        res.redirect('/admin/daily-rituals');
    } catch (error) {
        console.error('Error saving darshan timing:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.deleteDarshanTiming = async (req, res) => {
    try {
        await prisma.darshanTiming.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting darshan timing:', error);
        res.status(500).json({ success: false });
    }
};

// Temple Facts CRUD
exports.saveTempleFact = async (req, res) => {
    try {
        const { id, title, description, icon, colorClass, status } = req.body;
        const data = { title, description, icon, colorClass, status: status || 'Active' };

        if (id) {
            await prisma.templeFact.update({ where: { id: parseInt(id) }, data });
        } else {
            await prisma.templeFact.create({ data });
        }
        res.redirect('/admin/daily-rituals');
    } catch (error) {
        console.error('Error saving temple fact:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.deleteTempleFact = async (req, res) => {
    try {
        await prisma.templeFact.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting temple fact:', error);
        res.status(500).json({ success: false });
    }
};

// --- Manage Panchang ---

exports.getPanchangList = async (req, res) => {
    try {
        const panchangList = await prisma.panchang.findMany({
            orderBy: { date: 'desc' }
        });

        req.app.render('pages/admin-panchang-list', { panchangList }, (err, html) => {
            if (err) {
                console.error('Error rendering panchang list admin:', err);
                return res.status(500).send('Error rendering page');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: 'Manage Panchang - Jay Subhdra Admin',
                styles: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css',
                    '/admin-assets/vendor/libs/sweetalert2/sweetalert2.css',
                ],
                scripts: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js',
                    '/admin-assets/vendor/libs/sweetalert2/sweetalert2.js',
                ]
            });
        });
    } catch (error) {
        console.error('Error in getPanchangList:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getAddPanchang = (req, res) => {
    req.app.render('pages/admin-panchang-add', { panchang: null }, (err, html) => {
        if (err) {
            console.error('Error rendering add panchang:', err);
            return res.status(500).send('Error rendering page');
        }
        res.render('layouts/admin-master', {
            body: html,
            title: 'Add Panchang - Jay Subhdra Admin',
            styles: [
                '/admin-assets/vendor/libs/flatpickr/flatpickr.css'
            ],
            scripts: [
                '/admin-assets/vendor/libs/flatpickr/flatpickr.js'
            ]
        });
    });
};

exports.getEditPanchang = async (req, res) => {
    try {
        const panchang = await prisma.panchang.findUnique({
            where: { id: parseInt(req.params.id) }
        });

        if (!panchang) return res.status(404).send('Panchang entry not found');

        req.app.render('pages/admin-panchang-add', { panchang }, (err, html) => {
            if (err) {
                console.error('Error rendering edit panchang:', err);
                return res.status(500).send('Error rendering page');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: 'Edit Panchang - Jay Subhdra Admin',
                styles: [
                    '/admin-assets/vendor/libs/flatpickr/flatpickr.css'
                ],
                scripts: [
                    '/admin-assets/vendor/libs/flatpickr/flatpickr.js'
                ]
            });
        });
    } catch (error) {
        console.error('Error in getEditPanchang:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.savePanchang = async (req, res) => {
    try {
        const { id, date, sections_json } = req.body;
        const data = JSON.parse(sections_json);

        const panchangData = {
            date: new Date(date),
            data: data
        };

        if (id) {
            await prisma.panchang.update({
                where: { id: parseInt(id) },
                data: panchangData
            });
        } else {
            await prisma.panchang.create({
                data: panchangData
            });
        }

        res.redirect('/admin/panchang');
    } catch (error) {
        console.error('Error in savePanchang:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.deletePanchang = async (req, res) => {
    try {
        await prisma.panchang.delete({
            where: { id: parseInt(req.params.id) }
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting panchang:', error);
        res.status(500).json({ success: false });
    }
};

// --- Manage Festivals ---

exports.getFestivalList = async (req, res) => {
    try {
        const festivals = await prisma.festival.findMany({
            orderBy: { date: 'asc' }
        });

        req.app.render('pages/admin-festival-list', { festivals }, (err, html) => {
            if (err) {
                console.error('Error rendering festival list admin:', err);
                return res.status(500).send('Error rendering page');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: 'Manage Festivals - Jay Subhdra Admin',
                styles: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css',
                    '/admin-assets/vendor/libs/sweetalert2/sweetalert2.css',
                    '/admin-assets/vendor/libs/flatpickr/flatpickr.css',
                ],
                scripts: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js',
                    '/admin-assets/vendor/libs/sweetalert2/sweetalert2.js',
                    '/admin-assets/vendor/libs/flatpickr/flatpickr.js',
                ]
            });
        });
    } catch (error) {
        console.error('Error in getFestivalList:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.saveFestival = async (req, res) => {
    try {
        const { id, name, date, description, type, status } = req.body;
        const data = {
            name,
            date: new Date(date),
            description,
            type,
            status: status || 'Active'
        };

        if (id) {
            await prisma.festival.update({
                where: { id: parseInt(id) },
                data
            });
        } else {
            await prisma.festival.create({
                data
            });
        }
        res.redirect('/admin/festivals');
    } catch (error) {
        console.error('Error saving festival:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.deleteFestival = async (req, res) => {
    try {
        await prisma.festival.delete({
            where: { id: parseInt(req.params.id) }
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting festival:', error);
        res.status(500).json({ success: false });
    }
};

// --- General Settings ---

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
            }
        };

        const finalSettings = {
            header: { ...defaultSettings.header, ...(settings.header || {}) },
            footer: { ...defaultSettings.footer, ...(settings.footer || {}) }
        };

        req.app.render('pages/admin-general-settings', { settings: finalSettings }, (err, html) => {
            if (err) {
                console.error('Error rendering general settings:', err);
                return res.status(500).send('Error rendering page');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: 'General Settings - Jay Subhdra Admin',
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
        const { header_json, footer_json } = req.body;
        const headerData = JSON.parse(header_json);
        const footerData = JSON.parse(footer_json);

        // Handle logo upload if provided
        if (req.file) {
            headerData.logo = `/uploads/${req.file.filename}`;
        }

        await prisma.$transaction([
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
        ]);

        configStore.clearCache();

        res.redirect('/admin/settings/general');
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
                title: 'Shipping & Payment Settings - Jay Subhdra Admin'
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
    } catch (error) {
        console.error('Error saving shipping payment settings:', error);
        res.status(500).send('Internal Server Error');
    }
};

// Home Tabs Controller Functions
exports.getHomeTabList = async (req, res) => {
    try {
        const categories = await prisma.category.findMany({ select: { id: true, name: true } });
        req.app.render('pages/admin-home-tabs', { categories }, (err, html) => {
            if (err) {
                console.error('Error rendering home tabs:', err);
                return res.status(500).send('Error rendering page');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: 'Home Tabs - Jay Subhdra Admin',
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
        console.error('Error deleting home tab:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
