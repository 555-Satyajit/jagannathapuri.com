const express = require('express');
const path = require('path');
const session = require('express-session');
const routes = require('./routes/index');
const prisma = require('./lib/prisma');
const configStore = require('./lib/configStore');

const app = express();

const helmet = require('helmet');

// 1. Security Headers (Helmet)
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    originAgentCluster: false
}));

// Trust Proxy (Required for Nginx/Load Balancers)
app.set('trust proxy', 1);

// 2. Serve static files FIRST (High priority for performance)
app.use('/assets', express.static(path.join(__dirname, '../../assets')));
app.use('/admin-assets', express.static(path.join(__dirname, '../../admin-panel/assets')));
app.use('/uploads', express.static(path.join(__dirname, '../../admin-panel/assets/uploads')));

// 3. Middleware to fetch site configuration (Using Cache)
app.use(async (req, res, next) => {
    // Skip config for common static extensions if they somehow reach here
    if (req.path.match(/\.(jpg|jpeg|png|gif|css|js|ico|svg|woff|woff2)$/)) {
        return next();
    }

    try {
        const settings = await configStore.getConfig();
        res.locals.siteConfig = settings || {};

        // Expose public Supabase keys to views
        res.locals.process = {
            env: {
                SUPABASE_URL: process.env.SUPABASE_URL,
                SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY
            }
        };

        next();
    } catch (error) {
        console.error('Error in site config middleware:', error);
        res.locals.siteConfig = {};
        next();
    }
});

// 4. Session and Body Parsing
app.use(session({
    secret: process.env.SESSION_SECRET || 'jay-subhdra-fallback-secret-key', // Use ENV in production
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production' && process.env.USE_SECURE_COOKIES === 'true', // Only secure if explicitly enabled
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
}));

// Add user session to locals for all views
// Add user session to locals for all views
app.use(async (req, res, next) => {
    res.locals.user = req.session.customerId ? {
        id: req.session.customerId,
        name: req.session.customerName
    } : null;
    res.locals.session = req.session;

    // Cart Logic for Views (Sidebar, Header Count)
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
                        price: parseFloat(item.product.price_amount || item.product.price),
                        image: image,
                        slug: item.product.slug,
                        quantity: item.quantity
                    };
                });
            }
        } catch (error) {
            console.error('Error fetching cart for view:', error);
            // Fallback to empty or session if DB fails (though DB fail is bad)
        }
    }
    res.locals.cart = cart;

    next();
});

const categoryMiddleware = require('./middlewares/categoryMiddleware');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(categoryMiddleware);

app.set('view engine', 'ejs');
app.set('views', [
    path.join(__dirname, '../../user-ui'),
    path.join(__dirname, '../../admin-panel/Ui')
]);

app.use('/', routes);

module.exports = app;
