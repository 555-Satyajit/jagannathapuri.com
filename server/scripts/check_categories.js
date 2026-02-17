const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCategories() {
    try {
        console.log("Checking categories in database...");

        // Count total categories
        const totalCount = await prisma.category.count();
        console.log(`Total categories: ${totalCount}`);

        // Check for active top-level categories (what the middleware looks for)
        const activeTopLevels = await prisma.category.findMany({
            where: {
                status: 'active',
                parentId: null
            },
            include: {
                subCategories: true
            }
        });

        console.log(`Active Top-Level Categories found: ${activeTopLevels.length}`);

        if (activeTopLevels.length === 0) {
            console.log("No active top-level categories found. Listing ALL categories to diagnose:");
            const allCats = await prisma.category.findMany({ take: 10 });
            allCats.forEach(c => console.log(`- ID: ${c.id}, Name: ${c.name}, Status: ${c.status}, ParentID: ${c.parentId}`));
        } else {
            activeTopLevels.forEach(c => {
                console.log(`- Found: ${c.name} (ID: ${c.id}) with ${c.subCategories.length} subcategories`);
            });
        }

    } catch (error) {
        console.error("Error checking categories:", error);
    } finally {
        await prisma.$disconnect();
    }
}

checkCategories();
