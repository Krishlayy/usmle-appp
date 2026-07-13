import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: Request, props: { params: Promise<{ sessionId: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
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

    for (const q of questions) {
      await prisma.userProgress.update({
        where: { id: q.id },
        data: {
          selectedAnswer: q.selectedOptionId,
          isCorrect: q.isCorrect,
          flagged: q.isFlagged,
          timeTakenSec: q.timeTakenSec,
        },
      });
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
