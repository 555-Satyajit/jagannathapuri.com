
const prisma = require('./src/lib/prisma');

async function checkReviews() {
    try {
        const reviews = await prisma.review.findMany({
            orderBy: { created_at: 'desc' },
            take: 5
        });
        console.log('Recent Reviews:', JSON.stringify(reviews, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkReviews();
