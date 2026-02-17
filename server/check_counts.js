const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const productCount = await prisma.product.count();
        const categoryCount = await prisma.category.count();
        const customerCount = await prisma.customer.count();
        const orderCount = await prisma.order.count();
        const wishlistItemCount = await prisma.wishlistItem.count();

        console.log('--- Database Counts ---');
        console.log(`Products: ${productCount}`);
        console.log(`Categories: ${categoryCount}`);
        console.log(`Customers: ${customerCount}`);
        console.log(`Orders: ${orderCount}`);
        console.log(`Wishlist Items: ${wishlistItemCount}`);
    } catch (error) {
        console.error('Error checking counts:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
