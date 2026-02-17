const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyLogic() {
    console.log('Verifying Filtering Logic...');

    // Simulate "All Categories" (category = 'all' or undefined)
    const category = 'all';
    const where = { status: 1 };
    if (category && category !== 'all') {
        where.category = { slug: category };
    }

    console.log('Where clause for "all":', JSON.stringify(where));
    const allCount = await prisma.product.count({ where });
    console.log('Product count for "all":', allCount);

    // Simulate specific category
    const cat = await prisma.category.findFirst({ where: { status: 'Publish' } });
    if (cat) {
        const specificCategory = cat.slug;
        const whereSpecific = { status: 1 };
        if (specificCategory && specificCategory !== 'all') {
            whereSpecific.category = { slug: specificCategory };
        }
        console.log(`Where clause for "${specificCategory}":`, JSON.stringify(whereSpecific));
        const specificCount = await prisma.product.count({ where: whereSpecific });
        console.log(`Product count for "${specificCategory}":`, specificCount);
    }
}

verifyLogic()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
