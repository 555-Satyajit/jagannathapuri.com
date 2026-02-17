const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // 1. Get a customer and an order
    const customer = await prisma.customer.findFirst();
    const order = await prisma.order.findFirst();

    if (!customer) {
        console.error('Please seed customers first');
        return;
    }

    const transactions = [
        {
            transactionId: 'TR-9876',
            customer_id: customer.id,
            order_id: order ? order.id : null,
            amount: 234.50,
            date: new Date('2026-02-10T10:30:00Z'),
            paymentMethod: 'Mastercard',
            paymentLast4: '4321',
            status: 'Paid'
        },
        {
            transactionId: 'TR-9875',
            customer_id: customer.id,
            order_id: null,
            amount: 12.99,
            date: new Date('2026-02-09T14:15:00Z'),
            paymentMethod: 'Visa',
            paymentLast4: '1234',
            status: 'Paid'
        },
        {
            transactionId: 'TR-9874',
            customer_id: customer.id,
            order_id: null,
            amount: 567.00,
            date: new Date('2026-02-09T09:00:00Z'),
            paymentMethod: 'PayPal',
            paymentLast4: null,
            status: 'Pending'
        },
        {
            transactionId: 'TR-9873',
            customer_id: customer.id,
            order_id: null,
            amount: 105.20,
            date: new Date('2026-02-08T16:45:00Z'),
            paymentMethod: 'Mastercard',
            paymentLast4: '8765',
            status: 'Failed'
        }
    ];

    for (const t of transactions) {
        await prisma.transaction.upsert({
            where: { transactionId: t.transactionId },
            update: t,
            create: t
        });
    }

    console.log('Seeded transactions successfully');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
