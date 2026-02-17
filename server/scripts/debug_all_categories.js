const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugCategories() {
    try {
        console.log("Dumping ALL categories...");
        const allCats = await prisma.category.findMany();

        if (allCats.length === 0) {
            console.log("No categories found in database at all.");
        } else {
            allCats.forEach(c => {
                console.log(`ID: ${c.id}, Name: "${c.name}", Status: "${c.status}", ParentID: ${c.parentId}`);
            });
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

debugCategories();
