import 'dotenv/config';
import { prisma } from '../src/lib/db';

async function checkAll() {
  const qs = await prisma.question.findMany({
    orderBy: { qid: 'asc' },
    select: {
      qid: true,
      subtopic: true,
      questionText: true,
      explanation: true,
      correctAnswer: true,
      options: true,
      media: true,
      explanationImages: true
    }
  });

  console.log('Total questions checked:', qs.length);
  for (const q of qs) {
    const explLen = q.explanation ? q.explanation.length : 0;
    const textLen = q.questionText ? q.questionText.length : 0;
    const optCount = Array.isArray(q.options) ? (q.options as any[]).length : 0;
    const hasWhy = q.explanation ? q.explanation.includes('Why each option is right or wrong') : false;
    const hasPearl = q.explanation ? q.explanation.includes('Clinical pearl') : false;
    console.log(`${q.qid}: len=${explLen}, why=${hasWhy}, pearl=${hasPearl}, imgs=${q.explanationImages.length}, exhibits=${q.media.length}`);
    if (explLen < 200 || optCount !== 5 || !q.correctAnswer) {
      console.log('ANOMALY in ' + q.qid + ': explLen=' + explLen + ', optCount=' + optCount + ', ans=' + q.correctAnswer);
    }
  }
}

checkAll().then(() => prisma.$disconnect());
