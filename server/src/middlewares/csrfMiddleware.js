const csrf = require('csurf');

// Switch to signed cookies for even better stability and security
const csrfProtection = (req, res, next) => {
    const isProduction = process.env.NODE_ENV === 'production';
    const host = req.headers.host || '';
    const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
    
    // Only use secure cookies if in production and NOT on localhost (for dev testing)
    const secure = isProduction && !isLocal && (req.secure || req.headers['x-forwarded-proto'] === 'https');

    if (isProduction) {
        console.log(`[CSRF Debug] Path: ${req.path}, Host: ${host}, isLocal: ${isLocal}, Secure: ${secure}`);
        console.log(`[CSRF Debug] Cookies: ${req.signedCookies ? Object.keys(req.signedCookies) : 'None'}`);
    }

    return csrf({ 
        cookie: {
            signed: true,
            httpOnly: true,
            secure: secure,
            sameSite: 'lax',
            path: '/'
        }
    })(req, res, next);
};

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
