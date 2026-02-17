const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const services = [
        {
            title: "Tours & Travel",
            slug: "tours-travel",
            subtitle: "Guided Tours",
            description: "Guided tours to Jagannath Temple, Konark, Chilika Lake, and Puri Sea Beach.",
            icon: "hgi-car-01",
            image: "https://placehold.co/600x400?text=Tours+and+Travel",
            phone: "+91 98765 43210",
            rating: 4.8,
            reviewsCount: 450,
            link: "/service/tours-travel"
        },
        {
            title: "Mandir Guidance",
            slug: "mandir-guidance",
            subtitle: "Rituals & Darshan",
            description: "Expert assistance for Temple Darshan, information on rituals and coordination.",
            icon: "hgi-guide",
            image: "https://placehold.co/600x400?text=Mandir+Guidance",
            phone: "+91 98765 43211",
            rating: 4.9,
            reviewsCount: 580,
            link: "/service/mandir-guidance"
        },
        {
            title: "Hotels & Stay",
            slug: "hotels-stay",
            subtitle: "Comfortable Stays",
            description: "Book comfortable stays near the Temple and Sea Beach for your pilgrimage.",
            icon: "hgi-hotel-01",
            image: "https://placehold.co/600x400?text=Hotels+and+Stay",
            phone: "+91 98765 43212",
            rating: 4.7,
            reviewsCount: 320,
            link: "/service/hotels-stay"
        },
        {
            title: "Flag Hosting",
            slug: "flag-hosting",
            subtitle: "Nilachakra Rituals",
            description: "Facilitating the sacred Nilachakra flag hosting ritual at the Temple.",
            icon: "hgi-flag-01",
            image: "https://placehold.co/600x400?text=Flag+Hosting",
            phone: "+91 98765 43213",
            rating: 4.6,
            reviewsCount: 210,
            link: "/service/flag-hosting"
        }
    ];

    for (const service of services) {
        await prisma.service.upsert({
            where: { slug: service.slug },
            update: service,
            create: service,
        });
    }

    console.log('Services seeded successfully');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
