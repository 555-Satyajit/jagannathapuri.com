require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

const JSON_PATH = path.join(__dirname, '../admin-panel/assets/json');

async function main() {
    console.log('--- Starting Database Restoration ---');

    // 1. Restore Permissions
    console.log('Restoring Permissions...');
    const permissions = [
        { name: 'view_dashboard' },
        { name: 'manage_products' },
        { name: 'manage_orders' },
        { name: 'manage_customers' },
        { name: 'manage_staff' },
        { name: 'manage_settings' },
        { name: 'view_reports' },
    ];
    for (const p of permissions) {
        await prisma.permission.upsert({
            where: { name: p.name },
            update: {},
            create: p,
        });
    }

    // 2. Restore Roles
    console.log('Restoring Roles...');
    const roles = [
        { name: 'Admin', permissions: ['view_dashboard', 'manage_products', 'manage_orders', 'manage_customers', 'manage_staff', 'manage_settings', 'view_reports'] },
        { name: 'Manager', permissions: ['view_dashboard', 'manage_products', 'manage_orders', 'manage_customers', 'view_reports'] },
        { name: 'Editor', permissions: ['view_dashboard', 'manage_products'] },
        { name: 'Support', permissions: ['view_dashboard', 'manage_orders', 'manage_customers'] },
        { name: 'Restricted User', permissions: ['view_dashboard'] }
    ];
    for (const r of roles) {
        const permissionRecords = await prisma.permission.findMany({
            where: { name: { in: r.permissions } }
        });
        await prisma.role.upsert({
            where: { name: r.name },
            update: {
                permissions: {
                    set: [],
                    connect: permissionRecords.map(p => ({ id: p.id }))
                }
            },
            create: {
                name: r.name,
                permissions: {
                    connect: permissionRecords.map(p => ({ id: p.id }))
                }
            },
        });
    }

    // 3. Restore Staff
    console.log('Restoring Staff...');
    const staffFile = path.join(JSON_PATH, 'staff-list.json');
    if (fs.existsSync(staffFile)) {
        const staffData = JSON.parse(fs.readFileSync(staffFile, 'utf8')).data;
        for (const staff of staffData) {
            const role = await prisma.role.findUnique({ where: { name: staff.role } });
            await prisma.staff.upsert({
                where: { email: staff.email },
                update: { roleId: role ? role.id : undefined },
                create: {
                    full_name: staff.full_name,
                    email: staff.email,
                    username: staff.username,
                    password: staff.password,
                    roleId: role ? role.id : null,
                    contact: staff.contact,
                    avatar: staff.avatar,
                    status: staff.status,
                    joining_date: staff.joining_date
                }
            });
        }
    }

    // 4. Restore Categories and Products
    console.log('Restoring Categories and Products...');
    const productFile = path.join(JSON_PATH, 'ecommerce-product-list.json');
    if (fs.existsSync(productFile)) {
        const productsData = JSON.parse(fs.readFileSync(productFile, 'utf8')).data;

        // Extract unique categories from product_type
        const categoryNames = [...new Set(productsData.map(p => p.product_type))];
        const categoryMap = {};

        for (const catName of categoryNames) {
            const slug = catName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            const category = await prisma.category.upsert({
                where: { name: catName },
                update: {},
                create: {
                    name: catName,
                    slug: slug,
                    status: 'Publish',
                }
            });
            categoryMap[catName] = category.id;
        }

        for (const p of productsData) {
            const slug = p.product_name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Math.random().toString(36).substr(2, 5);
            const priceVal = p.price.replace(/[^\d.]/g, '');
            await prisma.product.upsert({
                where: { sku: p.sku },
                update: {
                    product_name: p.product_name,
                    price: priceVal,
                    price_amount: parseFloat(priceVal) || 0,
                    quantity: p.quantity,
                    category_id: categoryMap[p.product_type],
                    status: 1,
                    images: p.images,
                    specifications: p.specifications || []
                },
                create: {
                    product_name: p.product_name,
                    product_brand: p.product_brand,
                    slug: slug,
                    sku: p.sku,
                    price: priceVal,
                    price_amount: parseFloat(priceVal) || 0,
                    quantity: p.quantity,
                    category_id: categoryMap[p.product_type],
                    status: 1,
                    is_cod: p.is_cod,
                    images: p.images,
                    product_type: p.product_type,
                    is_featured: true,
                    show_in_explore: true,
                    specifications: p.specifications || []
                }
            });
        }
    }

    // 5. Restore Default Site Config
    console.log('Restoring Site Config...');
    const defaultSiteConfig = {
        header: {
            logo: '/assets/images/logo.png',
            support_phone: '+91 6752 123456',
            top_bar_links: [
                { label: 'About us', url: '/about' },
                { label: 'My Account', url: '/user-account' },
                { label: 'My Wishlist', url: '/wishlist' },
                { label: 'Order Tracking', url: '#' }
            ],
            navbar_links: [
                { label: 'Home', url: '/' },
                { label: 'Shop', url: '/shop' },
                { label: 'Library', url: '/library' },
                { label: 'Service', url: '/service' },
                { label: 'About', url: '/about' },
                { label: 'Contact', url: '/contact' }
            ],
            navbar_support_phone: '+91 6752 123456'
        },
        footer: {
            brand_description: 'Your one-stop shop for authentic Puri Dham specialties, from Mahaprasad to Handlooms.',
            facebook: '#', instagram: '#', linkedin: '#', pinterest: '#', behance: '#',
            contact_address: 'Grand Road, Puri, Odisha, 752001',
            contact_phone: '+91 6752 123456',
            contact_email: 'support@puristore.com'
        }
    };

    await prisma.siteConfig.upsert({
        where: { key: 'header' },
        update: { value: defaultSiteConfig.header },
        create: { key: 'header', value: defaultSiteConfig.header }
    });
    await prisma.siteConfig.upsert({
        where: { key: 'footer' },
        update: { value: defaultSiteConfig.footer },
        create: { key: 'footer', value: defaultSiteConfig.footer }
    });

    // 6. Restore Home Configuration
    console.log('Restoring Home Configuration...');
    const homeConfigFile = path.join(JSON_PATH, 'home-config.json');
    if (fs.existsSync(homeConfigFile)) {
        const homeConfig = JSON.parse(fs.readFileSync(homeConfigFile, 'utf8'));

        // Clear existing to avoid duplicates (non-unique models)
        await prisma.heroSection.deleteMany({});
        await prisma.service.deleteMany({});
        await prisma.promoBanner.deleteMany({});

        // Restore Heroes
        if (homeConfig.heroes) {
            for (const h of homeConfig.heroes) {
                await prisma.heroSection.create({
                    data: {
                        header: h.header,
                        title: h.title,
                        description: h.description,
                        buttonText: h.buttonText,
                        buttonLink: h.buttonLink,
                        image: h.image,
                        status: 'Active'
                    }
                });
            }
        }

        // Restore Services
        if (homeConfig.services) {
            for (const s of homeConfig.services) {
                await prisma.service.create({
                    data: {
                        title: s.title,
                        slug: s.title.toLowerCase().replace(/ /g, '-'),
                        subtitle: s.subtitle,
                        icon: s.icon,
                        link: s.link,
                        status: 'Active'
                    }
                });
            }
        }
    }

    console.log('--- Restoration Completed Successfully ---');
}

main()
    .catch(e => {
        console.error('Restoration Failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
