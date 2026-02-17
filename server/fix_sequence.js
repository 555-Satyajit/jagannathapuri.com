const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Resetting Category ID sequence...');
        // This SQL command resets the autoincrement sequence for the Category table
        await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"Category"', 'id'), coalesce(max(id), 0) + 1, false) FROM "Category";`);
        console.log('Sequence reset successfully');

        const count = await prisma.category.count();
        console.log('Current category count:', count);

        if (count > 0) {
            const categories = await prisma.category.findMany();
            console.log('Existing categories:', categories.map(c => ({ id: c.id, name: c.name })));
        }
    } catch (e) {
        console.error('Error resetting sequence:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
