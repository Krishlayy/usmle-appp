import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { testSubmitRateLimiter } from '@/lib/redis';

export async function POST(req: Request, props: { params: Promise<{ sessionId: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Rate Limiting: 10 requests per 10s per user
    try {
      const { success } = await testSubmitRateLimiter.limit(session.user.id);
      if (!success) {
        return new NextResponse('Too Many Requests', { status: 429 });
      }
    } catch (e) {
      console.warn('Rate limiter unreachable, bypassing', e);
    }

    const { questions } = await req.json();

    if (!questions || !Array.isArray(questions)) {
      return new NextResponse('Invalid request', { status: 400 });
    }

    const testSession = await prisma.testSession.findUnique({
      where: { id: params.sessionId },
    });

    if (!testSession || testSession.userId !== session.user.id) {
      return new NextResponse('Not found', { status: 404 });
    }

    if (testSession.status === 'completed') {
      return new NextResponse('Session already completed', { status: 400 });
    }

    // Update all TestSessionQuestion records
    // Also, we need to log to UserProgress to maintain global history

    // Save all question progress in parallel for speed.
    // Use allSettled so a single DB failure doesn't block all other saves.
    const saveResults = await Promise.allSettled(
      questions.map((q: any) =>
        prisma.userProgress.update({
          where: { id: q.id },
          data: {
            selectedAnswer: q.selectedOptionId ?? null,
            isCorrect: q.isCorrect ?? null,
            flagged: q.isFlagged ?? false,
            timeTakenSec: q.timeTakenSec ?? 0,
          },
        })
      )
    );

    // Track which questions failed to save (for client-side warning)
    const failedIds: string[] = [];
    saveResults.forEach((result, i) => {
      if (result.status === 'rejected') {
        failedIds.push(questions[i].id);
        console.warn(`[SUBMIT] Failed to save UserProgress ${questions[i].id}:`, result.reason);
      }
    });

    // Mark session as completed — include completedAt timestamp
    await prisma.testSession.update({
      where: { id: params.sessionId },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    });

    // Cross-feature sync: mark today's QUESTION_BLOCK study plan tasks as completed
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    prisma.planTask.updateMany({
      where: {
        userId: session.user.id,
        isCompleted: false,
        taskType: 'QUESTION_BLOCK',
        scheduledDate: { gte: startOfToday, lte: endOfToday },
      },
      data: {
        isCompleted: true,
        completedAt: new Date(),
      },
    }).catch(e => console.warn('Could not sync study plan on test submit:', e));

    return NextResponse.json({
      success: true,
      ...(failedIds.length > 0 && { partialFailure: true, failedIds }),
    });
  } catch (error) {
    console.error('[TEST_SESSION_SUBMIT_ERROR]', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
