const prisma = require('../lib/prisma');

module.exports = (requiredPermission) => {
    return async (req, res, next) => {
        try {
            // Assume req.session.admin contains the logged-in user's basic info
            // or we might need to fetch the user again to get their latest role/permissions

            if (!req.session || !req.session.admin) {
                return res.redirect('/admin/login');
            }

            // req.user is populated by authMiddleware
            const staff = req.user;

            if (!staff) {
                // Should be caught by authMiddleware but double check
                return res.redirect('/admin/login');
            }

            // Fetch user with role and permissions
            // OPTIMIZATION: Use the staff object already fetched in authMiddleware
            /* const staff = await prisma.staff.findUnique({
                 where: { id: staffId },
                 include: {
                     role: {
                         include: {
                             permissions: true
                         }
                     }
                 }
             }); */

            if (!staff || !staff.role) {
                console.warn(`User ${staffId} has no role assigned.`);
                return res.status(403).render('pages/error-403', { layout: 'layouts/admin-master', title: 'Access Denied' });
                // Or just send 403 status if error page not ready
            }

            const hasPermission = staff.role.permissions.some(p => p.name === requiredPermission);

            if (hasPermission || staff.role.name === 'Admin') {
                req.user = staff; // Attach full staff object to request if needed
                return next();
            } else {
                console.warn(`User ${staff.username} denied access to ${req.originalUrl}. Missing permission: ${requiredPermission}`);
                return res.status(403).send('Access Denied: You do not have permission to view this resource.');
            }
        } catch (error) {
            console.error('Error in checkPermission middleware:', error);
            return res.status(500).send('Internal Server Error');
        }
    };
};
