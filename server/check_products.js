const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const products = await prisma.product.findMany({
        take: 5,
        select: {
            id: true,
            product_name: true,
            images: true,
            category_id: true
        }
    });
    console.log(JSON.stringify(products, null, 2));
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
