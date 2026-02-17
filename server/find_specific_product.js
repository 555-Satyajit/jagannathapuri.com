const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const products = await prisma.product.findMany({
        where: {
            OR: [
                { price: '63656' },
                { product_name: { contains: 'fxgb' } }
            ]
        },
        select: {
            id: true,
            product_name: true,
            images: true,
            price: true
        }
    });
    console.log(JSON.stringify(products, null, 2));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
