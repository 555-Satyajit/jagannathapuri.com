module.exports = (req, res, next) => {
    if (!req.session.customerId) {
        if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
            return res.status(401).json({ success: false, error: 'Please login to continue.' });
        }
        return res.redirect('/login');
    }
    next();
};
