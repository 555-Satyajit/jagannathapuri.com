const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testCategoryFilter() {
    console.log('Testing Category Filter...');

    // 1. Get a distinct category slug from products
    const product = await prisma.product.findFirst({
        where: { status: 1 },
        include: { category: true }
    });

    if (!product || !product.category) {
        console.log('No active products with categories found to test.');
        return;
    }

    const testSlug = product.category.slug;
    console.log(`Testing filter with slug: ${testSlug}`);

    // 2. Fetch products with this category slug using the same logic as controller
    const where = {
        status: 1,
        category: { slug: testSlug }
    };

    const count = await prisma.product.count({ where });
    console.log(`Found ${count} products for category '${testSlug}'`);

    // 3. Test "All" logic (no filter)
    const allCount = await prisma.product.count({ where: { status: 1 } });
    console.log(`Total active products: ${allCount}`);
}

testCategoryFilter()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
