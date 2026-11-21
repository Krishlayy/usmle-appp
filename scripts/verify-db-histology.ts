import 'dotenv/config';
import { prisma } from '../src/lib/db';

async function verify() {
  const qbanks = await prisma.qBank.findMany({
    include: {
      _count: {
        select: { questions: true }
      }
    }
  });

  console.log('=== QBanks in DB ===');
  console.log(JSON.stringify(qbanks, null, 2));

  const totalQuestions = await prisma.question.count();
  console.log(`Total questions in DB: ${totalQuestions}`);

  const q1 = await prisma.question.findFirst({
    where: { qid: 'HIST-001' },
    include: {
      media: true,
      explanationImages: true
    }
  });

  console.log('\n=== Question 1 (HIST-001) Details ===');
  console.log(`Title: ${q1?.subtopic}`);
  console.log(`Correct Answer: ${q1?.correctAnswer}`);
  console.log(`Video URL: ${q1?.videoUrl}`);
  console.log(`Exhibits in Media: ${q1?.media.length}`);
  q1?.media.forEach(m => console.log(`  - Media Exhibit: [${m.type}] ${m.url} (${m.caption})`));
  console.log(`Explanation Images: ${q1?.explanationImages.length}`);
  q1?.explanationImages.forEach(img => console.log(`  - Figure: ${img.url} (${img.caption})`));
  console.log(`Options count: ${(q1?.options as any[])?.length}`);
  console.log('Options:', JSON.stringify(q1?.options, null, 2));

  const questionsWithMedia = await prisma.question.count({
    where: { media: { some: {} } }
  });
  const questionsWithVideo = await prisma.question.count({
    where: { videoUrl: { not: null } }
  });

  console.log(`\nQuestions with Clinical Exhibits: ${questionsWithMedia}`);
  console.log(`Questions with Video Mnemonics: ${questionsWithVideo}`);
}

verify()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
