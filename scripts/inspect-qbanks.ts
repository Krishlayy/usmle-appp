import 'dotenv/config';
import { prisma } from '../src/lib/db';

async function check() {
  const qbanks = await prisma.qBank.findMany({ 
    select: { 
      id: true, 
      title: true, 
      slug: true, 
      qbankCode: true,
      totalQuestions: true,
      _count: { select: { questions: true } } 
    } 
  });
  console.log("Existing QBanks in DB:\n", JSON.stringify(qbanks, null, 2));
  const totalQ = await prisma.question.count();
  console.log("Total Questions in DB:", totalQ);
}

check()
  .catch(console.error)
  .finally(() => process.exit(0));
