const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Find a qbank
  const qbank = await prisma.qBank.findFirst({ where: { qbankCode: 'CARD' } });
  if (!qbank) {
    console.error('No qbank found');
    return;
  }
  console.log(`Starting counter: ${qbank.questionCounter}`);

  const createQuestion = async (i) => {
    return prisma.$transaction(async (tx) => {
      const qb = await tx.qBank.update({
        where: { id: qbank.id },
        data: { questionCounter: { increment: 1 } },
        select: { qbankCode: true, questionCounter: true },
      });

      const qid = `${qb.qbankCode}-${qb.questionCounter}`;

      return tx.question.create({
        data: {
          qid,
          qbankId: qbank.id,
          questionText: `Test question ${i}`,
          options: JSON.stringify([{ id: 'A', text: 'A' }, { id: 'B', text: 'B' }]),
          correctAnswer: 'A',
          difficulty: 'medium',
          explanation: 'test explanation',
        }
      });
    });
  };

  // Run 10 concurrent requests
  console.log('Running 10 concurrent creations...');
  const promises = Array.from({ length: 10 }).map((_, i) => createQuestion(i));
  const results = await Promise.all(promises);

  const qids = results.map(r => r.qid).sort();
  console.log('Generated QIDs:', qids);

  const uniqueQids = new Set(qids);
  if (uniqueQids.size !== qids.length) {
    console.error('FAIL: Duplicate QIDs found!');
  } else {
    console.log('SUCCESS: All QIDs are unique.');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
