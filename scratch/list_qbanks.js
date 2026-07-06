const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const qbanks = await prisma.qBank.findMany();
  console.log(qbanks);
}
main().catch(console.error).finally(() => prisma.$disconnect());
