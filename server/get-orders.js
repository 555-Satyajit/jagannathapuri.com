const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const orders = await prisma.order.findMany({
        take: 5,
        orderBy: { date: 'desc' },
        select: {
            id: true,
            orderNumber: true,
            paymentMethod: true,
            paymentStatus: true,
            status: true,
            razorpayPaymentId: true
        }
    });
    console.log(JSON.stringify(orders, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
