const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testFiltering() {
    console.log('Testing Filtering Logic...');

    // 1. Fetch all active products
    let products = await prisma.product.findMany({
        where: { status: 1 },
        include: { category: true }
    });
    console.log(`Total Active Products: ${products.length}`);

    // 2. Mock Filter: Price > 500
    const min_price = 500;
    const filteredByPrice = products.filter(p => parseFloat(p.price) >= min_price);
    console.log(`Products with Price >= ${min_price}: ${filteredByPrice.length}`);

    // 3. Mock Filter: Color = Red
    // We need to fetch specs for this check or if 'specifications' was included above
    // Let's re-fetch with specs or check if specs are included by default (they are not in findMany unless requested or default)
    // Actually specifications is a field, it is included by default if not excluded.

    // Check specs availability
    const productsWithSpecs = await prisma.product.findMany({
        where: { status: 1 }
    });

    const colorRed = productsWithSpecs.filter(p => {
        const specs = p.specifications;
        if (Array.isArray(specs)) {
            return specs.some(s => s.name === 'Color' && s.value === 'Red');
        }
        return false;
    });
    console.log(`Products with Color = Red: ${colorRed.length}`);

    if (colorRed.length === 0) {
        console.warn('WARNING: No products with Color=Red found. Attribute filtering might appear broken if no data matches.');
    }
}

testFiltering()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
