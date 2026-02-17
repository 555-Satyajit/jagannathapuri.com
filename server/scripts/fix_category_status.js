const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixCategoryStatus() {
    try {
        console.log("Updating all categories to 'Publish' status...");

        // Update both 'active' (my previous error) and 'Scheduled' (default) to 'Publish'
        const updateResult = await prisma.category.updateMany({
            where: {
                status: {
                    in: ['active', 'Scheduled']
                }
            },
            data: {
                status: 'Publish'
            }
        });

        console.log(`Updated ${updateResult.count} categories to 'Publish' status.`);

    } catch (error) {
        console.error("Error updating categories:", error);
    } finally {
        await prisma.$disconnect();
    }
}

fixCategoryStatus();
