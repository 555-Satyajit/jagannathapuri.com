const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Starting benchmark...');
    
    let start = Date.now();
    await prisma.order.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: 1 } });
    console.log('Order sum:', Date.now() - start, 'ms');
    
    start = Date.now();
    await prisma.order.findMany({ take: 5, orderBy: { created_at: 'desc' }, include: { customer: true } });
    console.log('Recent orders:', Date.now() - start, 'ms');

    start = Date.now();
    await prisma.order.findMany({
        where: { paymentStatus: 1 },
        include: { items: { include: { product: { select: { costPrice: true } } } } }
    });
    console.log('Paid orders for profit:', Date.now() - start, 'ms');

    start = Date.now();
    await prisma.visitorLog.groupBy({ by: ['sessionId'], _count: { sessionId: true } });
    console.log('VisitorLog groupBy:', Date.now() - start, 'ms');

    start = Date.now();
    await prisma.$queryRaw`SELECT COUNT(DISTINCT "sessionId")::int as count FROM "VisitorLog"`;
    console.log('VisitorLog DISTINCT count:', Date.now() - start, 'ms');

    start = Date.now();
    await prisma.orderItem.groupBy({ by: ['productId'], _sum: { quantity: true }, orderBy: { _sum: { quantity: 'desc' } }, take: 5 });
    console.log('OrderItem top selling:', Date.now() - start, 'ms');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
