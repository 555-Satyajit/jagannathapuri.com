const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrate() {
  console.log("Starting permission migration...");
  const permissions = await prisma.permission.findMany();
  
  for (const perm of permissions) {
    if (!perm.name.includes(':')) {
      const modName = perm.name;
      const actions = ['Read', 'Create', 'Edit', 'Delete'];
      
      console.log(`Migrating legacy permission: ${modName}`);

      const rolesWithPerm = await prisma.role.findMany({
        where: { permissions: { some: { id: perm.id } } }
      });

      const newPerms = [];
      for (const act of actions) {
        let newP = await prisma.permission.findFirst({ where: { name: `${modName}:${act}` } });
        if (!newP) {
          newP = await prisma.permission.create({ data: { name: `${modName}:${act}` } });
        }
        newPerms.push(newP);
      }

      for (const role of rolesWithPerm) {
        await prisma.role.update({
          where: { id: role.id },
          data: {
            permissions: {
              connect: newPerms.map(p => ({ id: p.id })),
              disconnect: { id: perm.id }
            }
          }
        });
      }

      await prisma.permission.delete({ where: { id: perm.id } });
      console.log(`Successfully migrated ${modName}`);
    }
  }
  console.log('Migration complete!');
}

migrate()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
