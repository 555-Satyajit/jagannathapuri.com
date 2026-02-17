const prisma = require('./src/lib/prisma');

async function checkNotifications() {
    const all = await prisma.notification.findMany({});
    console.log('Total Notifications:', all.length);
    console.log('Notifications:', JSON.stringify(all, null, 2));

    const unarchived = await prisma.notification.findMany({
        where: { isArchived: false }
    });
    console.log('Unarchived Notifications:', unarchived.length);
}

checkNotifications()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
