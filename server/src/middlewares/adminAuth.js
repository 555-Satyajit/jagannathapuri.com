const prisma = require('../lib/prisma');

module.exports = async (req, res, next) => {
    try {
        if (!req.session || !req.session.admin) {
            if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
                return res.status(401).json({ success: false, error: 'Please login as admin to continue.' });
            }
            return res.redirect('/admin/login');
        }

        // Fetch staff with role and permissions
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

        if (!staff || staff.status !== 'Active') {
            req.session.destroy();
            return res.redirect('/admin/login?error=Invalid or inactive account.');
        }

        // Attach to request for controllers and checkPermission middleware
        req.user = staff;
        res.locals.staff = staff;
        next();
    } catch (error) {
        console.error('Error in adminAuth middleware:', error);
        res.status(500).send('Internal Server Error');
    }
};
