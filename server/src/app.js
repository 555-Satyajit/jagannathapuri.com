const express = require('express');
const cookieParser = require('cookie-parser');
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
    max: 5, // Increased from 2 to handle concurrent session requests better
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000, // Increased from 2000 to 10000ms
});

// PostgreSQL session store options
const sessionStoreOptions = {
    pool: sessionPool,
    tableName: 'session',
    createTableIfMissing: true
};

// Diagnostic Middleware for Proxy/SSL and Locals Defaults
app.use((req, res, next) => {
    res.locals.protocol = req.protocol;
    res.locals.host = req.get('host');
    res.locals.csrfToken = ''; // Default for EJS to avoid ReferenceError
    if (process.env.NODE_ENV === 'production') {
        console.log(`[Debug] ${req.method} ${req.url} - Secure: ${req.secure}, Protocol: ${req.protocol}, X-Forwarded-Proto: ${req.get('x-forwarded-proto')}`);
    }
    next();
});

// 1. Security Headers (Helmet)
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "localhost:*", "127.0.0.1:*", "https://cdn.jsdelivr.net", "https://*.googleapis.com", "https://code.jquery.com", "https://unpkg.com", "https://*.google-analytics.com", "https://www.googletagmanager.com", "https://translate.google.com", "https://www.gstatic.com", "https://checkout.razorpay.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "localhost:*", "127.0.0.1:*", "https://cdn.jsdelivr.net", "https://*.googleapis.com", "https://unpkg.com", "https://cdnjs.cloudflare.com", "https://www.gstatic.com"],
            imgSrc: ["'self'", "data:", "blob:", "localhost:*", "127.0.0.1:*", "https:", "http:", "https://*.googleapis.com", "https://translate.google.com", "https://www.gstatic.com", "https://*.razorpay.com"],
            fontSrc: ["'self'", "localhost:*", "127.0.0.1:*", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com", "https://unpkg.com", "data:"],
            connectSrc: ["'self'", "localhost:*", "127.0.0.1:*", "https://*.supabase.co", "https://*.google-analytics.com", "https://www.google-analytics.com", "https://*.googleapis.com", "https://cdn.jsdelivr.net", "https://*.razorpay.com"],
            frameSrc: ["'self'", "localhost:*", "127.0.0.1:*", "https://www.google.com", "https://translate.google.com", "https://*.googleapis.com", "https://*.razorpay.com"],
            mediaSrc: ["'self'", "localhost:*", "127.0.0.1:*", "data:", "blob:"],
            objectSrc: ["'none'"],
            ...(process.env.NODE_ENV === 'production' ? { upgradeInsecureRequests: [] } : {}),
        },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false
}));

// Trust Proxy (Required for Nginx/Load Balancers)
app.set('trust proxy', 1);

// Rate Limiting definition
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5000, 
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    skip: (req) => req.ip === '127.0.0.1' || req.ip === '::1' // Skip localhost
});

// Stricter limiter for Auth/OTP routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 attempts per 15 minutes
    message: 'Too many login or OTP attempts. Please try again later.'
});

// 2. Serve static files FIRST (High priority for performance)
app.use('/assets', express.static(path.join(__dirname, '../../assets')));
app.use('/admin-assets', express.static(path.join(__dirname, '../../admin-panel/assets')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Using the same secret for session and signed cookies
const cookieSecret = process.env.SESSION_SECRET || 'jay-subhdra-fallback-secret-key';
app.use(cookieParser(cookieSecret));

const adminSessionConfig = {
    name: 'admin_sid',
    secret: process.env.SESSION_SECRET || 'jay-subhdra-fallback-secret-key',
    store: new pgSession(sessionStoreOptions),
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 6 * 60 * 60 * 1000, // 6 hours
        sameSite: 'lax'
    },
    proxy: true
};

const shopSessionConfig = {
    name: 'shop_sid',
    secret: process.env.SESSION_SECRET || 'jay-subhdra-fallback-secret-key',
    store: new pgSession(sessionStoreOptions),
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
        sameSite: 'lax'
    },
    proxy: true
};

