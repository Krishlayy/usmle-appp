import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { isFeatureEnabled } from '@/lib/featureFlags';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const enabled = await isFeatureEnabled('VIDEO_LEARNING');
    if (!enabled) {
      return new NextResponse('Video Learning Hub is disabled', { status: 403 });
    }

    const body = await req.json();
    const { lessonId, positionSec, percentComplete, isCompleted } = body;

    if (!lessonId) {
      return new NextResponse('Missing lessonId', { status: 400 });
    }

    const pos = Math.max(0, Math.round(Number(positionSec) || 0));
    const pct = Math.min(100, Math.max(0, Number(percentComplete) || 0));
    const completed = Boolean(isCompleted || pct >= 90);

    const progress = await prisma.courseVideoProgress.upsert({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId: String(lessonId),
        },
      },
      update: {
        positionSec: pos,
        percentComplete: pct,
        isCompleted: completed,
        completedAt: completed ? new Date() : undefined,
      },
      create: {
        userId: session.user.id,
        lessonId: String(lessonId),
        positionSec: pos,
        percentComplete: pct,
        isCompleted: completed,
        completedAt: completed ? new Date() : null,
      },
    });

    // Cross-feature sync: If lesson is completed, sync with Study Planner tasks
    if (completed) {
      const lesson = await prisma.courseLesson.findUnique({
        where: { id: lessonId },
        select: { title: true, relatedTopic: true },
      });

      if (lesson) {
        // Find matching incomplete study plan tasks
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        await prisma.planTask.updateMany({
          where: {
            userId: session.user.id,
            isCompleted: false,
            taskType: 'VIDEO_LESSON',
            OR: [
              { title: { contains: lesson.title, mode: 'insensitive' as const } },
              ...(lesson.relatedTopic
                ? [{ title: { contains: lesson.relatedTopic, mode: 'insensitive' as const } }]
                : []),
            ],
          },
          data: {
            isCompleted: true,
            completedAt: new Date(),
          },
        });
      }
    }

    return NextResponse.json(progress);
  } catch (error) {
    console.error('[VIDEO_PROGRESS_POST_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const lessonId = searchParams.get('lessonId');

    if (lessonId) {
      const progress = await prisma.courseVideoProgress.findUnique({
        where: {
          userId_lessonId: {
            userId: session.user.id,
            lessonId,
          },
        },
      });
      return NextResponse.json(progress || { positionSec: 0, percentComplete: 0, isCompleted: false });
    }

    const allProgress = await prisma.courseVideoProgress.findMany({
      where: { userId: session.user.id },
    });
    return NextResponse.json(allProgress);
  } catch (error) {
    console.error('[VIDEO_PROGRESS_GET_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
