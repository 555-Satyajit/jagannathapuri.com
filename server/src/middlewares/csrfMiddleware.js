const csrf = require('csurf');

// Switch to signed cookies for even better stability and security
const csrfProtection = csrf({ 
    cookie: {
        signed: true,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
    }
});

const conditionalCsrf = (req, res, next) => {
    // Exclude Supabase session verify route from global CSRF
    // This route already uses secure access_token verification
    if (req.path === '/auth/session/verify') {
        return next();
    }

    // For GET requests, we ALWAYS want to call csrfProtection to ensure req.csrfToken is available
    if (req.method === 'GET') {
        return csrfProtection(req, res, next);
    }

    const contentType = req.headers['content-type'] || '';
    if (contentType.includes('multipart/form-data')) {
        // Skip validation for multipart, but we'll handle it at route level
        return next();
    }
    
    return csrfProtection(req, res, next);
};

const routeCsrfProtection = (req, res, next) => {
    return csrfProtection(req, res, (err) => {
        if (err) {
            console.error(`[CSRF Debug] Validation FAILED: ${err.message}`);
        } else {
            console.log(`[CSRF Debug] Validation SUCCESS`);
        }
        next(err);
    });
};

module.exports = {
    csrfProtection: routeCsrfProtection,
    conditionalCsrf
};
