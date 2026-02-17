const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function update() {
    try {
        const header = await prisma.siteConfig.findUnique({
            where: { key: 'header' }
        });

        if (header) {
            const val = header.value;
            val.navbar_links = [
                { label: 'Home', url: '/' },
                { label: 'Shop', url: '/shop' },
                {
                    label: 'Temple',
                    url: '#',
                    sub_links: [
                        { label: 'Daily Rituals', url: '/daily-rituals' },
                        { label: 'Panchang', url: '/panchang' }
                    ]
                },
                { label: 'Services', url: '/service' },
                { label: 'Library', url: '/library' },
                { label: 'Contact', url: '/contact' }
            ];

            await prisma.siteConfig.update({
                where: { key: 'header' },
                data: { value: val }
            });
            console.log('Successfully restructured Navbar: Moved Daily Rituals and Panchang into "Temple" dropdown.');
        }
    } catch (err) {
        console.error('Failed to update navbar:', err);
    } finally {
        await prisma.$disconnect();
    }
}

update();
