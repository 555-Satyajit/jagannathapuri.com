const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const parsePrice = (priceStr) => {
    if (!priceStr) return 0;
    const cleanPrice = priceStr.toString().replace(/[^\d.]/g, '');
    return parseFloat(cleanPrice) || 0;
};

async function syncPrices() {
    console.log('Starting price_amount synchronization...');
    try {
        const products = await prisma.product.findMany();
        console.log(`Found ${products.length} products total.`);

        let updatedCount = 0;
        for (const product of products) {
            const amount = parsePrice(product.price);
            if (product.price_amount !== amount) {
                await prisma.product.update({
                    where: { id: product.id },
                    data: { price_amount: amount }
                });
                updatedCount++;
            }
        }

        console.log(`Successfully synchronized ${updatedCount} products.`);
    } catch (error) {
        console.error('Error synchronizing prices:', error);
    } finally {
        await prisma.$disconnect();
    }
}

syncPrices();
