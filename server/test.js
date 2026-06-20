const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const data = await prisma.siteConfig.findMany();
    const config = {};
    for (const row of data) {
        config[row.key] = row.value;
    }
    console.log(JSON.stringify({
        header: config.header
    }, null, 2));
    await prisma.$disconnect();
}
main();