const adminSession = session({
    ...adminSessionConfig,
    store: new pgSession(sessionStoreOptions)
});
const shopSession = session({
    ...shopSessionConfig,
    store: new pgSession(sessionStoreOptions)
});

// Dispatcher Middleware for Sessions
app.use((req, res, next) => {
    const host = (req.get('host') || '').toLowerCase().split(':')[0];
    const adminDomain = (process.env.ADMIN_DOMAIN || '').toLowerCase().split(':')[0];
    
    // Check if the host matches the admin domain OR the path explicitly belongs to admin
    if ((adminDomain && host === adminDomain) || req.path.startsWith('/admin') || req.path.startsWith('/api/admin')) {
        adminSession(req, res, next);
    } else {
        shopSession(req, res, next);
    }
});

// CSRF protection has been removed as the app migrates to Next.js
// Default empty csrfToken is injected in the diagnostic middleware at the top

// Domain-based Routing Restriction Middleware
app.use((req, res, next) => {
    const host = (req.get('host') || '').toLowerCase().split(':')[0];
    const mainHost = (process.env.MAIN_DOMAIN || '').toLowerCase().split(':')[0];
    const adminHost = (process.env.ADMIN_DOMAIN || '').toLowerCase().split(':')[0];

    // Debugging for VPS issues (Silent in production unless NODE_ENV is not set)
    if (req.path === '/' || req.path.startsWith('/admin')) {
        console.log(`[Domain Check] Host: ${host}, Main: ${mainHost}, Admin: ${adminHost}, Path: ${req.path}`);
    }

    // Only apply restriction if domains are configured and distinct
    if (mainHost && adminHost && mainHost !== adminHost) {
        // If accessing via Admin Domain
        if (host === adminHost) {
            const allowedPaths = ['/admin', '/api', '/assets', '/admin-assets', '/uploads'];
            const isAllowed = allowedPaths.some(path => req.path.startsWith(path));
            
            if (!isAllowed) {
                // Redirect to main shop domain using current protocol
                const protocol = req.headers['x-forwarded-proto'] || req.protocol;
                const target = `${protocol}://${process.env.MAIN_DOMAIN}${req.url}`;
                console.log(`[Redirect] Admin -> Shop: ${target}`);
                return res.redirect(target);
            }
        } 
        // If accessing via Main Domain
        else if (host === mainHost) {
            // Prevent access to /admin on the main domain
            if (req.path.startsWith('/admin')) {
                return res.status(404).json({ error: 'Not Found' });
            }
        }
    }

    next();
});

// Activity Tracking Middleware
const activityMiddleware = require('./middlewares/activityMiddleware');
app.use(activityMiddleware);


// Middleware to fetch active popup for public site
app.use(async (req, res, next) => {
    // Only fetch for GET requests and skip assets/admin
    if (req.method !== 'GET' || req.path.startsWith('/admin') || req.path.startsWith('/api')) {
        return next();
    }

    try {
        const now = new Date();
        const activePopup = await prisma.popup.findFirst({
            where: {
                status: 'Active',
                startTime: { lte: now },
                endTime: { gte: now }
            },
            orderBy: { created_at: 'desc' }
        });
        res.locals.activePopup = activePopup;
        next();
    } catch (error) {
        console.error('Error fetching active popup:', error);
        res.locals.activePopup = null;
        next();
    }
});

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

app.use(categoryMiddleware);



app.use('/admin/login', authLimiter);
app.post('/api/send-otp', authLimiter);
app.post('/login', authLimiter);

app.use('/', routes);
app.use('/api/admin', require('./routes/adminApi'));
app.use('/api', require('./routes/api'));

// 404 Error Handler
app.use((req, res, next) => {
    // Return JSON 404 for all routes, as Next.js handles frontend 404s natively
    res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(`[Server Error] ${req.method} ${req.path} - ${err.message}`);
    next(err);
});

module.exports = app;
