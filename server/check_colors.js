const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const products = await prisma.product.findMany({
        where: {
            OR: [
                {
                    specifications: {
                        array_contains: [{ name: 'Color', value: 'Red' }] // Try to find *any* color
                    }
                },
                // Since we can't wildcard value in array_contains easily with this syntax, let's just fetch all and check in JS
            ]
        },
        take: 100,
        select: {
            id: true,
            specifications: true
        }
    });

    const allProducts = await prisma.product.findMany({
        select: { specifications: true }
    });

    const colorProducts = allProducts.filter(p => {
        const specs = p.specifications;
        if (Array.isArray(specs)) {
            return specs.some(s => s.name === 'Color' || s.name === 'Size');
        }
        return false;
    });

    console.log(`Total Products: ${allProducts.length}`);
    console.log(`Products with Color/Size: ${colorProducts.length}`);
    if (colorProducts.length > 0) {
        console.log('Sample:', JSON.stringify(colorProducts[0], null, 2));
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
