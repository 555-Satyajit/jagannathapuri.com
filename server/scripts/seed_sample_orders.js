require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding sample orders...');

    // 1. Get some products
    const products = await prisma.product.findMany({ take: 3 });
    if (products.length === 0) {
        console.log('No products found. Please seed products first.');
        return;
    }

    // 2. Create sample customers
    const customer1 = await prisma.customer.upsert({
        where: { email: 'john.doe@example.com' },
        update: {},
        create: {
            fullName: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+91 98765 43210',
            avatar: '1.png',
            status: 'Active',
            orderCount: 2,
            totalSpent: 1540.50
        }
    });

    const customer2 = await prisma.customer.upsert({
        where: { email: 'jane.smith@example.com' },
        update: {},
        create: {
            fullName: 'Jane Smith',
            email: 'jane.smith@example.com',
            phone: '+91 99988 77766',
            avatar: '2.png',
            status: 'Active',
            orderCount: 1,
            totalSpent: 750.00
        }
    });

    // 3. Create addresses
    const addr1 = await prisma.address.create({
        data: {
            customer_id: customer1.id,
            addressLine1: '456 Temple View Road',
            city: 'Puri',
            state: 'Odisha',
            zipCode: '752001',
            country: 'India',
            type: 'Shipping',
            isDefault: true
        }
    });

    const addr2 = await prisma.address.create({
        data: {
            customer_id: customer2.id,
            addressLine1: '789 Grand Road',
            city: 'Puri',
            state: 'Odisha',
            zipCode: '752001',
            country: 'India',
            type: 'Shipping',
            isDefault: true
        }
    });

    // 4. Create Orders
    const order1 = await prisma.order.create({
        data: {
            orderNumber: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
            customer_id: customer1.id,
            paymentStatus: 1, // Paid
            status: 2, // Delivered
            paymentMethod: 'Mastercard',
            methodNumber: '1234',
            subtotal: 1200.00,
            tax: 60.00,
            shippingFee: 50.00,
            totalAmount: 1310.00,
            shippingAddressId: addr1.id,
            items: {
                create: [
                    {
                        productId: products[0].id,
                        quantity: 2,
                        price: 600.00
                    }
                ]
            }
        }
    });

    const order2 = await prisma.order.create({
        data: {
            orderNumber: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
            customer_id: customer1.id,
            paymentStatus: 2, // Pending
            status: 1, // Dispatched
            paymentMethod: 'Cash on Delivery',
            methodNumber: 'COD',
            subtotal: 200.00,
            tax: 10.00,
            shippingFee: 20.50,
            totalAmount: 230.50,
            shippingAddressId: addr1.id,
            items: {
                create: [
                    {
                        productId: products[1 % products.length].id,
                        quantity: 1,
                        price: 200.00
                    }
                ]
            }
        }
    });

    const order3 = await prisma.order.create({
        data: {
            orderNumber: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
            customer_id: customer2.id,
            paymentStatus: 2, // Pending
            status: 3, // Out for Delivery
            paymentMethod: 'Paypal',
            methodNumber: 'jane.smith@example.com',
            subtotal: 700.00,
            tax: 35.00,
            shippingFee: 15.00,
            totalAmount: 750.00,
            shippingAddressId: addr2.id,
            items: {
                create: [
                    {
                        productId: products[2 % products.length].id,
                        quantity: 1,
                        price: 700.00
                    }
                ]
            }
        }
    });

    console.log('Sample orders seeded successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
