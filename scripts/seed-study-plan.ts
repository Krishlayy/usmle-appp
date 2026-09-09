import { prisma } from '../src/lib/db';

async function main() {
  console.log('Seeding Study Plan and Tasks...');

  const user = await prisma.user.findFirst({
    where: { email: 'bhairavksharma0227@gmail.com' }
  }) || await prisma.user.findFirst();

  if (!user) {
    console.error('No user found.');
    return;
  }

  // Deactivate old plans
  await prisma.studyPlan.updateMany({
    where: { userId: user.id },
    data: { isActive: false },
  });

  const targetExamDate = new Date();
  targetExamDate.setDate(targetExamDate.getDate() + 75); // 75 days countdown

  const plan = await prisma.studyPlan.create({
    data: {
      userId: user.id,
      title: 'USMLE Step 1 - Cardiology & High-Yield Systems Mastery',
      targetExamDate,
      dailyGoalQuestions: 40,
      weeklyGoalQuestions: 200,
      isActive: true,
    },
  });

  const today = new Date();
  const tasks = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    d.setHours(9, 0, 0, 0);

    tasks.push({
      planId: plan.id,
      userId: user.id,
      title: 'Cardiology QBank: 30 Question Practice Block',
      description: 'Timed mode with review of cardiovascular hemodynamics and murmurs.',
      scheduledDate: d,
      taskType: 'QUESTION_BLOCK' as const,
      isCompleted: i === 0 ? false : false,
      contentType: 'QBANK_BLOCK',
    });

    tasks.push({
      planId: plan.id,
      userId: user.id,
      title: 'ReadyDecks Spaced Repetition (Due Flashcards)',
      description: 'Review high-yield flashcards scheduled by the SM-2 algorithm.',
      scheduledDate: d,
      taskType: 'FLASHCARD_REVIEW' as const,
      isCompleted: false,
      contentType: 'FLASHCARD_DECK',
    });

    if (i % 2 === 0) {
      tasks.push({
        planId: plan.id,
        userId: user.id,
        title: 'Video Lecture: Systolic vs Diastolic Murmurs',
        description: 'Watch 10-minute masterclass on aortic stenosis and mitral regurgitation.',
        scheduledDate: d,
        taskType: 'VIDEO_LESSON' as const,
        isCompleted: false,
        contentType: 'VIDEO_LESSON',
      });
    } else {
      tasks.push({
        planId: plan.id,
        userId: user.id,
        title: 'Medical Library: Aortic Dissection Stanford Classification',
        description: 'Review acute management protocols and beta-blockade principles.',
        scheduledDate: d,
        taskType: 'READING' as const,
        isCompleted: false,
        contentType: 'LIBRARY_TOPIC',
      });
    }
  }

  await prisma.planTask.createMany({ data: tasks });

  console.log(`Successfully created Study Plan for user ${user.email} with ${tasks.length} tasks.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
