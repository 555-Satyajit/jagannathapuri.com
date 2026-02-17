const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedAttributes() {
    try {
        const attributesToSeed = [
            { name: 'Color', description: 'Product color variants' },
            { name: 'Size', description: 'Product size variants' },
            { name: 'Material', description: 'Product material' }
        ];

        for (const attr of attributesToSeed) {
            const existing = await prisma.attribute.findUnique({
                where: { name: attr.name }
            });

            if (!existing) {
                await prisma.attribute.create({
                    data: attr
                });
                console.log(`Created attribute: ${attr.name}`);
            } else {
                console.log(`Attribute already exists: ${attr.name}`);
            }
        }
    } catch (error) {
        console.error('Error seeding attributes:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedAttributes();
