const prisma = require('../lib/prisma');

const notificationMiddleware = async (req, res, next) => {
    try {
        // Only fetch for GET requests to optimize performance
        // Most POST/PUT/DELETE requests redirect, so they don't need view data
        if (req.method === 'GET') {
            const notifications = await prisma.notification.findMany({
                where: { isArchived: false },
                orderBy: { createdAt: 'desc' },
                orderBy: { createdAt: 'desc' },
                take: 10
            });

            const unreadCount = await prisma.notification.count({
                where: {
                    isRead: false,
                    isArchived: false
                }
            });

            res.locals.notifications = notifications;
            res.locals.unreadNotificationCount = unreadCount;
        } else {
            res.locals.notifications = [];
            res.locals.unreadNotificationCount = 0;
        }
        next();
    } catch (error) {
        console.error('Error in notificationMiddleware:', error);
        // Fail gracefully so the page still loads
        res.locals.notifications = [];
        res.locals.unreadNotificationCount = 0;
        next();
    }
};

module.exports = notificationMiddleware;
