const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const productCategoriesPublish = await prisma.category.count({ where: { status: 'Publish' } });
    const productCategoriesAll = await prisma.category.count();
    const libraryCategoriesActive = await prisma.libraryCategory.count({ where: { status: 'Active' } });
    const libraryCategoriesAll = await prisma.libraryCategory.count();
    const homeTabsActive = await prisma.homeTab.count({ where: { status: 'Active' } });

    console.log('--- Database Count Results ---');
    console.log('Product Categories (Publish):', productCategoriesPublish);
    console.log('Product Categories (All):', productCategoriesAll);
    console.log('Library Categories (Active):', libraryCategoriesActive);
    console.log('Library Categories (All):', libraryCategoriesAll);
    console.log('Home Tabs (Active):', homeTabsActive);
    console.log('------------------------------');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
