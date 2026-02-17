const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {

    // 1. Define Permissions
    const permissions = [
        { name: 'view_dashboard' },
        { name: 'manage_products' },
        { name: 'manage_orders' },
        { name: 'manage_customers' },
        { name: 'manage_staff' },
        { name: 'manage_settings' },
        { name: 'view_reports' },
    ];

    console.log('Seeding permissions...');
    for (const p of permissions) {
        await prisma.permission.upsert({
            where: { name: p.name },
            update: {},
            create: p,
        });
    }

    // 2. Define Roles and assign Permissions
    const roles = [
        {
            name: 'Admin',
            permissions: ['view_dashboard', 'manage_products', 'manage_orders', 'manage_customers', 'manage_staff', 'manage_settings', 'view_reports']
        },
        {
            name: 'Manager',
            permissions: ['view_dashboard', 'manage_products', 'manage_orders', 'manage_customers', 'view_reports']
        },
        {
            name: 'Editor',
            permissions: ['view_dashboard', 'manage_products']
        },
        {
            name: 'Support',
            permissions: ['view_dashboard', 'manage_orders', 'manage_customers']
        },
        {
            name: 'Restricted User',
            permissions: ['view_dashboard']
        }
    ];

    console.log('Seeding roles...');
    for (const r of roles) {
        const permissionRecords = await prisma.permission.findMany({
            where: { name: { in: r.permissions } }
        });

        await prisma.role.upsert({
            where: { name: r.name },
            update: {
                permissions: {
                    set: [], // Clear existing relations
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

    const staffPath = path.join(__dirname, '../../admin-panel/assets/json/staff-list.json');
    const staffData = JSON.parse(fs.readFileSync(staffPath, 'utf8'));

    console.log('Seeding staff data...');

    for (const staff of staffData.data) {
        // Find role by name (handling case sensitivity or mapping if needed)
        // For now assuming JSON role matches Role name exactly or close enough
        let roleName = staff.role;
        // Normalize: "Restricted User" in DB vs maybe "Restricted" in JSON?
        // Let's assume JSON has "Admin", "Manager", etc.

        const role = await prisma.role.findUnique({ where: { name: roleName } });

        await prisma.staff.upsert({
            where: { email: staff.email },
            update: {
                roleId: role ? role.id : undefined
            },
            create: {
                full_name: staff.full_name,
                email: staff.email,
                username: staff.username,
                password: staff.password,
                // role: staff.role, // We can keep the string for now or remove it from schema later. Schema still has roleId.
                roleId: role ? role.id : null,
                contact: staff.contact,
                avatar: staff.avatar,
                status: staff.status,
                joining_date: staff.joining_date
            },
        });
    }

    console.log('Seeding completed.');

}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
