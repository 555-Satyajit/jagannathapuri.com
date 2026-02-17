const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function aggressiveClean() {
    try {
        console.log("Starting aggressive tag cleanup...");
        const tags = await prisma.libraryTag.findMany({
            include: { contents: true }
        });

        for (const tag of tags) {
            let realName = tag.name;

            // Regex to find "value":"(...)"
            const match = tag.name.match(/"value":"([^"]+)"/);
            if (match && match[1]) {
                realName = match[1];
            } else if (tag.name.includes('{') || tag.name.includes('[')) {
                // If it looks like JSON but regex failed, try a broader one
                const match2 = tag.name.match(/: "([^"]+)"/);
                if (match2 && match2[1]) realName = match2[1];
            }

            if (realName !== tag.name) {
                console.log(`Fixing tag ${tag.id}: "${tag.name}" -> "${realName}"`);
                const realSlug = realName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

                const existingTag = await prisma.libraryTag.findFirst({
                    where: {
                        OR: [
                            { name: realName },
                            { slug: realSlug }
                        ],
                        NOT: { id: tag.id }
                    }
                });

                if (existingTag) {
                    console.log(`Merging ${tag.id} into ${existingTag.id}`);
                    for (const content of tag.contents) {
                        try {
                            await prisma.libraryContent.update({
                                where: { id: content.id },
                                data: {
                                    tags: {
                                        connect: { id: existingTag.id },
                                        disconnect: { id: tag.id }
                                    }
                                }
                            });
                        } catch (e) {
                            // Might already be connected
                        }
                    }
                    await prisma.libraryTag.delete({ where: { id: tag.id } });
                } else {
                    await prisma.libraryTag.update({
                        where: { id: tag.id },
                        data: {
                            name: realName,
                            slug: realSlug
                        }
                    });
                }
            }
        }
        console.log("Aggressive cleanup finished.");
    } catch (error) {
        console.error("Cleanup failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

aggressiveClean();
