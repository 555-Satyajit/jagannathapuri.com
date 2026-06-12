const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  await prisma.siteConfig.upsert({
    where: { key: 'featured_sale_end_date' },
    update: { value: d.toISOString() },
    create: { key: 'featured_sale_end_date', value: d.toISOString() }
  });
  console.log('Added featured_sale_end_date to SiteConfig');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
