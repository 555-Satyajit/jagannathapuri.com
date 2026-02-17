const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanTags() {
    try {
        console.log("Starting tag cleanup...");
        const tags = await prisma.libraryTag.findMany({
            include: { contents: true }
        });

        for (const tag of tags) {
            let realName = tag.name;
            try {
                // Check if name is JSON
                if (tag.name.startsWith('[') && tag.name.includes('"value"')) {
                    const parsed = JSON.parse(tag.name);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        realName = parsed[0].value;
                    }
                }
            } catch (e) {
                // Not JSON, skip
            }

            if (realName !== tag.name) {
                console.log(`Garbage tag found: "${tag.name}" -> intended: "${realName}"`);
                const realSlug = realName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

                // Check if a healthy tag with this name already exists
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
                    console.log(`Healthy tag exists with ID ${existingTag.id}. Merging...`);
                    // Connect contents to the existing tag
                    for (const content of tag.contents) {
                        await prisma.libraryContent.update({
                            where: { id: content.id },
                            data: {
                                tags: {
                                    connect: { id: existingTag.id },
                                    disconnect: { id: tag.id }
                                }
                            }
                        });
                    }
                    // Delete the garbage tag
                    await prisma.libraryTag.delete({ where: { id: tag.id } });
                    console.log(`Deleted garbage tag ${tag.id}`);
                } else {
                    console.log(`No healthy tag found. Updating garbage tag ${tag.id} to "${realName}"`);
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
        console.log("Cleanup finished.");
    } catch (error) {
        console.error("Cleanup failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

cleanTags();
