const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 

async function clean() { 
    const addresses = await prisma.address.findMany(); 
    const seen = new Set(); 
    for (const addr of addresses) { 
        const key = addr.customer_id + '-' + addr.addressLine1 + '-' + addr.city + '-' + addr.zipCode; 
        if (seen.has(key)) { 
            await prisma.address.delete({ where: { id: addr.id } }); 
            console.log('Deleted duplicate address', addr.id); 
        } else { 
            seen.add(key); 
        } 
    } 
    console.log('Done cleaning addresses'); 
} 
clean();
