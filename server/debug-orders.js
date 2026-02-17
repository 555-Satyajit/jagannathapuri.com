const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Fetching order counts...');
        const counts = await prisma.order.groupBy({
            by: ['status'],
            _count: { status: true }
        });
        console.log('Order Counts:', JSON.stringify(counts, null, 2));

        const allOrders = await prisma.order.findMany({
            select: { id: true, status: true }
        });
        console.log('All Orders:', JSON.stringify(allOrders, null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
