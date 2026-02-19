const prisma = require('../lib/prisma');

module.exports = async (req, res, next) => {
    // console.log('--- AUTH MIDDLEWARE HIT --- URL:', req.originalUrl);
    if (req.session && req.session.admin && req.session.admin.id) {
        try {
            // Fetch full staff details to be available in all views (header/sidebar)
            // and subsequent middleware
            const staff = await prisma.staff.findUnique({
                where: { id: req.session.admin.id },
                include: {
                    role: {
                        include: {
                            permissions: true
                        }
                    }
                }
            });

            if (!staff) {
                // Session exists but user not found in DB (deleted?)
                req.session.destroy();
                return res.redirect('/admin/login?error=Account not found');
            }

            if (staff.status !== 'Active') {
                req.session.destroy();
                return res.redirect('/admin/login?error=Your account is inactive.');
            }

            // Attach to request and locals
            req.user = staff;
            res.locals.staff = staff;

            return next();
        } catch (error) {
            console.error('Error in authMiddleware:', error);
            // Don't crash, just redirect to login if auth fails technically
            // But maybe we should 500? No, safe to ask for login.
            return res.redirect('/admin/login?error=Authentication error');
        }
    } else {
        return res.redirect('/admin/login');
    }
};
