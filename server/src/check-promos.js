const prisma = require('./lib/prisma');
async function check() {
    const promoCount = await prisma.promoBanner.count();
    console.log(`Promo count: ${promoCount}`);
    process.exit(0);
}
check();
