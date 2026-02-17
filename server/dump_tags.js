const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function dumpTags() {
    try {
        const tags = await prisma.libraryTag.findMany();
        console.log(JSON.stringify(tags, null, 2));
    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

dumpTags();
