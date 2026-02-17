const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCategoriesCorrected() {
    try {
        console.log("Checking categories with CORRECTED query...");

        const activeTopLevels = await prisma.category.findMany({
            where: {
                status: 'active',
                parentId: null
            },
            include: {
                subCategories: {
                    where: { status: 'active' },
                    select: { name: true, slug: true, image: true }
                }
            },
            orderBy: {
                created_at: 'desc' // Using the correct field name
            }
        });

        console.log(`Deep check found: ${activeTopLevels.length} categories.`);
        activeTopLevels.forEach(c => {
            console.log(`- ${c.name} (Subcats: ${c.subCategories.length})`);
        });

    } catch (error) {
        console.error("Error in script:", error);
    } finally {
        await prisma.$disconnect();
    }
}

checkCategoriesCorrected();
