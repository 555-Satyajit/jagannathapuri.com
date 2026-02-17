const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAttributes() {
    try {
        const attributes = await prisma.attribute.findMany();
        console.log('Existing Attributes:', attributes);
    } catch (error) {
        console.error('Error fetching attributes:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkAttributes();
