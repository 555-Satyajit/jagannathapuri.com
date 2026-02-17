const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Daily Rituals...');

    // Daily Rituals
    const rituals = [
        { name: 'Dwara Phita', time: '05:00 AM', icon: 'fas fa-sun' },
        { name: 'Mangala Alati', time: '05:30 AM', icon: 'fas fa-sun' },
        { name: 'Sakala Dhupa', time: '08:30 AM', icon: 'fas fa-sun' },
        { name: 'Bhoga Mandap', time: '11:00 AM', icon: 'fas fa-sun' },
        { name: 'Madhyanha Dhupa', time: '12:30 PM', icon: 'fas fa-sun' },
        { name: 'Sandhya Alati', time: '07:00 PM', icon: 'fas fa-moon' },
        { name: 'Sandhya Dhupa', time: '08:00 PM', icon: 'fas fa-moon' },
        { name: 'Bada Singara Besha', time: '09:00 PM', icon: 'fas fa-moon' }
    ];

    for (const r of rituals) {
        await prisma.dailyRitual.create({ data: r });
    }

    // Darshan Timings
    const darshans = [
        { name: 'Mangala Alati', timeRange: '04:30 AM', type: 'Special' },
        { name: 'General Darshan', timeRange: '07:00 AM - 01:00 PM', type: 'General' },
        { name: 'Pahuda (Closed)', timeRange: '01:00 PM - 04:00 PM', type: 'Pahuda' },
        { name: 'Evening Darshan', timeRange: '04:00 PM - 10:00 PM', type: 'General' }
    ];

    for (const d of darshans) {
        await prisma.darshanTiming.create({ data: d });
    }

    // Temple Facts
    const facts = [
        {
            title: 'Patita Pavana Bana',
            description: 'The flag atop the temple always flows in the opposite direction of the wind.',
            icon: 'fas fa-flag',
            colorClass: 'primary'
        },
        {
            title: 'Mahaprasad Mystery',
            description: 'The quantity of food cooked remains the same, yet it feeds thousands or millions without waste.',
            icon: 'fas fa-info-circle',
            colorClass: 'secondary'
        },
        {
            title: 'Silence of the Ocean',
            description: 'You cannot hear the sound of the ocean once you take a step inside the Singhadwara (Main Gate).',
            icon: 'fas fa-volume-mute',
            colorClass: 'primary'
        }
    ];

    for (const f of facts) {
        await prisma.templeFact.create({ data: f });
    }

    console.log('Seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
