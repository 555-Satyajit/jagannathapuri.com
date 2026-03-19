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

    const userAgent = req.get('User-Agent') || '';
    // 1. Skip Common Bots
    const botPatterns = [
        'GPTBot', 'Googlebot', 'Bingbot', 'yandexbot', 'applebot', 
        'Baiduspider', 'facebookexternalhit', 'Slackbot', 'BuiltWith',
        'AhrefsBot', 'MJ12bot', 'meta-webindexer', 'CensysInspect'
    ];
    
    if (botPatterns.some(pattern => userAgent.toLowerCase().includes(pattern.toLowerCase()))) {
        return next();
    }

    try {
        const path = req.path;
        const sessionId = req.sessionID;
        const ipAddress = req.ip;
        const userAgent = req.get('User-Agent') || '';

        // 1. Skip Common Bots
        const botPatterns = [
            'GPTBot', 'Googlebot', 'Bingbot', 'yandexbot', 'applebot', 
            'Baiduspider', 'facebookexternalhit', 'Slackbot', 'BuiltWith'
        ];
        
        const isBot = botPatterns.some(pattern => userAgent.toLowerCase().includes(pattern.toLowerCase()));
        if (isBot) {
            return next();
        }

        // 2. Enhanced Deduplication (Session OR IP + URL within 10 minutes)
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        const recentLog = await prisma.visitorLog.findFirst({
            where: {
                url: path,
                timestamp: { gte: tenMinutesAgo },
                OR: [
                    { sessionId: sessionId },
                    { ipAddress: ipAddress }
                ]
            }
        });

        if (recentLog) {
            // Already tracked recently, don't count it as a new hit
            return next();
        }
        
        // 3. Log the activity
        await prisma.visitorLog.create({
            data: {
                url: path,
                sessionId: sessionId,
                customerId: req.session.customerId || null,
                userAgent: userAgent,
                ipAddress: ipAddress
            }
        });
    } catch (error) {
        // Silently fail logging to not disrupt user experience
        console.error('Error logging visitor activity:', error);
    }

    next();
};

module.exports = activityMiddleware;
