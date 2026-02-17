const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const posts = await prisma.blogPost.findMany();
    console.log('Blog Posts:', posts);
}

main()
    .catch((e) => {
        console.error(e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
