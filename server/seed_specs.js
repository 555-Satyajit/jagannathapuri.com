const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Update first 3 products to have Color: Red, Size: S
    const products = await prisma.product.findMany({ take: 3 });

    for (const p of products) {
        await prisma.product.update({
            where: { id: p.id },
            data: {
                specifications: [
                    { name: "Color", value: "Red" },
                    { name: "Size", value: "S" },
                    { name: "Weight", value: "1kg" }
                ]
            }
        });
        console.log(`Updated product ${p.id} with Red/S`);
    }

    // Update next 3 products to have Color: Blue, Size: M
    const products2 = await prisma.product.findMany({ skip: 3, take: 3 });
    for (const p of products2) {
        await prisma.product.update({
            where: { id: p.id },
            data: {
                specifications: [
                    { name: "Color", value: "Blue" },
                    { name: "Size", value: "M" }
                ]
            }
        });
        console.log(`Updated product ${p.id} with Blue/M`);
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
