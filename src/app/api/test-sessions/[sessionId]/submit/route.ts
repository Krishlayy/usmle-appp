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

    // Batch all updates into a sequential loop to prevent deadlocks with pending autosaves
    // We catch individual errors so that a single failed update (e.g. lock timeout) doesn't crash the submission
    for (const q of questions) {
      try {
        await prisma.userProgress.update({
          where: { id: q.id },
          data: {
            selectedAnswer: q.selectedOptionId ?? null,
            isCorrect: q.isCorrect ?? null,
            flagged: q.isFlagged ?? false,
            timeTakenSec: q.timeTakenSec ?? 0,
          },
        });
      } catch (err) {
        console.warn(`Failed to update UserProgress ${q.id} during submit:`, err);
      }
    }

    // Mark session as completed
    await prisma.testSession.update({
      where: { id: params.sessionId },
      data: { status: 'completed' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[TEST_SESSION_SUBMIT_ERROR]', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
