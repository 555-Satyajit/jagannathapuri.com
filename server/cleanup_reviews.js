
const prisma = require('./src/lib/prisma');

async function cleanup() {
    try {
        // Delete reviews with the broken image
        const deleted = await prisma.review.deleteMany({
            where: {
                images: {
                    has: "/uploads/reviews/review-1771225018252-762165653.png"
                }
            }
        });
        console.log('Deleted reviews:', deleted.count);

        // Also delete any with just the filename if it doesn't exist (optional, but let's stick to the known bad one)
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

cleanup();
