const http = require('http');
// const FormData = require('form-data');

const prisma = require('./server/src/lib/prisma');

async function checkCategory() {
  const c = await prisma.category.findUnique({ where: { id: 30 } });
  console.log(c);
}
checkCategory();
