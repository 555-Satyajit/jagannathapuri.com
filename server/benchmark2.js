const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Starting benchmark 2...');
    
    let start = Date.now();
    const allOrders = await prisma.order.findMany({
        include: { items: { include: { product: { select: { costPrice: true } } } } }
    });
    console.log('Fetched all orders with items:', Date.now() - start, 'ms. Count:', allOrders.length);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
