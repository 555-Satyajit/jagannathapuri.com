const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const attrs = [
        { name: 'Weight', description: 'Total weight of the product (e.g. 500g, 1kg)' },
        { name: 'Fabric', description: 'Material used for textiles (e.g. Silk, Cotton)' },
        { name: 'Material', description: 'Construction material for crafts (e.g. Brass, Stone, Wood)' },
        { name: 'Sound Quality', description: 'Quality of sound for Sankhas or musical items' },
        { name: 'Shelf Life', description: 'Expiration duration for sweets or holy offerings' },
        { name: 'Color', description: 'Primary color of the product' },
        { name: 'Dimensions', description: 'Size of the product (LxBxH)' }
    ];

    console.log('Seeding attributes...');
    for (const a of attrs) {
        await prisma.attribute.upsert({
            where: { name: a.name },
            update: { description: a.description },
            create: a
        });
    }
    console.log('Seeded successfully');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
