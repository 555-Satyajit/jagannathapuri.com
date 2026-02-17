const prisma = require('./src/lib/prisma');

async function resetSequence() {
    try {
        console.log('Resetting Customer ID sequence...');
        // Correct PostgreSQL sequence reset query
        await prisma.$executeRaw`SELECT setval('"Customer_id_seq"', (SELECT MAX(id) FROM "Customer"))`;
        console.log('Successfully reset Customer ID sequence.');
    } catch (error) {
        console.error('Failed to reset sequence:', error);
    } finally {
        await prisma.$disconnect();
    }
}

resetSequence();
