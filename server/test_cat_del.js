const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    try {
        const cat = await prisma.category.findFirst({ include: { products: true, subCategories: true, homeTabs: true }});
        console.log("Found Category:", cat.name);
        console.log("- products:", cat.products.length);
        console.log("- subCategories:", cat.subCategories.length);
        console.log("- homeTabs:", cat.homeTabs.length);
    } catch(e) { console.error(e); }
    finally { await prisma.$disconnect(); }
}
main();
