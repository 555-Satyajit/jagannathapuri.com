const prisma = require('./lib/prisma');
async function diagnose() {
    const h = await prisma.heroSection.findFirst({ where: { id: 1 } });
    console.log(`FULL_IMAGE_NAME:[${h.image}]`);
    process.exit(0);
}
diagnose();
