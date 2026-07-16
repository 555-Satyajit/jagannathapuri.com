const prisma = require('../lib/prisma');

exports.getCart = async (req, res) => {
    let wishlistIds = [];
    let cart = req.session.cart || [];

    try {
        if (req.session.customerId) {
            // Fetch Wishlist
            const wishlist = await prisma.wishlistItem.findMany({
                where: { customerId: req.session.customerId },
                select: { productId: true }
            });
            wishlistIds = wishlist.map(item => item.productId);

            // Fetch Cart from DB
            const dbCart = await prisma.cart.findUnique({
                where: { customerId: req.session.customerId },
                include: {
                    items: {
                        include: { product: true }
                    }
                }
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
                        price: item.product.on_sale && item.product.sale_price ? parseFloat(item.product.sale_price) : parseFloat(item.product.price_amount || item.product.price),
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

        req.app.render('pages/cart', { cart, wishlistIds }, (err, html) => {
            if (err) {
                console.error('Error rendering cart:', err);
                return res.status(500).send('Error rendering cart page');
            }
            res.render('layouts/master', { body: html, wishlistIds });
        });
    } catch (error) {
        console.error('Error in getCart:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getCartApi = async (req, res) => {
    let cart = req.session.cart || [];

    if (req.session.customerId) {
        try {
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
                        price: item.product.on_sale && item.product.sale_price ? parseFloat(item.product.sale_price) : parseFloat(item.product.price_amount || item.product.price),
                        image: image,
                        slug: item.product.slug,
                        quantity: item.quantity
                    };
                });
            } else if (dbCart) {
                cart = [];
                req.session.cart = [];
            }
        } catch (error) {
            console.error('Error fetching cart API:', error);
        }
    }

    res.json(cart);
};

exports.addItem = async (req, res) => {
    const { productId, quantity } = req.body;
    const pId = parseInt(productId);
    const qty = parseInt(quantity) || 1;

    if (isNaN(pId)) {
        return res.status(400).json({ success: false, message: 'Invalid Product ID' });
    }

    try {
        const product = await prisma.product.findUnique({
            where: { id: pId }
        });

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        if (req.session.customerId) {
            // DB Cart Logic for Logged-in User
            let cart = await prisma.cart.findUnique({
                where: { customerId: req.session.customerId }
            });

            if (!cart) {
                cart = await prisma.cart.create({
                    data: { customerId: req.session.customerId }
                });
            }

            const existingItem = await prisma.cartItem.findUnique({
                where: {
                    cartId_productId: {
                        cartId: cart.id,
                        productId: pId
                    }
                }
            });

            if (existingItem) {
                await prisma.cartItem.update({
                    where: { id: existingItem.id },
                    data: { quantity: existingItem.quantity + qty }
                });
            } else {
                await prisma.cartItem.create({
                    data: {
                        cartId: cart.id,
                        productId: pId,
                        quantity: qty
                    }
                });
            }
            // Sync updated cart to response
            const updatedDbCart = await prisma.cart.findUnique({
                where: { id: cart.id },
                include: { items: { include: { product: true } } }
            });

            if (updatedDbCart && updatedDbCart.items.length > 0) {
                req.session.cart = updatedDbCart.items.map(item => {
                    let image = '/assets/images/logo.png';
                    if (item.product.images && item.product.images.length > 0) {
                        const img = item.product.images[0].trim();
                        image = (img.startsWith('http') || img.startsWith('/')) ? img : '/uploads/' + img;
                    }
                    return {
                        productId: item.productId,
                        name: item.product.product_name,
                        price: item.product.on_sale && item.product.sale_price ? parseFloat(item.product.sale_price) : parseFloat(item.product.price_amount || item.product.price),
                        image: image,
                        slug: item.product.slug,
                        quantity: item.quantity
                    };
                });
            } else {
                req.session.cart = [];
            }
        } else {
            // Guest Session Logic
            if (!req.session.cart) {
                req.session.cart = [];
            }

            const existingItem = req.session.cart.find(item => item.productId === product.id);

            if (existingItem) {
                existingItem.quantity += qty;
            } else {
                let image = '/assets/images/logo.png';
                if (product.images && product.images.length > 0) {
                    const img = product.images[0].trim();
                    image = (img.startsWith('http') || img.startsWith('/')) ? img : '/uploads/' + img;
                }

                req.session.cart.push({
                    productId: product.id,
                    name: product.product_name,
                    price: product.on_sale && product.sale_price ? parseFloat(product.sale_price) : parseFloat(product.price_amount || product.price),
                    image: image,
                    slug: product.slug,
                    quantity: qty
                });
            }
        }

        res.json({ success: true, cart: req.session.cart });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.addBulkItems = async (req, res) => {
    const { items } = req.body; // Expecting { items: [{ productId, quantity }, ...] }

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid items payload' });
    }

    try {
        if (req.session.customerId) {
            // DB Cart Logic for Logged-in User
            let cart = await prisma.cart.findUnique({
                where: { customerId: req.session.customerId }
            });

            if (!cart) {
                cart = await prisma.cart.create({
                    data: { customerId: req.session.customerId }
                });
            }

            for (const item of items) {
                const pId = parseInt(item.productId);
                const qty = parseInt(item.quantity) || 1;

                if (isNaN(pId)) continue;

                const existingItem = await prisma.cartItem.findUnique({
                    where: {
                        cartId_productId: {
                            cartId: cart.id,
                            productId: pId
                        }
                    }
                });

                if (existingItem) {
                    await prisma.cartItem.update({
                        where: { id: existingItem.id },
                        data: { quantity: existingItem.quantity + qty }
                    });
                } else {
                    await prisma.cartItem.create({
                        data: {
                            cartId: cart.id,
                            productId: pId,
                            quantity: qty
                        }
                    });
                }
            }

            // Sync updated cart to response
            const updatedDbCart = await prisma.cart.findUnique({
                where: { id: cart.id },
                include: { items: { include: { product: true } } }
            });

            if (updatedDbCart && updatedDbCart.items.length > 0) {
                req.session.cart = updatedDbCart.items.map(item => {
                    let image = '/assets/images/logo.png';
                    if (item.product.images && item.product.images.length > 0) {
                        const img = item.product.images[0].trim();
                        image = (img.startsWith('http') || img.startsWith('/')) ? img : '/uploads/' + img;
                    }
                    return {
                        productId: item.productId,
                        name: item.product.product_name,
                        price: item.product.on_sale && item.product.sale_price ? parseFloat(item.product.sale_price) : parseFloat(item.product.price_amount || item.product.price),
                        image: image,
                        slug: item.product.slug,
                        quantity: item.quantity
                    };
                });
            } else {
                req.session.cart = [];
            }
        } else {
            // Guest Session Logic
            if (!req.session.cart) {
                req.session.cart = [];
            }

            for (const item of items) {
                const pId = parseInt(item.productId);
                const qty = parseInt(item.quantity) || 1;

                if (isNaN(pId)) continue;

                const product = await prisma.product.findUnique({
                    where: { id: pId }
                });

                if (!product) continue;

                const existingItem = req.session.cart.find(i => i.productId === product.id);

                if (existingItem) {
                    existingItem.quantity += qty;
                } else {
                    let image = '/assets/images/logo.png';
                    if (product.images && product.images.length > 0) {
                        const img = product.images[0].trim();
                        image = (img.startsWith('http') || img.startsWith('/')) ? img : '/uploads/' + img;
                    }

                    req.session.cart.push({
                        productId: product.id,
                        name: product.product_name,
                        price: product.on_sale && product.sale_price ? parseFloat(product.sale_price) : parseFloat(product.price_amount || product.price),
                        image: image,
                        slug: product.slug,
                        quantity: qty
                    });
                }
            }
        }

        res.json({ success: true, cart: req.session.cart });
    } catch (error) {
        console.error('Add bulk error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.syncCart = async (req, res) => {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
        return res.status(400).json({ success: false, message: 'Invalid items payload' });
    }

    try {
        if (req.session.customerId) {
            let cart = await prisma.cart.findUnique({
                where: { customerId: req.session.customerId }
            });

            if (!cart) {
                cart = await prisma.cart.create({
                    data: { customerId: req.session.customerId }
                });
            }

            // Clear existing items
            await prisma.cartItem.deleteMany({
                where: { cartId: cart.id }
            });

            // Add new items via createMany for speed
            const newItemsData = items
                .map(i => ({ productId: parseInt(i.productId), quantity: parseInt(i.quantity) || 1 }))
                .filter(i => !isNaN(i.productId))
                .map(i => ({ cartId: cart.id, productId: i.productId, quantity: i.quantity }));
            
            if (newItemsData.length > 0) {
                await prisma.cartItem.createMany({ data: newItemsData });
            }

            // Sync updated cart to response
            const updatedDbCart = await prisma.cart.findUnique({
                where: { id: cart.id },
                include: { items: { include: { product: true } } }
            });

            if (updatedDbCart && updatedDbCart.items.length > 0) {
                req.session.cart = updatedDbCart.items.map(item => {
                    let image = '/assets/images/logo.png';
                    if (item.product.images && item.product.images.length > 0) {
                        const img = item.product.images[0].trim();
                        image = (img.startsWith('http') || img.startsWith('/')) ? img : '/uploads/' + img;
                    }
                    return {
                        productId: item.productId,
                        name: item.product.product_name,
                        price: item.product.on_sale && item.product.sale_price ? parseFloat(item.product.sale_price) : parseFloat(item.product.price_amount || item.product.price),
                        image: image,
                        slug: item.product.slug,
                        quantity: item.quantity
                    };
                });
            } else {
                req.session.cart = [];
            }
        } else {
            // Guest Session Logic
            req.session.cart = [];
            const validItems = items
                .map(i => ({ productId: parseInt(i.productId), quantity: parseInt(i.quantity) || 1 }))
                .filter(i => !isNaN(i.productId));

            if (validItems.length > 0) {
                const productIds = validItems.map(i => i.productId);
                const products = await prisma.product.findMany({
                    where: { id: { in: productIds } }
                });

                for (const item of validItems) {
                    const product = products.find(p => p.id === item.productId);
                    if (!product) continue;

                    let image = '/assets/images/logo.png';
                    if (product.images && product.images.length > 0) {
                        const img = product.images[0].trim();
                        image = (img.startsWith('http') || img.startsWith('/')) ? img : '/uploads/' + img;
                    }

                    req.session.cart.push({
                        productId: product.id,
                        name: product.product_name,
                        price: product.on_sale && product.sale_price ? parseFloat(product.sale_price) : parseFloat(product.price_amount || product.price),
                        image: image,
                        slug: product.slug,
                        quantity: item.quantity
                    });
                }
            }
        }

        res.json({ success: true, cart: req.session.cart });
    } catch (error) {
        console.error('Sync cart error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.updateQuantity = async (req, res) => {
    const { productId, quantity } = req.body;
    const pId = parseInt(productId);
    const qty = parseInt(quantity);

    if (isNaN(pId)) {
        return res.status(400).json({ success: false, message: 'Invalid Product ID' });
    }

    try {
        let responseCart = req.session.cart || [];

        if (req.session.customerId) {
            // DB Logic
            const cart = await prisma.cart.findUnique({
                where: { customerId: req.session.customerId }
            });

            if (cart) {
                if (qty > 0) {
                    await prisma.cartItem.upsert({
                        where: {
                            cartId_productId: {
                                cartId: cart.id,
                                productId: pId
                            }
                        },
                        update: { quantity: qty },
                        create: {
                            cartId: cart.id,
                            productId: pId,
                            quantity: qty
                        }
                    });
                } else {
                    await prisma.cartItem.deleteMany({
                        where: {
                            cartId: cart.id,
                            productId: pId
                        }
                    });
                }
            }

            // Fetch updated cart to return
            const updatedCart = await prisma.cart.findUnique({
                where: { customerId: req.session.customerId },
                include: { items: { include: { product: true } } }
            });

            if (updatedCart && updatedCart.items.length > 0) {
                responseCart = updatedCart.items.map(item => {
                    let image = '/assets/images/logo.png';
                    if (item.product.images && item.product.images.length > 0) {
                        const img = item.product.images[0].trim();
                        image = (img.startsWith('http') || img.startsWith('/')) ? img : '/uploads/' + img;
                    }
                    return {
                        productId: item.productId,
                        name: item.product.product_name,
                        price: item.product.on_sale && item.product.sale_price ? parseFloat(item.product.sale_price) : parseFloat(item.product.price_amount || item.product.price),
                        image: image,
                        slug: item.product.slug,
                        quantity: item.quantity
                    };
                });
            } else {
                responseCart = [];
            }
            req.session.cart = responseCart;

        } else {
            // Session Logic
            if (!req.session.cart) {
                return res.status(400).json({ success: false, message: 'Cart is empty' });
            }

            const item = req.session.cart.find(i => i.productId === pId);
            if (item) {
                if (qty > 0) {
                    item.quantity = qty;
                } else {
                    req.session.cart = req.session.cart.filter(i => i.productId !== pId);
                }
            }
            responseCart = req.session.cart;
        }

        res.json({ success: true, cart: responseCart });
    } catch (error) {
        console.error('Update quantity error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.removeItem = async (req, res) => {
    const { productId } = req.body;
    const pId = parseInt(productId);

    if (isNaN(pId)) {
        return res.status(400).json({ success: false, message: 'Invalid Product ID' });
    }

    try {
        let responseCart = req.session.cart || [];

        if (req.session.customerId) {
            const cart = await prisma.cart.findUnique({
                where: { customerId: req.session.customerId }
            });

            if (cart) {
                await prisma.cartItem.deleteMany({
                    where: {
                        cartId: cart.id,
                        productId: pId
                    }
                });
            }

            // Fetch updated cart to return
            const updatedCart = await prisma.cart.findUnique({
                where: { customerId: req.session.customerId },
                include: { items: { include: { product: true } } }
            });

            if (updatedCart && updatedCart.items.length > 0) {
                responseCart = updatedCart.items.map(item => {
                    let image = '/assets/images/logo.png';
                    if (item.product.images && item.product.images.length > 0) {
                        const img = item.product.images[0].trim();
                        image = (img.startsWith('http') || img.startsWith('/')) ? img : '/uploads/' + img;
                    }
                    return {
                        productId: item.productId,
                        name: item.product.product_name,
                        price: item.product.on_sale && item.product.sale_price ? parseFloat(item.product.sale_price) : parseFloat(item.product.price_amount || item.product.price),
                        image: image,
                        slug: item.product.slug,
                        quantity: item.quantity
                    };
                });
            } else {
                responseCart = [];
            }
            req.session.cart = responseCart;
        } else {
            if (req.session.cart) {
                req.session.cart = req.session.cart.filter(i => i.productId !== pId);
            }
            responseCart = req.session.cart;
        }

        res.json({ success: true, cart: responseCart });
    } catch (error) {
        console.error('Remove item error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.getSimilarProducts = async (req, res) => {
    const cart = req.session.cart || [];

    try {
        let categoryIds = [];
        let excludeIds = [];

        if (cart.length > 0) {
            excludeIds = cart.map(item => item.productId);
            // Fetch categories for cart items
            const cartProductDetails = await prisma.product.findMany({
                where: { id: { in: excludeIds } },
                select: { category_id: true }
            });
            categoryIds = [...new Set(cartProductDetails.map(p => p.category_id))];
        }

        let products;
        if (categoryIds.length > 0) {
            // Find products in same categories
            products = await prisma.product.findMany({
                where: {
                    category_id: { in: categoryIds },
                    id: { notIn: excludeIds },
                    status: 1
                },
                take: 10,
                orderBy: { created_at: 'desc' }
            });
        }

        // Fallback or padding if not enough category-specific products
        if (!products || products.length < 4) {
            const moreProducts = await prisma.product.findMany({
                where: {
                    id: { notIn: [...excludeIds, ...(products ? products.map(p => p.id) : [])] },
                    status: 1
                },
                take: 10 - (products ? products.length : 0),
                orderBy: { created_at: 'desc' }
            });
            products = [...(products || []), ...moreProducts];
        }

        res.json({ success: true, products });
    } catch (error) {
        console.error('Get similar products error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.mergeSessionCart = async (sessionCart, customerId) => {
    if (!sessionCart || sessionCart.length === 0) return;

    try {
        let cart = await prisma.cart.findUnique({
            where: { customerId: customerId }
        });

        if (!cart) {
            cart = await prisma.cart.create({
                data: { customerId: customerId }
            });
        }

        for (const item of sessionCart) {
            const existingItem = await prisma.cartItem.findUnique({
                where: {
                    cartId_productId: {
                        cartId: cart.id,
                        productId: item.productId
                    }
                }
            });

            if (existingItem) {
                await prisma.cartItem.update({
                    where: { id: existingItem.id },
                    data: { quantity: existingItem.quantity + item.quantity }
                });
            } else {
                await prisma.cartItem.create({
                    data: {
                        cartId: cart.id,
                        productId: item.productId,
                        quantity: item.quantity
                    }
                });
            }
        }
    } catch (error) {
        console.error('Error merging session cart:', error);
    }
};
