const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const mapping = {
  'manage_customers': 'Customers',
  'manage_orders': 'Orders',
  'manage_transactions': 'Transactions',
  'manage_products': 'Catalog',
  'manage_settings': 'Settings',
  'manage_store_config': 'Store Configuration',
  'manage_staff': 'User Management',
  'view_dashboard': 'Dashboard',
  'view_reports': 'Analytics'
};

async function rename() {
  console.log("Starting permission renaming...");
  const permissions = await prisma.permission.findMany();
  
  for (const perm of permissions) {
    for (const [oldName, newName] of Object.entries(mapping)) {
      if (perm.name.startsWith(oldName + ':')) {
        const action = perm.name.split(':')[1];
        const newPermName = `${newName}:${action}`;
        
        try {
          await prisma.permission.update({
            where: { id: perm.id },
            data: { name: newPermName }
          });
          console.log(`Renamed ${perm.name} -> ${newPermName}`);
        } catch (e) {
          console.error(`Could not rename ${perm.name}: ${e.message}`);
        }
      }
    }
  }
  console.log("Renaming complete!");
}

rename()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
