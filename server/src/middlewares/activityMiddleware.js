const prisma = require('../lib/prisma');

const activityMiddleware = async (req, res, next) => {
    // Only track GET requests to public pages (skip admin, api, and assets)
    if (
        req.method !== 'GET' || 
        req.path.startsWith('/admin') || 
        req.path.startsWith('/api') || 
        req.path.includes('.') ||
        req.path.startsWith('/admin-assets')
    ) {
        return next();
    }

    try {
        const path = req.path;
        const sessionId = req.sessionID;

        // Check if we already logged this URL for this session in the last 10 minutes
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        const recentLog = await prisma.visitorLog.findFirst({
            where: {
                sessionId: sessionId,
                url: path,
                timestamp: { gte: tenMinutesAgo }
            }
        });

        if (recentLog) {
            // Already tracked recently, don't count it as a new hit
            return next();
        }
        
        // Log the activity
        await prisma.visitorLog.create({
            data: {
                url: path,
                sessionId: sessionId,
                customerId: req.session.customerId || null,
                userAgent: req.get('User-Agent'),
                ipAddress: req.ip
            }
        });
    } catch (error) {
        // Silently fail logging to not disrupt user experience
        console.error('Error logging visitor activity:', error);
    }

    next();
};

module.exports = activityMiddleware;
