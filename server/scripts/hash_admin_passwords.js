const prisma = require('../src/lib/prisma');
const bcrypt = require('bcryptjs');

async function hashPasswords() {
    console.log('Starting password migration...');
    const staffMembers = await prisma.staff.findMany();

    for (const staff of staffMembers) {
        // Simple check: if password doesn't look like a bcrypt hash (starts with $2a$ or similar), hash it.
        // Bcrypt hashes are 60 chars long and start with $2
        if (staff.password && !staff.password.startsWith('$2')) {
            console.log(`Hashing password for user: ${staff.username} (${staff.email})`);
            const hashedPassword = await bcrypt.hash(staff.password, 10);
            await prisma.staff.update({
                where: { id: staff.id },
                data: { password: hashedPassword }
            });
            console.log(`Updated.`);
        } else {
            console.log(`Skipping already hashed password for user: ${staff.username}`);
        }
    }

    console.log('Migration complete.');
    process.exit(0);
}

hashPasswords().catch(e => {
    console.error(e);
    process.exit(1);
});
