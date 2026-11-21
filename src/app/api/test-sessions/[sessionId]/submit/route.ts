import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { testSubmitRateLimiter } from '@/lib/redis';
import { gradeAnswer, getOptionIds } from '@/lib/grading';

export async function POST(req: Request, props: { params: Promise<{ sessionId: string }> }) {
  const params = await props.params;
  try {
    if (params.sessionId.startsWith('usmle-exam-')) {
      return NextResponse.json({ success: true, mock: true });
    }

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
      include: {
        progress: {
          select: { id: true, question: { select: { correctAnswer: true, options: true } } },
        },
      },
    });

    if (!testSession || testSession.userId !== session.user.id) {
      return new NextResponse('Not found', { status: 404 });
    }

    if (testSession.status === 'completed') {
      return new NextResponse('Session already completed', { status: 400 });
    }

    // Only rows that belong to this session are writable; correctness is computed here,
    // never taken from the client.
    const rows = new Map(testSession.progress.map(p => [p.id, p.question]));

    const saveResults = await Promise.allSettled(
      questions
        .filter((q: any) => q && typeof q.id === 'string' && rows.has(q.id))
        .map((q: any) => {
          const question = rows.get(q.id)!;
          const selected =
            typeof q.selectedOptionId === 'string' && getOptionIds(question.options).includes(q.selectedOptionId)
              ? q.selectedOptionId
              : null;
          const time = Number.isFinite(q.timeTakenSec) ? Math.max(0, Math.floor(q.timeTakenSec)) : 0;
          return prisma.userProgress.update({
            where: { id: q.id },
            data: {
              selectedAnswer: selected,
              isCorrect: gradeAnswer(question, selected),
              flagged: Boolean(q.isFlagged),
              timeTakenSec: time,
            },
          });
        })
    );

    const failedCount = saveResults.filter(r => r.status === 'rejected').length;
    if (failedCount > 0) {
      console.warn(`[SUBMIT] ${failedCount} progress rows failed to save for session ${params.sessionId}`);
    }

    await prisma.testSession.update({
      where: { id: params.sessionId },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, ...(failedCount > 0 && { partialFailure: true }) });
  } catch (error) {
    console.error('[TEST_SESSION_SUBMIT_ERROR]', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
