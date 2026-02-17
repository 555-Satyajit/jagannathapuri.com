const prisma = require('../lib/prisma');

let categoryCache = null;
let lastFetch = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const categoryMiddleware = async (req, res, next) => {
    const now = Date.now();
    if (categoryCache && (now - lastFetch < CACHE_TTL)) {
        res.locals.headerCategories = categoryCache;
        return next();
    }

    try {
        const headerCategories = await prisma.category.findMany({
            where: {
                status: 'Publish',
                parentId: null
            },
            include: {
                subCategories: {
                    where: { status: 'Publish' },
                    select: {
                        name: true,
                        slug: true,
                        image: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        categoryCache = headerCategories;
        lastFetch = now;
        res.locals.headerCategories = headerCategories;
        next();
    } catch (error) {
        console.error('Error fetching header categories:', error);
        res.locals.headerCategories = categoryCache || []; // Fallback to last cache or empty
        next();
    }
};

module.exports = categoryMiddleware;
