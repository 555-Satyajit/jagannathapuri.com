const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Panchang and Festivals...');

    // Festivals
    const festivals = [
        { name: 'Maha Shivratri', date: new Date('2026-02-18'), description: 'Great night of Shiva', type: 'Major' },
        { name: 'Holi', date: new Date('2026-03-04'), description: 'Festival of colors', type: 'Major' },
        { name: 'Rama Navami', date: new Date('2026-03-27'), description: 'Birth of Lord Rama', type: 'Major' },
        { name: 'Hanuman Jayanti', date: new Date('2026-04-11'), description: 'Birth of Hanuman', type: 'Major' },
        { name: 'Akshaya Tritiya', date: new Date('2026-04-19'), description: 'Auspicious day for success', type: 'Common' }
    ];

    for (const f of festivals) {
        await prisma.festival.upsert({
            where: { id: 0 }, // Dummy where for creation
            update: {},
            create: f
        }).catch(e => {
            // Upsert with id 0 will fail if not existing, so just create
            return prisma.festival.create({ data: f });
        });
    }

    // Panchang Entry for Today (or specific dates)
    const panchangData = {
        date: new Date('2026-02-18'),
        data: {
            sections: [
                {
                    title: 'Sun & Moon',
                    fields: [
                        { label: 'Sunrise', value: '06:38 AM' },
                        { label: 'Sunset', value: '05:48 PM' },
                        { label: 'Moonrise', value: '11:54 PM' },
                        { label: 'Moonset', value: '10:16 AM' }
                    ]
                },
                {
                    title: 'Panchang Details',
                    fields: [
                        { label: 'Tithi', value: 'Krishna-Paksha Saptami' },
                        { label: 'Nakshatra', value: 'Swati' },
                        { label: 'Yoga', value: 'Dand' },
                        { label: 'Karana', value: 'Vishti' },
                        { label: 'Vikram Samvat', value: '2082 (Kaalyukt)' },
                        { label: 'Shaka Samvat', value: '1947 (Vishwavasu)' },
                        { label: 'Month Amanta', value: 'Magha' },
                        { label: 'Month Purnimanta', value: 'Phalguna' }
                    ]
                },
                {
                    title: 'Auspicious Timings',
                    fields: [
                        { label: 'Abhijit Muhurat', value: '11:51 AM to 12:35 PM' },
                        { label: 'Amrit Kaal', value: '08:20 PM to 09:50 PM' }
                    ]
                },
                {
                    title: 'Inauspicious Timings',
                    fields: [
                        { label: 'Rahu Kaal', value: '04:24 PM to 05:48 PM' },
                        { label: 'Gulik Kaal', value: '03:00 PM to 04:24 PM' },
                        { label: 'Yamghant', value: '12:13 PM to 01:37 PM' }
                    ]
                }
            ]
        }
    };

    await prisma.panchang.create({ data: panchangData });

    console.log('Seeding completed successfully!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
