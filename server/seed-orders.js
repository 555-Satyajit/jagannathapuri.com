const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // 1. Get or create a test customer
    let customer = await prisma.customer.findFirst({
        include: { addresses: true }
    });

    if (!customer) {
        customer = await prisma.customer.create({
            data: {
                fullName: 'Gabrielle Feyer',
                email: 'gfeyer0@nyu.edu',
                phone: '1234567890',
                status: 'Active',
                totalSpent: 1821,
                orderCount: 12,
                addresses: {
                    create: [
                        {
                            addressLine1: '45 Roker Terrace',
                            city: 'Larington Cove',
                            state: 'Cairu',
                            zipCode: 'UK123',
                            country: 'UK',
                            type: 'Shipping',
                            isDefault: true
                        },
                        {
                            addressLine1: '45 Roker Terrace',
                            city: 'Larington Cove',
                            state: 'Cairu',
                            zipCode: 'UK123',
                            country: 'UK',
                            type: 'Billing'
                        }
                    ]
                }
            },
            include: { addresses: true }
        });
        console.log('Created test customer');
    }

    // 2. Get or create a test product
    let product = await prisma.product.findFirst();
    if (!product) {
        // Create a dummy category first if needed, but let's assume it exists or use a simple one
        let category = await prisma.category.findFirst();
        if (!category) {
            category = await prisma.category.create({
                data: {
                    name: 'Furniture',
                    slug: 'furniture',
                    status: 'Active'
                }
            });
        }
        product = await prisma.product.create({
            data: {
                product_name: 'Wooden Chair',
                product_brand: 'Jay Design',
                slug: 'wooden-chair',
                sku: 'WC-001',
                price: '841',
                quantity: 50,
                category_id: category.id,
                status: 1,
                product_type: 'Physical',
                images: ['1.png']
            }
        });
        console.log('Created test product');
    }

    // 3. Create a detailed order
    const orderData = {
        orderNumber: '5434',
        customer_id: customer.id,
        paymentStatus: 1, // Paid
        status: 2, // Delivered
        paymentMethod: 'paypal_logo',
        methodNumber: '3456',
        subtotal: 1682,
        tax: 30,
        shippingFee: 10,
        totalAmount: 1722,
        items: {
            create: [
                {
                    productId: product.id,
                    quantity: 2,
                    price: 841
                }
            ]
        }
    };

    const existingOrder = await prisma.order.findUnique({
        where: { orderNumber: orderData.orderNumber }
    });

    if (existingOrder) {
        // Delete items and recreate for fresh seed
        await prisma.orderItem.deleteMany({ where: { orderId: existingOrder.id } });
        await prisma.order.delete({ where: { id: existingOrder.id } });
    }

    await prisma.order.create({
        data: orderData
    });

    console.log('Seeded detailed order successfully');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
