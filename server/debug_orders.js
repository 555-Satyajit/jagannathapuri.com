const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkOrders() {
    try {
        const orders = await prisma.order.findMany({
            take: 20,
            orderBy: { created_at: 'desc' },
            select: {
                id: true,
                status: true,
                paymentStatus: true,
                totalAmount: true
            }
        });
        console.log('Recent Orders:', JSON.stringify(orders, null, 2));

        const totalRevenue = await prisma.order.aggregate({
            _sum: { totalAmount: true },
            where: { paymentStatus: 1 }
        });
        console.log('Total Revenue (status 1):', totalRevenue);

        const totalRevenueAll = await prisma.order.aggregate({
            _sum: { totalAmount: true }
        });
        console.log('Total Revenue (All):', totalRevenueAll);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkOrders();
