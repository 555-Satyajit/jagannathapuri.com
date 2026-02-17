const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Starting safe migration (raw SQL)...');

    try {
        // 1. Add regular_price
        await prisma.$executeRawUnsafe(`
      ALTER TABLE "Product" 
      ADD COLUMN IF NOT EXISTS "regular_price" DOUBLE PRECISION;
    `);
        console.log('Added regular_price column.');

        // 2. Add sale_price
        await prisma.$executeRawUnsafe(`
      ALTER TABLE "Product" 
      ADD COLUMN IF NOT EXISTS "sale_price" DOUBLE PRECISION;
    `);
        console.log('Added sale_price column.');

        // 3. Add on_sale
        await prisma.$executeRawUnsafe(`
      ALTER TABLE "Product" 
      ADD COLUMN IF NOT EXISTS "on_sale" BOOLEAN DEFAULT FALSE;
    `);
        console.log('Added on_sale column.');

        console.log('Safe migration completed successfully.');
    } catch (err) {
        console.error('Safe migration failed:', err);
        process.exit(1);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
