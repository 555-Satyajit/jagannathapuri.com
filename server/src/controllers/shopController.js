const prisma = require('../lib/prisma');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Configure Multer for Review Images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, '../../../admin-panel/assets/uploads/reviews');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'review-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});

exports.reviewUpload = upload.array('images', 3);

exports.getHome = async (req, res) => {
    const configPath = path.join(__dirname, '../../../admin-panel/assets/json/home-config.json');
    let homeConfig = { heroes: [], services: [], features: [] };
    let wishlistIds = [];

    try {
        // 1. Fetch from new dedicated models
        let heroes = await prisma.heroSection.findMany({ where: { status: 'Active' }, orderBy: { order: 'asc' } });
        let features = await prisma.promoBanner.findMany({ where: { status: 'Active' }, orderBy: { order: 'asc' } });

        // 2. Migration logic: if new models are empty, try migrating from SiteConfig or JSON
        if (heroes.length === 0 && features.length === 0) {
            console.log('New tables are empty, attempting migration...');

            // Try fetching from SiteConfig first
            const configs = await prisma.siteConfig.findMany({
                where: { key: { in: ['hero_section', 'promo_banners'] } }
            });

            if (configs.length > 0) {
                for (const c of configs) {
                    if (c.key === 'hero_section' && Array.isArray(c.value)) {
                        for (const h of c.value) {
                            await prisma.heroSection.create({
                                data: {
                                    header: h.header,
                                    title: h.title,
                                    description: h.description,
                                    buttonText: h.buttonText,
                                    buttonLink: h.buttonLink,
                                    image: h.image
                                }
                            });
                        }
                    }
                    if (c.key === 'promo_banners' && Array.isArray(c.value)) {
                        for (const f of c.value) {
                            await prisma.promoBanner.create({
                                data: {
                                    icon: f.icon,
                                    title: f.title,
                                    subtitle: f.subtitle
                                }
                            });
                        }
                    }
                }
            } else if (fs.existsSync(configPath)) {
                // Fallback to JSON if SiteConfig is also empty
                console.log('SiteConfig is empty, migrating from JSON file:', configPath);
                try {
                    const jsonConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                    if (jsonConfig.heroes && jsonConfig.heroes.length > 0) {
                        for (const h of jsonConfig.heroes) {
                            await prisma.heroSection.create({
                                data: {
                                    header: h.header,
                                    title: h.title,
                                    description: h.description,
                                    buttonText: h.buttonText,
                                    buttonLink: h.buttonLink,
                                    image: h.image
                                }
                            });
                        }
                    }
                    if (jsonConfig.features && jsonConfig.features.length > 0) {
                        for (const f of jsonConfig.features) {
                            await prisma.promoBanner.create({
                                data: {
                                    icon: f.icon,
                                    title: f.title,
                                    subtitle: f.subtitle
                                }
                            });
                        }
                    }
                } catch (err) {
                    console.error('Error parsing JSON for migration:', err);
                }
            }

            // Re-fetch after migration attempt
            heroes = await prisma.heroSection.findMany({ where: { status: 'Active' }, orderBy: { order: 'asc' } });
            features = await prisma.promoBanner.findMany({ where: { status: 'Active' }, orderBy: { order: 'asc' } });
        }

        homeConfig.heroes = heroes;
        homeConfig.features = features;

        // 3. Fetch services from Database (Mandatory dynamic)
        homeConfig.services = await prisma.service.findMany({
            where: { status: 'Active' },
            orderBy: { created_at: 'asc' }
        });

        // 4. Fetch Featured Products
        homeConfig.featuredProducts = await prisma.product.findMany({
            where: { is_featured: true, status: 1 },
            include: { category: true },
            take: 10 // Limiting to 10 for the slider
        });

        // 5. Fetch Home Tabs
        const [homeTabs, homeSetting] = await Promise.all([
            prisma.homeTab.findMany({
                where: { status: 'Active' },
                orderBy: { order: 'asc' },
                include: { category: true }
            }),
            prisma.siteConfig.findUnique({ where: { key: 'home' } })
        ]);

        homeConfig.timer = homeSetting ? homeSetting.value : {
            timer_title: 'Ends in :',
            timer_end_date: '2026-12-13T00:00',
            timer_status: true
        };

        // For each tab, fetch 4 products from its category
        homeConfig.exploreTabs = await Promise.all(homeTabs.map(async (tab) => {
            const products = await prisma.product.findMany({
                where: {
                    category_id: tab.categoryId,
                    status: 1,
                    show_in_explore: true
                },
                include: { category: true },
                take: 4,
                orderBy: { created_at: 'desc' }
            });
            return {
                ...tab,
                products
            };
        }));

        // 6. Fetch Spiritual Resources (Library Categories for Home)
        homeConfig.spiritualResources = await prisma.libraryCategory.findMany({
            where: {
                status: 'Active',
                show_on_home: true
            },
            take: 4,
            orderBy: { created_at: 'desc' }
        });

        // 7. Fetch Product Categories for Grid (New)
        homeConfig.productCategories = await prisma.category.findMany({
            where: {
                status: { in: ['Publish', 'Active'] },
                parentId: null
            },
            include: {
                _count: {
                    select: { products: true }
                }
            },
            take: 14,
            orderBy: { created_at: 'desc' }
        });

        // 8. Fetch Wishlist if logged in
        if (req.session.customerId) {
            const wishlist = await prisma.wishlistItem.findMany({
                where: { customerId: req.session.customerId },
                select: { productId: true }
            });
            wishlistIds = wishlist.map(item => item.productId);
        }

    } catch (error) {
        console.error('Error reading home config/services:', error);
    }

    req.app.render('pages/index', { homeConfig, wishlistIds }, (err, html) => {
        if (err) {
            console.error('Error rendering index:', err);
            return res.status(500).send('Error rendering page');
        }
        res.render('layouts/master', { body: html, wishlistIds });
    });
};

