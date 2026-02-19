const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function syncRatings() {
    console.log('Starting Rating Sync...');
    try {
        const products = await prisma.product.findMany({
            include: {
                reviews: {
                    select: { rating: true }
                }
            }
        });

        console.log(`Found ${products.length} products to sync.`);

        for (const product of products) {
            const reviewsCount = product.reviews.length;
            const averageRating = reviewsCount > 0
                ? parseFloat((product.reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviewsCount).toFixed(1))
                : 0;

            await prisma.product.update({
                where: { id: product.id },
                data: {
                    averageRating: averageRating,
                    reviewCount: reviewsCount
                }
            });
            console.log(`Synced Product ID ${product.id}: ${reviewsCount} reviews, ${averageRating} avg rating.`);
        }

        console.log('Rating Sync Completed Successfully!');
    } catch (error) {
        console.error('Error syncing ratings:', error);
    } finally {
        await prisma.$disconnect();
    }
}

syncRatings();
