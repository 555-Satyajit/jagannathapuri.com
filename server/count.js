const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.visitorLog.count();
  console.log('VisitorLog Count:', count);
}
main().finally(() => prisma.$disconnect());
