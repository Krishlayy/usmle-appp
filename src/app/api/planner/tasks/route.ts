import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { isFeatureEnabled } from '@/lib/featureFlags';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const enabled = await isFeatureEnabled('STUDY_PLANNER');
    if (!enabled) {
      return NextResponse.json({ enabled: false, tasks: [] });
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = { userId: session.user.id };
    if (startDate && endDate) {
      where.scheduledDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const tasks = await prisma.planTask.findMany({
      where,
      orderBy: [{ scheduledDate: 'asc' }, { order: 'asc' }],
    });

    return NextResponse.json({ enabled: true, tasks });
  } catch (error) {
    console.error('[PLANNER_TASKS_GET_ERROR]', error);
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
    const { planId, title, description, scheduledDate, taskType, contentType, contentId } = body;

    if (!title || !scheduledDate) {
      return new NextResponse('Missing title or scheduledDate', { status: 400 });
    }

    let targetPlanId = planId;
    if (!targetPlanId) {
      const activePlan = await prisma.studyPlan.findFirst({
        where: { userId: session.user.id, isActive: true },
      });
      if (activePlan) {
        targetPlanId = activePlan.id;
      } else {
        const newPlan = await prisma.studyPlan.create({
          data: {
            userId: session.user.id,
            title: 'My USMLE Study Schedule',
            targetExamDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          },
        });
        targetPlanId = newPlan.id;
      }
    }

    const task = await prisma.planTask.create({
      data: {
        planId: targetPlanId,
        userId: session.user.id,
        title: String(title).trim(),
        description: description ? String(description).trim() : null,
        scheduledDate: new Date(scheduledDate),
        taskType: taskType || 'CUSTOM',
        contentType: contentType || null,
        contentId: contentId || null,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('[PLANNER_TASKS_POST_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(req: Request) {
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
    const { taskId, isCompleted, title, description, scheduledDate } = body;

    if (!taskId) {
      return new NextResponse('Missing taskId', { status: 400 });
    }

    const task = await prisma.planTask.findFirst({
      where: { id: taskId, userId: session.user.id },
    });

    if (!task) {
      return new NextResponse('Task not found', { status: 404 });
    }

    const updateData: any = {};
    if (isCompleted !== undefined) {
      updateData.isCompleted = Boolean(isCompleted);
      updateData.completedAt = isCompleted ? new Date() : null;
    }
    if (title !== undefined) updateData.title = String(title).trim();
    if (description !== undefined) updateData.description = String(description).trim();
    if (scheduledDate !== undefined) updateData.scheduledDate = new Date(scheduledDate);

    const updated = await prisma.planTask.update({
      where: { id: taskId },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PLANNER_TASKS_PUT_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return new NextResponse('Missing taskId', { status: 400 });
    }

    const task = await prisma.planTask.findFirst({
      where: { id: taskId, userId: session.user.id },
    });

    if (!task) {
      return new NextResponse('Task not found', { status: 404 });
    }

    await prisma.planTask.delete({
      where: { id: taskId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[PLANNER_TASKS_DELETE_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