const parsePrice = (priceStr) => {
    if (!priceStr) return 0;
    // Remove everything except digits and dot
    const cleanPrice = priceStr.toString().replace(/[^\d.]/g, '');
    return parseFloat(cleanPrice) || 0;
};

exports.getShop = async (req, res) => {
    let wishlistIds = [];
    try {
        const {
            page = 1,
            limit = 9,
            sort = 'latest',
            category,
            brand,
            min_price,
            max_price,
            rating, // New: rating filter
            search,
            ...attributes
        } = req.query;

        const currentPage = Math.max(1, parseInt(page) || 1);
        const itemsPerPage = Math.max(1, parseInt(limit) || 9);
        const skip = (currentPage - 1) * itemsPerPage;

        // Build Where Clause
        const where = { status: 1 }; // Only active products

        if (search) {
            where.OR = [
                { product_name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        if (category && category !== 'all') {
            where.category = { slug: category };
        }

        if (brand) {
            where.product_brand = brand;
        }

        // Handle Price Filtering in DB
        if (min_price || max_price) {
            const min = min_price ? parsePrice(min_price) : 0;
            const max = max_price ? parsePrice(max_price) : Infinity;
            where.price_amount = {
                gte: min,
                lte: max !== Infinity ? max : undefined
            };
        }

        // Handle Attribute Filtering (Keep in DB)
        const attributeKeys = Object.keys(attributes);
        const attributeConditions = [];

        if (attributeKeys.length > 0) {
            attributeKeys.forEach(key => {
                const values = Array.isArray(attributes[key]) ? attributes[key] : [attributes[key]];
                const name = key.charAt(0).toUpperCase() + key.slice(1);

                attributeConditions.push({
                    OR: values.map(val => ({
                        specifications: {
                            path: [],
                            array_contains: [{ name: name, value: val }]
                        }
                    }))
                });
            });

            if (attributeConditions.length > 0) {
                where.AND = attributeConditions;
            }
        }

        // Determine DB Ordering
        let orderBy = { created_at: 'desc' };
        if (sort === 'price_asc') {
            orderBy = { price_amount: 'asc' };
        } else if (sort === 'price_desc') {
            orderBy = { price_amount: 'desc' };
        } else if (sort === 'name_asc') {
            orderBy = { product_name: 'asc' };
        }

        // 1. Fetch Products and Total Count using DB Pagination
        let products, totalProducts;

        if (rating) {
            where.averageRating = { gte: parseInt(rating) || 0 };
        }

        // HIGH PERFORMANCE PATH
        [products, totalProducts] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    category: true
                },
                orderBy,
                skip,
                take: itemsPerPage
            }),
            prisma.product.count({ where })
        ]);

        // Map for display (using schema fields)
        products = products.map(p => ({
            ...p,
            reviewsCount: p.reviewCount,
            averageRating: p.averageRating.toFixed(1)
        }));

        // Metadata for Sidebar
        const [categories, brands, allAttributes] = await Promise.all([
            prisma.category.findMany({ where: { status: 'Publish' }, include: { _count: { select: { products: true } } } }),
            prisma.product.findMany({
                where: { status: 1 },
                select: { product_brand: true },
                distinct: ['product_brand']
            }),
            prisma.attribute.findMany()
        ]);

        // Calculate Price Range using DB aggregation
        const priceStats = await prisma.product.aggregate({
            where: { status: 1 },
            _min: { price_amount: true },
            _max: { price_amount: true }
        });

        const globalMin = priceStats._min.price_amount || 0;
        const globalMax = priceStats._max.price_amount || 1000;

        // Sanitize query params for view to avoid NaN propagation
        const sanitizedQuery = { ...req.query };
        if (sanitizedQuery.min_price && isNaN(parseFloat(sanitizedQuery.min_price))) delete sanitizedQuery.min_price;
        if (sanitizedQuery.max_price && isNaN(parseFloat(sanitizedQuery.max_price))) delete sanitizedQuery.max_price;

        // Fetch Wishlist if logged in
        if (req.session.customerId) {
            const wishlist = await prisma.wishlistItem.findMany({
                where: { customerId: req.session.customerId },
                select: { productId: true }
            });
            wishlistIds = wishlist.map(item => item.productId);
        }

        req.app.render('pages/shop', {
            products,
            pagination: {
                currentPage,
                totalPages: Math.ceil(totalProducts / itemsPerPage),
                totalProducts,
                itemsPerPage
            },
            filters: {
                categories,
                brands: brands.map(b => b.product_brand).filter(Boolean),
                attributes: allAttributes,
                priceMin: isFinite(globalMin) ? globalMin : 0,
                priceMax: isFinite(globalMax) ? globalMax : 1000,
                query: sanitizedQuery
            },
            wishlistIds
        }, async (err, html) => {
            if (err) {
                console.error('Error rendering shop:', err);
                return res.status(500).send('Error rendering shop page');
            }

            let seoData = {};
            if (category && category !== 'all') {
                const catObj = await prisma.category.findUnique({ where: { slug: category } });
                if (catObj) {
                    seoData = {
                        meta_title: catObj.meta_title,
                        meta_description: catObj.meta_description,
                        meta_keywords: catObj.meta_keywords
                    };
                }
            }
            res.render('layouts/master', { body: html, wishlistIds, seo: seoData });
        });
    } catch (error) {
        console.error('Error in getShop:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getAbout = (req, res) => {
    req.app.render('pages/about', (err, html) => {
        if (err) {
            console.error('Error rendering about:', err);
            return res.status(500).send('Error rendering about page');
        }
        res.render('layouts/master', { body: html });
    });
};

exports.getService = async (req, res) => {
    try {
        const services = await prisma.service.findMany({
            where: { status: 'Active' },
            orderBy: { created_at: 'asc' }
        });

        req.app.render('pages/service', { services }, (err, html) => {
            if (err) {
                console.error('Error rendering service:', err);
                return res.status(500).send('Error rendering service page');
            }
            res.render('layouts/master', { body: html });
        });
    } catch (error) {
        console.error('Error in getService:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getLibrary = async (req, res) => {
    try {
        const { category, tag, page = 1, limit = 6 } = req.query;
        const currentPage = Math.max(1, parseInt(page) || 1);
        const pageSize = Math.max(1, parseInt(limit) || 6);
        const skip = (currentPage - 1) * pageSize;

        let where = { status: 'Active' };

        if (category) {
            where.categories = {
                some: {
                    slug: category
                }
            };
        }

        if (tag) {
            where.tags = { some: { slug: tag } };
        }

        const [contents, totalContents] = await Promise.all([
            prisma.libraryContent.findMany({
                where,
                include: { categories: true, tags: true },
                orderBy: { created_at: 'desc' },
                skip: skip,
                take: pageSize
            }),
            prisma.libraryContent.count({ where })
        ]);

        const totalPages = Math.ceil(totalContents / pageSize);

        const categories = await prisma.libraryCategory.findMany({
            where: { status: 'Active' },
            include: { _count: { select: { contents: true } } }
        });

        const recentPosts = await prisma.libraryContent.findMany({
            where: { status: 'Active' },
            include: { categories: true },
            take: 3,
            orderBy: { created_at: 'desc' }
        });

        const tags = await prisma.libraryTag.findMany({
            take: 10
        });

        req.app.render('pages/library', {
            contents,
            categories,
            recentPosts,
            tags,
            pagination: {
                currentPage,
                totalPages,
                totalContents,
                pageSize,
                query: req.query
            }
        }, async (err, html) => {
            if (err) {
                console.error('Error rendering library:', err);
                return res.status(500).send('Error rendering library page');
            }
            let seoData = {};
            if (category) {
                const catObj = await prisma.libraryCategory.findUnique({ where: { slug: category } });
                if (catObj) {
                    seoData = {
                        meta_title: catObj.meta_title,
                        meta_description: catObj.meta_description,
                        meta_keywords: catObj.meta_keywords
                    };
                }
            }
            res.render('layouts/master', { body: html, seo: seoData });
        });
    } catch (error) {
        console.error('Error in getLibrary:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getLibraryDetails = async (req, res) => {
    try {
        const { slug } = req.params;
        const [content, categories, recentPosts] = await Promise.all([
            prisma.libraryContent.findUnique({
                where: { slug },
                include: { categories: true, tags: true }
            }),
            prisma.libraryCategory.findMany({ where: { status: 'Active' } }),
            prisma.libraryContent.findMany({
                where: { status: 'Active', NOT: { slug } },
                include: { categories: true },
                take: 3,
                orderBy: { created_at: 'desc' }
            })
        ]);

        if (!content) return res.status(404).send('Library entry not found');

        req.app.render('pages/library-details', { content, categories, recentPosts }, (err, html) => {
            if (err) {
                console.error('Error rendering library details:', err);
                return res.status(500).send('Error rendering library details page');
            }
            res.render('layouts/master', {
                body: html,
                seo: {
                    meta_title: content.meta_title,
                    meta_description: content.meta_description,
                    meta_keywords: content.meta_keywords,
                    og_image: content.image ? `/uploads/${content.image}` : undefined
                }
            });
        });
    } catch (error) {
        console.error('Error in getLibraryDetails:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getPanchang = async (req, res) => {
    try {
        const { date } = req.query;
        const targetDate = date ? new Date(date) : new Date();
        targetDate.setHours(0, 0, 0, 0);

        const nextDay = new Date(targetDate);
        nextDay.setDate(targetDate.getDate() + 1);

        const [panchang, upcomingFestivals] = await Promise.all([
            prisma.panchang.findFirst({
                where: {
                    date: {
                        gte: targetDate,
                        lt: nextDay
                    }
                }
            }),
            prisma.festival.findMany({
                where: {
                    date: { gte: new Date() },
                    status: 'Active'
                },
                orderBy: { date: 'asc' },
                take: 15
            })
        ]);

        req.app.render('pages/panchang', {
            panchang,
            upcomingFestivals,
            selectedDate: targetDate.toISOString().split('T')[0]
        }, (err, html) => {
            if (err) {
                console.error('Error rendering panchang:', err);
                return res.status(500).send('Error rendering panchang page');
            }
            res.render('layouts/master', { body: html });
        });
    } catch (error) {
        console.error('Error in getPanchang:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getDailyRituals = async (req, res) => {
    try {
        const [rituals, darshans, facts] = await Promise.all([
            prisma.dailyRitual.findMany({ where: { status: 'Active' }, orderBy: { time: 'asc' } }),
            prisma.darshanTiming.findMany({ where: { status: 'Active' }, orderBy: { created_at: 'asc' } }),
            prisma.templeFact.findMany({ where: { status: 'Active' }, orderBy: { created_at: 'desc' } })
        ]);

        req.app.render('pages/daily-rituals', { rituals, darshans, facts }, (err, html) => {
            if (err) {
                console.error('Error rendering daily-rituals:', err);
                return res.status(500).send('Error rendering daily-rituals page');
            }
            res.render('layouts/master', { body: html });
        });
    } catch (error) {
        console.error('Error in getDailyRituals:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getProductDetails = async (req, res) => {
    let wishlistIds = [];
    try {
        const { slug } = req.params;

        const product = await prisma.product.findUnique({
            where: { slug: slug },
            include: { category: true }
        });

        if (!product || product.status !== 1) {
            return res.status(404).send('Product not found');
        }

        // Parallelize fetching reviews, related products, and wishlist
        const [reviews, relatedProductsResult, wishlist] = await Promise.all([
            prisma.review.findMany({
                where: { productId: product.id },
                include: { customer: { select: { fullName: true, avatar: true } } },
                orderBy: { created_at: 'desc' }
            }),
            prisma.product.findMany({
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
                    price_amount: true,
                    regular_price: true,
                    sale_price: true,
                    on_sale: true,
                    images: true,
                    category: {
                        select: { name: true }
                    }
                }
            }).catch(e => {
                console.error('Error fetching related products:', e);
                return [];
            }),
            req.session.customerId ? prisma.wishlistItem.findMany({
                where: { customerId: req.session.customerId },
                select: { productId: true }
            }) : Promise.resolve([])
        ]);

        const wishlistIds = wishlist.map(item => item.productId);
        const relatedProducts = relatedProductsResult;

        // Calculate Rating Statistics
        const reviewsCount = reviews.length;
        const averageRating = reviewsCount > 0
            ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviewsCount).toFixed(1)
            : 0;

        const starCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviews.forEach(rev => {
            if (starCounts[rev.rating] !== undefined) starCounts[rev.rating]++;
        });

        const starPercentages = {};
        [1, 2, 3, 4, 5].forEach(star => {
            starPercentages[star] = reviewsCount > 0 ? Math.round((starCounts[star] / reviewsCount) * 100) : 0;
        });

        // Track Recently Viewed
        if (!req.session.recentlyViewed) {
            req.session.recentlyViewed = [];
        }
        // Remove if already exists and add to front
        req.session.recentlyViewed = req.session.recentlyViewed.filter(id => id !== product.id);
        req.session.recentlyViewed.unshift(product.id);
        // Keep only top 8
        req.session.recentlyViewed = req.session.recentlyViewed.slice(0, 8);

        req.app.render('pages/product-details', {
            product: product,
            reviews,
            reviewsCount,
            averageRating,
            starCounts,
            starPercentages,
            relatedProducts: relatedProducts || [],
            wishlistIds
        }, (err, html) => {
            if (err) {
                console.error('Error rendering product-details:', err);
                return res.status(500).send('Error rendering product-details page');
            }
            res.render('layouts/master', {
                body: html,
                wishlistIds,
                seo: {
                    meta_title: product.meta_title,
                    meta_description: product.meta_description,
                    meta_keywords: product.meta_keywords,
                    og_image: (product.images && product.images.length > 0) ? `/uploads/${product.images[0]}` : undefined
                }
            });
        });
    } catch (error) {
        console.error('Error in getProductDetails:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.submitReview = async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;
        const customerId = req.session.customerId;

        // Handle images if any
        const images = req.files ? req.files.map(f => `/uploads/reviews/${f.filename}`) : [];

        if (!customerId) {
            return res.status(401).json({ success: false, message: 'Please login to submit a review' });
        }

        if (!productId || !rating) {
            return res.status(400).json({ success: false, message: 'Product ID and rating are required' });
        }

        const newReview = await prisma.review.create({
            data: {
                productId: parseInt(productId),
                customerId: parseInt(customerId),
                rating: parseInt(rating),
                comment: comment || '',
                images: images
            },
            include: {
                customer: { select: { fullName: true, avatar: true } }
            }
        });

        res.json({ success: true, message: 'Review submitted successfully', review: newReview });
    } catch (error) {
        console.error('Error in submitReview:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.getCheckout = async (req, res) => {
    try {
        let cart = req.session.cart || [];

        if (req.session.customerId) {
            const dbCart = await prisma.cart.findUnique({
                where: { customerId: req.session.customerId },
                include: { items: { include: { product: true } } }
            });

            if (dbCart && dbCart.items.length > 0) {
                cart = dbCart.items.map(item => {
                    let image = '/assets/images/logo.png';
                    if (item.product.images && item.product.images.length > 0) {
                        const img = item.product.images[0].trim();
                        image = (img.startsWith('http') || img.startsWith('/')) ? img : '/uploads/' + img;
                    }
                    return {
                        productId: item.productId,
                        name: item.product.product_name,
                        price: parseFloat(item.product.price_amount || item.product.price),
                        image: image,
                        slug: item.product.slug,
                        quantity: item.quantity
                    };
                });
            } else if (dbCart) {
                cart = [];
                req.session.cart = [];
            }
        }

        const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

        // Calculate totals. For now, flat rate or zero.
        const shipping = 0;
        const tax = 0;
        let total = subtotal + shipping + tax;
        let discount = 0;

        // Check if coupon is applied in session
        if (req.session.coupon) {
            discount = req.session.coupon.discountAmount;
            total = total - discount;
        }

        let user = null;
        if (req.session.customerId) {
            user = await prisma.customer.findUnique({
                where: { id: req.session.customerId },
                include: { addresses: true }
            });
        }

        req.app.render('pages/checkout', {
            cart,
            user,
            totals: {
                subtotal,
                shipping,
                tax,
                discount,
                total: total > 0 ? total : 0
            }
        }, (err, html) => {
            if (err) {
                console.error('Error rendering checkout:', err);
                return res.status(500).send('Error rendering checkout page');
            }
            res.render('layouts/master', { body: html });
        });
    } catch (error) {
        console.error('Error in getCheckout:', error);
        res.status(500).send('Error loading checkout');
    }
};

exports.applyCoupon = async (req, res) => {
    try {
        const { code } = req.body;
        let cart = req.session.cart || [];

        if (req.session.customerId) {
            const dbCart = await prisma.cart.findUnique({
                where: { customerId: req.session.customerId },
                include: { items: { include: { product: true } } }
            });

            if (dbCart && dbCart.items.length > 0) {
                cart = dbCart.items.map(item => ({
                    productId: item.productId,
                    price: parseFloat(item.product.price_amount || item.product.price),
                    quantity: item.quantity
                }));
            }
        }

        if (cart.length === 0) {
            return res.json({ success: false, message: 'Cart is empty' });
        }

        const coupon = await prisma.coupon.findUnique({
            where: { code: code }
        });

        if (!coupon) {
            return res.json({ success: false, message: 'Invalid coupon code' });
        }

        if (coupon.status !== 'Active') {
            return res.json({ success: false, message: 'Coupon is inactive' });
        }

        if (coupon.expiry_date && new Date() > new Date(coupon.expiry_date)) {
            return res.json({ success: false, message: 'Coupon has expired' });
        }

        if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
            return res.json({ success: false, message: 'Coupon usage limit reached' });
        }

        // Per-user limit check
        if (coupon.per_user_limit) {
            if (!req.session.customerId) {
                return res.json({ success: false, message: 'Login required for this coupon' });
            }

            const usage = await prisma.couponUsage.findUnique({
                where: {
                    coupon_id_customer_id: {
                        coupon_id: coupon.id,
                        customer_id: req.session.customerId
                    }
                }
            });

            if (usage && usage.usage_count >= coupon.per_user_limit) {
                return res.json({
                    success: false,
                    message: `Coupon usage limit reached for your account (Max: ${coupon.per_user_limit})`
                });
            }
        }

        const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

        if (coupon.min_spend && subtotal < coupon.min_spend) {
            return res.json({ success: false, message: `Minimum spend of ₹${coupon.min_spend} required` });
        }

        let discountAmount = 0;
        if (coupon.discount_type === 'Percentage') {
            discountAmount = (subtotal * coupon.discount_amount) / 100;
        } else {
            discountAmount = coupon.discount_amount;
        }

        // Cap discount at subtotal
        if (discountAmount > subtotal) {
            discountAmount = subtotal;
        }

        req.session.coupon = {
            code: coupon.code,
            discountAmount: discountAmount,
            id: coupon.id
        };

        const total = subtotal - discountAmount;

        res.json({
            success: true,
            message: 'Coupon applied successfully',
            discount: discountAmount,
            newTotal: total,
            code: coupon.code
        });

    } catch (error) {
        console.error('Error applying coupon:', error);
        res.status(500).json({ success: false, message: 'Currentely we are not offering any coupons' });
    }
};

exports.removeCoupon = (req, res) => {
    if (req.session.coupon) {
        delete req.session.coupon;
        return res.json({ success: true, message: 'Coupon removed' });
    }
    res.json({ success: false, message: 'No coupon to remove' });
};
exports.postCheckout = async (req, res) => {
    const {
        email, firstName, lastName, phone,
        country, city, state, zipCode, addressLine1,
        paymentMethod
    } = req.body;

    let cart = req.session.cart || [];
    if (req.session.customerId) {
        const dbCart = await prisma.cart.findUnique({
            where: { customerId: req.session.customerId },
            include: { items: { include: { product: true } } }
        });

        if (dbCart && dbCart.items.length > 0) {
            cart = dbCart.items.map(item => ({
                productId: item.productId,
                price: parseFloat(item.product.price_amount || item.product.price),
                quantity: item.quantity
            }));
        }
    }

    console.log('[Debug] postCheckout - User:', req.session.customerId, 'Email:', email);
    console.log('[Debug] postCheckout - Initial Cart items:', cart.length);

    if (cart.length === 0) {
        if (req.xhr || req.headers['x-requested-with'] === 'XMLHttpRequest') {
            return res.status(400).json({ success: false, error: 'Cart is empty' });
        }
        return res.status(400).send('Cart is empty');
    }

    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = 0;
    const tax = 0;
    const total = subtotal + shipping + tax;

    try {
        // Simple order number generation
        const orderNumber = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

        const result = await prisma.$transaction(async (tx) => {
            // 1. Find or create customer
            let customer = await tx.customer.findUnique({
                where: { email }
            });

            if (!customer) {
                customer = await tx.customer.create({
                    data: {
                        email,
                        fullName: `${firstName} ${lastName}`.trim(),
                        phone,
                        status: 'Active'
                    }
                });
            }

            // 2. Find or create address
            let address = await tx.address.findFirst({
                where: {
                    customer_id: customer.id,
                    addressLine1,
                    city,
                    state,
                    zipCode,
                    country,
                    type: 'Shipping'
                }
            });

            if (!address) {
                address = await tx.address.create({
                    data: {
                        customer_id: customer.id,
                        addressLine1,
                        city,
                        state,
                        zipCode,
                        country,
                        type: 'Shipping'
                    }
                });
            }

            // 3. Create order
            const order = await tx.order.create({
                data: {
                    orderNumber,
                    customer_id: customer.id,
                    paymentMethod: paymentMethod || 'Cash on Delivery',
                    subtotal,
                    shippingFee: shipping,
                    tax,
                    totalAmount: total,
                    shippingAddressId: address.id,
                    paymentStatus: 2, // Pending
                    status: 1 // Dispatched
                }
            });

            // 4. Create order items and reduce stock
            for (const item of cart) {
                await tx.orderItem.create({
                    data: {
                        orderId: order.id,
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price
                    }
                });

                // Reduce stock
                const updatedProduct = await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        quantity: {
                            decrement: item.quantity
                        }
                    }
                });

                // Check for Low Stock
                const threshold = updatedProduct.lowStockThreshold !== null ? updatedProduct.lowStockThreshold : 10;
                if (updatedProduct.quantity <= threshold) {
                    await tx.notification.create({
                        data: {
                            type: 'low_stock',
                            message: `Low Stock Alert: ${updatedProduct.product_name} has ${updatedProduct.quantity} remaining.`,
                            link: `/admin/ecommerce/products/view/${updatedProduct.id}`,
                            isRead: false
                        }
                    });
                }
            }

            // 5. Record Coupon Usage (if applicable)
            if (req.session.coupon) {
                const couponId = req.session.coupon.id;

                // Check if usage record exists
                const existingUsage = await tx.couponUsage.findUnique({
                    where: {
                        coupon_id_customer_id: {
                            coupon_id: couponId,
                            customer_id: customer.id
                        }
                    }
                });

                if (existingUsage) {
                    await tx.couponUsage.update({
                        where: { id: existingUsage.id },
                        data: { usage_count: { increment: 1 } }
                    });
                } else {
                    await tx.couponUsage.create({
                        data: {
                            coupon_id: couponId,
                            customer_id: customer.id,
                            usage_count: 1
                        }
                    });
                }

                // Also increment global usage count
                await tx.coupon.update({
                    where: { id: couponId },
                    data: { used_count: { increment: 1 } }
                });

                // Clear coupon from session
                delete req.session.coupon;
            }

            // Clear Cart (DB or Session)
            if (req.session.customerId) {
                const dbCart = await tx.cart.findUnique({
                    where: { customerId: customer.id }
                });
                if (dbCart) {
                    await tx.cartItem.deleteMany({
                        where: { cartId: dbCart.id }
                    });
                }
                req.session.cart = []; // Also clear session just in case
            } else {
                req.session.cart = [];
            }

            return order;
        });

        // Clear cart
        req.session.cart = [];

        // Redirect or return JSON
        if (req.xhr || req.headers['x-requested-with'] === 'XMLHttpRequest') {
            return res.json({ success: true, orderNumber: result.orderNumber });
        }
        res.redirect(`/order-successful?orderNumber=${result.orderNumber}`);

    } catch (error) {
        console.error('Checkout error:', error);
        if (req.xhr || req.headers['x-requested-with'] === 'XMLHttpRequest') {
            return res.status(500).json({ success: false, error: 'An error occurred during checkout' });
        }
        res.status(500).send('An error occurred during checkout');
    }
};

exports.getOrderSuccessful = async (req, res) => {
    let wishlistIds = [];
    const orderNumber = req.query.orderNumber;
    if (!orderNumber) {
        return res.redirect('/');
    }

    try {
        const order = await prisma.order.findUnique({
            where: { orderNumber },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                shippingAddress: true,
                customer: true
            }
        });

        if (!order) {
            return res.redirect('/');
        }

        if (req.session.customerId) {
            const wishlist = await prisma.wishlistItem.findMany({
                where: { customerId: req.session.customerId },
                select: { productId: true }
            });
            wishlistIds = wishlist.map(item => item.productId);
        }

        // Fetch Recently Viewed products
        let recentlyViewed = [];
        if (req.session.recentlyViewed && req.session.recentlyViewed.length > 0) {
            recentlyViewed = await prisma.product.findMany({
                where: {
                    id: { in: req.session.recentlyViewed },
                    status: 1
                },
                select: {
                    id: true,
                    product_name: true,
                    slug: true,
                    price_amount: true,
                    regular_price: true,
                    sale_price: true,
                    on_sale: true,
                    images: true
                }
            });
            // Sort to match session order
            recentlyViewed.sort((a, b) => req.session.recentlyViewed.indexOf(a.id) - req.session.recentlyViewed.indexOf(b.id));
        }

        req.app.render('pages/order-successful', {
            order,
            wishlistIds,
            recentlyViewed,
            customer: order.customer // Use the order's customer info
        }, (err, html) => {
            if (err) {
                console.error('Error rendering order-successful:', err);
                return res.status(500).send('Error rendering order-successful page');
            }
            res.render('layouts/master', { body: html, wishlistIds });
        });
    } catch (error) {
        console.error('Error in getOrderSuccessful:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getWishlist = async (req, res) => {
    try {
        const customerId = req.session.customerId;

        const wishlistItems = await prisma.wishlistItem.findMany({
            where: { customerId: customerId },
            include: {
                product: {
                    include: {
                        category: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        req.app.render('pages/wishlist', { wishlistItems }, (err, html) => {
            if (err) {
                console.error('Error rendering wishlist:', err);
                return res.status(500).send('Error rendering wishlist page');
            }
            res.render('layouts/master', { body: html, title: 'My Wishlist' });
        });
    } catch (error) {
        console.error('Error in getWishlist:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.addToWishlist = async (req, res) => {
    try {
        const customerId = req.session.customerId;
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ success: false, error: 'Product ID is required' });
        }

        // Check if already in wishlist
        const existing = await prisma.wishlistItem.findUnique({
            where: {
                customerId_productId: {
                    customerId: customerId,
                    productId: parseInt(productId)
                }
            }
        });

        if (existing) {
            return res.json({ success: true, message: 'Item already in wishlist' });
        }

        await prisma.wishlistItem.create({
            data: {
                customerId: customerId,
                productId: parseInt(productId)
            }
        });

        res.json({ success: true, message: 'Item added to wishlist' });
    } catch (error) {
        console.error('Error in addToWishlist:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

exports.removeFromWishlist = async (req, res) => {
    try {
        const customerId = req.session.customerId;
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ success: false, error: 'Product ID is required' });
        }

        await prisma.wishlistItem.delete({
            where: {
                customerId_productId: {
                    customerId: customerId,
                    productId: parseInt(productId)
                }
            }
        });

        res.json({ success: true, message: 'Item removed from wishlist' });
    } catch (error) {
        console.error('Error in removeFromWishlist:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

exports.getContact = async (req, res) => {
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
                }
            ]
        };
        const settings = config ? { ...defaultSettings, ...config.value } : defaultSettings;

        req.app.render('pages/contact', { settings }, (err, html) => {
            if (err) {
                console.error('Error rendering contact:', err);
                return res.status(500).send('Error rendering contact page');
            }
            res.render('layouts/master', { body: html });
        });
    } catch (error) {
        console.error('Error fetching contact page data:', error);
        res.status(500).send('Internal Server Error');
    }
};
exports.getProductApi = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await prisma.product.findUnique({
            where: { id: parseInt(id) },
            include: { category: true }
        });

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.json({ success: true, product });
    } catch (error) {
        console.error('Error in getProductApi:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.searchApi = async (req, res) => {
    try {
        const query = req.query.q || '';
        if (!query.trim() || query.trim().length < 2) {
            return res.json({ success: true, results: { products: [], services: [], library: [] } });
        }

        const searchTerm = query.trim();

        const [products, services, library] = await Promise.all([
            prisma.product.findMany({
                where: {
                    status: 1, // Only active products
                    OR: [
                        { product_name: { contains: searchTerm, mode: 'insensitive' } },
                        { sku: { contains: searchTerm, mode: 'insensitive' } },
                        { product_brand: { contains: searchTerm, mode: 'insensitive' } },
                        { category: { name: { contains: searchTerm, mode: 'insensitive' } } },
                        { description: { contains: searchTerm, mode: 'insensitive' } }
                    ]
                },
                take: 5,
                include: { category: true }
            }),
            prisma.service.findMany({
                where: {
                    status: 'Active',
                    OR: [
                        { title: { contains: searchTerm, mode: 'insensitive' } },
                        { subtitle: { contains: searchTerm, mode: 'insensitive' } },
                        { description: { contains: searchTerm, mode: 'insensitive' } }
                    ]
                },
                take: 5
            }),
            prisma.libraryContent.findMany({
                where: {
                    status: 'Active',
                    OR: [
                        { title: { contains: searchTerm, mode: 'insensitive' } },
                        { subtitle: { contains: searchTerm, mode: 'insensitive' } },
                        { summary: { contains: searchTerm, mode: 'insensitive' } },
                        { meta_keywords: { contains: searchTerm, mode: 'insensitive' } }
                    ]
                },
                take: 5
            })
        ]);

        res.json({
            success: true,
            results: {
                products,
                services,
                library
            },
            // Legacy support for older frontend calls that expect 'products' at root
            products
        });
    } catch (error) {
        console.error('Search API error:', error);
        res.status(500).json({ success: true, results: { products: [], services: [], library: [] } });
    }
};

exports.submitReview = async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;
        const customerId = req.session.customerId;
        const images = req.files ? req.files.map(file => file.filename) : [];

        if (!customerId) {
            return res.status(401).json({ success: false, message: 'Please login to submit a review' });
        }

        if (!productId || !rating) {
            return res.status(400).json({ success: false, message: 'Product ID and Rating are required' });
        }

        const review = await prisma.$transaction(async (tx) => {
            const newReview = await tx.review.create({
                data: {
                    customerId: parseInt(customerId),
                    productId: parseInt(productId),
                    rating: parseInt(rating),
                    comment: comment || '',
                    images: images
                }
            });

            // Recalculate Product Ratings
            const allReviews = await tx.review.findMany({
                where: { productId: parseInt(productId) },
                select: { rating: true }
            });

            const count = allReviews.length;
            const avg = count > 0 ? allReviews.reduce((acc, r) => acc + r.rating, 0) / count : 0;

            await tx.product.update({
                where: { id: parseInt(productId) },
                data: {
                    averageRating: parseFloat(avg.toFixed(1)),
                    reviewCount: count
                }
            });

            return newReview;
        });

        res.json({ success: true, message: 'Review submitted successfully', review });
    } catch (error) {
        console.error('Error submitting review:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.getUserAddresses = async (req, res) => {
    try {
        const customerId = req.session.customerId;
        if (!customerId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const addresses = await prisma.address.findMany({
            where: { customer_id: customerId }
        });

        res.json({ success: true, addresses });
    } catch (error) {
        console.error('Error fetching addresses:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.submitFeedback = async (req, res) => {
    const { name, email, message } = req.body;
    const customerId = req.session.customerId || null;

    if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    try {
        await prisma.$transaction([
            prisma.feedback.create({
                data: {
                    name,
                    email,
                    message,
                    customerId
                }
            }),
            prisma.notification.create({
                data: {
                    type: 'contact_message',
                    message: `New message from ${name}`,
                    link: '/admin/store/contact/messages',
                    isRead: false
                }
            })
        ]);

        res.json({ success: true, message: 'Thank you for your feedback!' });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({ success: false, message: 'Failed to submit feedback' });
    }
};

// --- Policy Pages ---

const renderPolicyPage = async (req, res, title, configKey) => {
    try {
        const config = await prisma.siteConfig.findUnique({ where: { key: configKey } });
        const content = config && config.value ? config.value.content : `<p>The ${title} is currently not available. Please check back later.</p>`;

        req.app.render('pages/policy-page', { title, content }, (err, html) => {
            if (err) {
                console.error(`Error rendering ${title} page:`, err);
                return res.status(500).send('Error rendering page');
            }
            res.render('layouts/master', { body: html, title });
        });
    } catch (error) {
        console.error(`Error fetching ${title} page:`, error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getPrivacyPolicyPage = (req, res) => {
    renderPolicyPage(req, res, 'Privacy Policy', 'privacy_policy');
};

exports.getTermsConditionsPage = (req, res) => {
    renderPolicyPage(req, res, 'Terms & Conditions', 'terms_conditions');
};

exports.getReturnPolicyPage = (req, res) => {
    renderPolicyPage(req, res, 'Return Policy', 'return_policy');
};
