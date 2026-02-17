const prisma = require('./lib/prisma');
async function diagnose() {
    const heroes = await prisma.heroSection.findMany();
    const configs = await prisma.siteConfig.findMany();
    console.log('--- HeroSection Data ---');
    console.log(JSON.stringify(heroes, null, 2));
    console.log('--- SiteConfig Data ---');
    console.log(JSON.stringify(configs, null, 2));
    process.exit(0);
}
diagnose();
