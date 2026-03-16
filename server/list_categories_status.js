const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const categories = await prisma.category.findMany({
        select: {
            id: true,
            name: true,
            status: true,
            parentId: true
        }
    });

    console.log('--- All Product Categories ---');
    categories.forEach(c => {
        console.log(`ID: ${c.id}, Name: ${c.name}, Status: ${c.status}, ParentID: ${c.parentId}`);
    });
    console.log('------------------------------');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
