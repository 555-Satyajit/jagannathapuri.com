const prisma = require('./lib/prisma');
async function diagnose() {
    const heroes = await prisma.heroSection.findMany();
    const configs = await prisma.siteConfig.findMany();

    console.log('--- ALL HERO SECTIONS ---');
    heroes.forEach(h => {
        console.log(`ID: ${h.id}, Header: ${h.header}, Title: ${h.title}, Status: ${h.status}`);
    });

    console.log('\n--- ALL SITE CONFIGS ---');
    configs.forEach(c => {
        console.log(`Key: ${c.key}, Value Type: ${typeof c.value}`);
        if (c.key === 'hero_section' || c.key.includes('hero')) {
            console.log('Value:', JSON.stringify(c.value, null, 2));
        }
    });
    process.exit(0);
}
diagnose();
