const express = require('express');
const path = require('path');
const session = require('express-session');
const routes = require('./routes/index');
const prisma = require('./lib/prisma');
const configStore = require('./lib/configStore');

const app = express();

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const pg = require('pg');
const pgSession = require('connect-pg-simple')(session);

// Create a separate pool for sessions with limited connections
const sessionPool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    max: 2, // Reduced to 2 to prevent "Max client connections reached" (Supabase limit)
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// 1. Security Headers (Helmet)
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

// Trust Proxy (Required for Nginx/Load Balancers)
app.set('trust proxy', 1);

// Rate Limiting definition
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5000, // Increased to 5000 to ensure NO real user gets blocked (approx 5 pages/sec)
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    skip: (req) => req.ip === '127.0.0.1' || req.ip === '::1' // Skip localhost
});

// 2. Serve static files FIRST (High priority for performance)
app.use('/assets', express.static(path.join(__dirname, '../../assets')));
app.use('/admin-assets', express.static(path.join(__dirname, '../../admin-panel/assets')));
app.use('/uploads', express.static(path.join(__dirname, '../../admin-panel/assets/uploads')));

// Apply rate limiting AFTER static files
app.use(limiter);

// 3. Middleware to fetch site configuration (Using Cache)
app.use(async (req, res, next) => {
    try {
        const config = await configStore.getConfig();
        res.locals.siteConfig = config;

        // Ensure header/footer objects exist to prevent ejs errors
        if (!res.locals.siteConfig.header) res.locals.siteConfig.header = {};
        if (!res.locals.siteConfig.footer) res.locals.siteConfig.footer = {};

        next();
    } catch (error) {
        console.error('Error loading site config:', error);
        res.locals.siteConfig = { header: {}, footer: {} }; // Fallback
        next();
    }
});

// 4. Session and Body Parsing
app.use(session({
    store: new pgSession({
        pool: sessionPool, // Use our limited pool
        tableName: 'session',
        createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET || 'jay-subhdra-fallback-secret-key', // Use ENV in production
    resave: false,
    saveUninitialized: false, // Don't create session until something is stored
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Only secure if explicitly enabled or prod
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
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
