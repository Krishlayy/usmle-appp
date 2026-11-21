const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const qbanks = await prisma.qBank.findMany({ 
    select: { 
      id: true, 
      title: true, 
      slug: true, 
      _count: { select: { questions: true } } 
    } 
  });
  console.log("Existing QBanks in DB:", JSON.stringify(qbanks, null, 2));
  const totalQ = await prisma.question.count();
  console.log("Total Questions in DB:", totalQ);
  await prisma.$disconnect();
}

check().catch(console.error);
