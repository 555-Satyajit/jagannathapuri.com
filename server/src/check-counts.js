const prisma = require('./lib/prisma');
async function check() {
    const heroCount = await prisma.heroSection.count();
    const promoCount = await prisma.promoBanner.count();
    console.log(`Hero count: ${heroCount}`);
    console.log(`Promo count: ${promoCount}`);
    process.exit(0);
}
check();
