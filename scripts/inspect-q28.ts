import 'dotenv/config';
import { prisma } from '../src/lib/db';

async function checkQ28() {
  const q28 = await prisma.question.findFirst({ where: { qid: 'HIST-028' } });
  console.log('Q28 explanation length:', q28?.explanation?.length);
  console.log('Q28 last 600 chars of explanation:');
  console.log(q28?.explanation?.slice(-600));
}

checkQ28().then(() => prisma.$disconnect());
