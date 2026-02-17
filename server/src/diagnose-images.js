const prisma = require('./lib/prisma');
async function diagnose() {
    const heroes = await prisma.heroSection.findMany();
    console.log('--- HERO SECTION IMAGES ---');
    heroes.forEach(h => {
        console.log(`ID: ${h.id}, Title: ${h.title}, Image: "${h.image}"`);
    });
    process.exit(0);
}
diagnose();
