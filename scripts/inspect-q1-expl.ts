import 'dotenv/config';
import { prisma } from '../src/lib/db';

async function check() {
  const q1 = await prisma.question.findFirst({ where: { qid: 'HIST-001' } });
  console.log('q1 explanation length:', q1?.explanation?.length);
  console.log('q1 explanation preview:');
  console.log(q1?.explanation?.slice(0, 800));
}

check().then(() => prisma.$disconnect());
