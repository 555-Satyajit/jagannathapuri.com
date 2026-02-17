const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function activateCategories() {
    try {
        console.log("Activating all categories...");

        const updateResult = await prisma.category.updateMany({
            data: {
                status: 'active'
            }
        });

        console.log(`Updated ${updateResult.count} categories to 'active' status.`);

    } catch (error) {
        console.error("Error activating categories:", error);
    } finally {
        await prisma.$disconnect();
    }
}

activateCategories();
