import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const qbanks = await prisma.qBank.findMany({
    include: { questions: { orderBy: { createdAt: 'asc' } } }
  });

  for (const qbank of qbanks) {
    let qbankCode = qbank.qbankCode;
    if (!qbankCode) {
      qbankCode = qbank.slug.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase();
      // Ensure uniqueness just in case
      let uniqueCode = qbankCode;
      let counter = 1;
      while (true) {
        const existing = await prisma.qBank.findFirst({ where: { qbankCode: uniqueCode, id: { not: qbank.id } } });
        if (!existing) break;
        uniqueCode = `${qbankCode}${counter}`;
        counter++;
      }
      qbankCode = uniqueCode;
    }

    let questionCounter = 0;
    for (const question of qbank.questions) {
      if (!question.qid) {
        questionCounter++;
        await prisma.question.update({
          where: { id: question.id },
          data: { qid: `${qbankCode}-${questionCounter}` }
        });
      }
    }

    await prisma.qBank.update({
      where: { id: qbank.id },
      data: { qbankCode, questionCounter: Math.max(qbank.questionCounter, questionCounter) }
    });
    
    console.log(`Migrated QBank: ${qbank.title} (${qbankCode}) with ${questionCounter} new QIDs.`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
