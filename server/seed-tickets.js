const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // 1. Get a customer and a staff member
    const customer = await prisma.customer.findFirst();
    const staff = await prisma.staff.findFirst();

    if (!customer || !staff) {
        console.error('Customer or Staff not found. Please seed them first.');
        return;
    }

    // 2. Clear existing tickets (optional, for clean seed)
    // await prisma.attachment.deleteMany();
    // await prisma.ticketMessage.deleteMany();
    // await prisma.ticket.deleteMany();

    // 3. Create sample tickets
    const ticket1 = await prisma.ticket.create({
        data: {
            ticketId: 'TKT-1001',
            subject: 'Payment processing error',
            description: 'Customer reported an error when trying to pay with Mastercard.',
            status: 'Open',
            priority: 'High',
            customer_id: customer.id,
            assignee_id: staff.id,
            messages: {
                create: [
                    {
                        content: 'I tried to pay for my order #1001 using Mastercard, but it failed with error code 0x99.',
                        authorCustomer_id: customer.id
                    },
                    {
                        content: 'Hello, we are looking into this. Could you please provide a screenshot of the error?',
                        authorStaff_id: staff.id
                    }
                ]
            }
        }
    });

    const ticket2 = await prisma.ticket.create({
        data: {
            ticketId: 'TKT-1002',
            subject: 'Shipment delayed',
            description: 'My order has not arrived yet after 5 days.',
            status: 'In Progress',
            priority: 'Medium',
            customer_id: customer.id,
            messages: {
                create: [
                    {
                        content: 'Order #1002 is still in "Shipped" status. No update for 3 days.',
                        authorCustomer_id: customer.id
                    }
                ]
            }
        }
    });

    // 4. Add attachments to the first message of ticket 1
    const firstMessage = await prisma.ticketMessage.findFirst({
        where: { ticket_id: ticket1.id },
        orderBy: { created_at: 'asc' }
    });

    await prisma.attachment.create({
        data: {
            message_id: firstMessage.id,
            file_name: 'error_log.txt',
            file_path: '/uploads/error_log.txt',
            file_type: 'text/plain'
        }
    });

    console.log('Seeded tickets successfully');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
