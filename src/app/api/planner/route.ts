import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { isFeatureEnabled } from '@/lib/featureFlags';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const enabled = await isFeatureEnabled('STUDY_PLANNER');
    if (!enabled) {
      return NextResponse.json({
        enabled: false,
        plan: null,
      });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userId = session.user.id;

    // Fetch active plan
    let plan = await prisma.studyPlan.findFirst({
      where: { userId, isActive: true },
      include: {
        tasks: {
          orderBy: [{ scheduledDate: 'asc' }, { order: 'asc' }],
        },
      },
    });

    if (!plan) {
      return NextResponse.json({
        enabled: true,
        plan: null,
      });
    }

    // Calculate today's start and end
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // Calculate start of current week (Monday)
    const dayOfWeek = now.getDay() || 7; // Sunday is 7
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfToday.getDate() - (dayOfWeek - 1));

    // Calculate questions attempted today and this week
    const [todayAttempts, weekAttempts] = await Promise.all([
      prisma.userProgress.count({
        where: {
          userId,
          attemptedAt: { gte: startOfToday, lte: endOfToday },
        },
      }),
      prisma.userProgress.count({
        where: {
          userId,
          attemptedAt: { gte: startOfWeek },
        },
      }),
    ]);

    // Tasks due today
    const todayTasks = plan.tasks.filter((t) => {
      const d = new Date(t.scheduledDate);
      return d >= startOfToday && d <= endOfToday;
    });

    const daysRemaining = plan.targetExamDate
      ? Math.max(0, Math.ceil((new Date(plan.targetExamDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : null;

    return NextResponse.json({
      enabled: true,
      plan: {
        ...plan,
        daysRemaining,
        todayAttempts,
        weekAttempts,
        todayTasksCount: todayTasks.length,
        todayCompletedTasksCount: todayTasks.filter((t) => t.isCompleted).length,
      },
    });
  } catch (error) {
    console.error('[PLANNER_GET_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const enabled = await isFeatureEnabled('STUDY_PLANNER');
    if (!enabled) {
      return new NextResponse('Study Planner is disabled', { status: 403 });
    }

    const body = await req.json();
    const { title, targetExamDate, dailyGoalQuestions, weeklyGoalQuestions } = body;

    const userId = session.user.id;

    // Deactivate previous plans
    await prisma.studyPlan.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });

    const defaultExamDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    const examDate = targetExamDate ? new Date(targetExamDate) : defaultExamDate;
    const dailyGoal = Math.max(10, Math.min(200, Number(dailyGoalQuestions) || 40));
    const weeklyGoal = Math.max(50, Math.min(1000, Number(weeklyGoalQuestions) || dailyGoal * 5));

    // Create new active plan
    const plan = await prisma.studyPlan.create({
      data: {
        userId,
        title: title ? String(title).trim() : 'USMLE Step 1 Comprehensive Prep',
        targetExamDate: examDate,
        dailyGoalQuestions: dailyGoal,
        weeklyGoalQuestions: weeklyGoal,
        isActive: true,
      },
    });

    // Generate initial structured template tasks for the next 7 days
    const today = new Date();
    const taskTemplates = [];

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const scheduledDate = new Date(today);
      scheduledDate.setDate(today.getDate() + dayOffset);
      scheduledDate.setHours(9, 0, 0, 0);

      // Task 1: QBank Practice Block
      taskTemplates.push({
        planId: plan.id,
        userId,
        title: `Cardiology QBank: ${Math.round(dailyGoal * 0.7)} Question Timed Block`,
        description: 'Complete timed block with thorough review of incorrect answer explanations.',
        scheduledDate,
        taskType: 'QUESTION_BLOCK' as const,
        contentType: 'QBANK_BLOCK',
        order: 1,
      });

      // Task 2: ReadyDecks Spaced Repetition Review
      taskTemplates.push({
        planId: plan.id,
        userId,
        title: 'Review Due Flashcards (SM-2 Spaced Repetition)',
        description: 'Clear due queue in ReadyDecks for high-yield retention.',
        scheduledDate,
        taskType: 'FLASHCARD_REVIEW' as const,
        contentType: 'FLASHCARD_DECK',
        order: 2,
      });

      // Task 3: Video Lecture or Library Reading (alternating)
      if (dayOffset % 2 === 0) {
        taskTemplates.push({
          planId: plan.id,
          userId,
          title: 'Cardiovascular Pathology: Aortic Stenosis & Murmurs Video Lecture',
          description: 'Watch video module and review dynamic auscultation waveforms.',
          scheduledDate,
          taskType: 'VIDEO_LESSON' as const,
          contentType: 'VIDEO_LESSON',
          order: 3,
        });
      } else {
        taskTemplates.push({
          planId: plan.id,
          userId,
          title: 'High-Yield Medical Library: Infective Endocarditis & Duke Criteria',
          description: 'Read disease overview and memorize hallmark physical exam findings.',
          scheduledDate,
          taskType: 'READING' as const,
          contentType: 'LIBRARY_TOPIC',
          order: 3,
        });
      }
    }

    await prisma.planTask.createMany({
      data: taskTemplates,
    });

    const fullPlan = await prisma.studyPlan.findUnique({
      where: { id: plan.id },
      include: { tasks: { orderBy: { scheduledDate: 'asc' } } },
    });

    return NextResponse.json(fullPlan, { status: 201 });
  } catch (error) {
    console.error('[PLANNER_POST_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
