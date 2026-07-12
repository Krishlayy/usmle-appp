import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: Request, { params }: { params: { sessionId: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { questionProgressId, selectedOptionId, isCorrect, timeTakenSec, notes } = body;

    if (!questionProgressId) {
      return new NextResponse('Invalid request', { status: 400 });
    }

    const testSession = await prisma.testSession.findUnique({
      where: { id: params.sessionId },
      select: { userId: true, status: true }
    });

    if (!testSession || testSession.userId !== session.user.id) {
      return new NextResponse('Not found', { status: 404 });
    }

    if (testSession.status === 'completed') {
      return new NextResponse('Session already completed', { status: 400 });
    }

    // Auto-save the individual question progress
    await prisma.userProgress.update({
      where: { id: questionProgressId },
      data: {
        ...(selectedOptionId !== undefined && { selectedAnswer: selectedOptionId }),
        ...(isCorrect !== undefined && { isCorrect: isCorrect }),
        ...(timeTakenSec !== undefined && { timeTakenSec: timeTakenSec }),
        ...(notes !== undefined && { notes: notes }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[AUTOSAVE_ERROR]', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
