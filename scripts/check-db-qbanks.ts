import dotenv from 'dotenv';
dotenv.config();

import { prisma } from '../src/lib/db';

async function main() {
  const qbanks = await prisma.qBank.findMany({
    include: { _count: { select: { questions: true } } }
  });
  console.log('QBANKS in DB:');
  for (const q of qbanks) {
    console.log(`[${q.qbankCode}] "${q.title}" (slug: ${q.slug}) -> Questions: ${q._count.questions}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
