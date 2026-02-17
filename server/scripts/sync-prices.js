const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Starting price synchronization...');
    const products = await prisma.product.findMany();

    for (const product of products) {
        // Basic sync: set regular_price to current price_amount
        await prisma.product.update({
            where: { id: product.id },
            data: {
                regular_price: product.price_amount,
                sale_price: null,
                on_sale: false
            }
        });
    }

    console.log(`Synchronized ${products.length} products.`);

    // Set one product on sale for testing
    if (products.length > 0) {
        const testProduct = products[0];
        const salePrice = Math.round(testProduct.price_amount * 0.85); // 15% OFF
        await prisma.product.update({
            where: { id: testProduct.id },
            data: {
                sale_price: salePrice,
                on_sale: true
            }
        });
        console.log(`Set product "${testProduct.product_name}" (ID: ${testProduct.id}) on sale for testing.`);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
