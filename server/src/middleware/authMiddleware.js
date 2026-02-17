module.exports = (req, res, next) => {
    console.log('--- AUTH MIDDLEWARE HIT --- URL:', req.originalUrl);
    if (req.session && req.session.admin) {
        return next();
    } else {
        return res.redirect('/admin/login');
    }
};
