import dotenv from 'dotenv';
dotenv.config();

import { prisma } from '../src/lib/db';

async function main() {
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@medico.com' }
  });

  if (!admin) {
    console.error('Admin not found');
    return;
  }

  const qbank = await prisma.qBank.findUnique({
    where: { slug: 'autoimmune-diseases' },
    include: { questions: true }
  });

  if (!qbank) {
    console.error('QBank not found');
    return;
  }

  console.log(`QBank: ${qbank.title}, Questions in DB: ${qbank.questions.length}`);

  // Create a test session
  const testSession = await prisma.testSession.create({
    data: {
      userId: admin.id,
      qbankId: qbank.id,
      mode: 'tutor',
      status: 'in_progress',
      durationSec: null
    }
  });

  console.log(`Created TestSession ID: ${testSession.id}`);

  // Create progress entries for all questions
  await prisma.userProgress.createMany({
    data: qbank.questions.map(q => ({
      userId: admin.id,
      qbankId: qbank.id,
      questionId: q.id,
      testSessionId: testSession.id,
      flagged: false
    })),
    skipDuplicates: true
  });

  // Verify retrieval as page would do
  const loaded = await prisma.testSession.findUnique({
    where: { id: testSession.id },
    include: {
      progress: {
        include: {
          question: {
            include: {
              media: { orderBy: { order: 'asc' } }
            }
          }
        },
        orderBy: { id: 'asc' }
      }
    }
  });

  console.log(`Verified Loaded Session! Progress count: ${loaded?.progress.length}`);
  if (loaded && loaded.progress.length > 0) {
    const q1 = loaded.progress[0].question;
    console.log(`Q1 QID: ${q1.qid}, Subtopic: ${q1.subtopic}`);
    console.log(`Q1 VideoUrl: ${q1.videoUrl}`);
    console.log(`Q1 Options Count: ${(q1.options as any[]).length}`);
    console.log(`Test URL: http://localhost:3000/dashboard/autoimmune-diseases/test/${testSession.id}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
