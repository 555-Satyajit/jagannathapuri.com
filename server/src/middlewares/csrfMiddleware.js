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
    // Detailed logs to catch the specific failure for services
    console.log(`[CSRF Debug] Route-level check. Path: ${req.url}`);
    console.log(`[CSRF Debug] Signed Cookies: ${Object.keys(req.signedCookies || {}).join(', ')}`);
    console.log(`[CSRF Debug] Body: ${req.body ? 'Parsed' : 'NOT PARSED'}`);
    
    if (req.body) {
        console.log(`[CSRF Debug] Token in body: ${req.body._csrf ? 'Found' : 'MISSING'}`);
        if (!req.body._csrf) {
            console.log(`[CSRF Debug] Request body keys: ${Object.keys(req.body).join(', ')}`);
        }
    }

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
