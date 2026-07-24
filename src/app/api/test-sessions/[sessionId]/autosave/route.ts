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

    const body = await req.json();
    const { questionProgressId, selectedOptionId, isCorrect, timeTakenSec, notes, strikethroughs, highlightedQuestionText, highlightedExplanation } = body;

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

    const existingProgress = await prisma.userProgress.findUnique({
      where: { id: questionProgressId },
      select: { timeTakenSec: true, selectedAnswer: true }
    });

    if (!existingProgress) {
      return new NextResponse('Progress not found', { status: 404 });
    }

    // Safe merging logic: prevent dormant devices from regressing progress
    const finalTimeTakenSec = (timeTakenSec !== undefined && timeTakenSec > (existingProgress.timeTakenSec || 0))
      ? timeTakenSec
      : undefined;

    const finalSelectedOptionId = (selectedOptionId !== undefined)
      ? (selectedOptionId === null && existingProgress.selectedAnswer !== null ? undefined : selectedOptionId)
      : undefined;

    const finalIsCorrect = finalSelectedOptionId === undefined ? undefined : isCorrect;

    // Auto-save the individual question progress
    await prisma.userProgress.update({
      where: { id: questionProgressId },
      data: {
        ...(finalSelectedOptionId !== undefined && { selectedAnswer: finalSelectedOptionId }),
        ...(finalIsCorrect !== undefined && { isCorrect: finalIsCorrect }),
        ...(finalTimeTakenSec !== undefined && { timeTakenSec: finalTimeTakenSec }),
        ...(notes !== undefined && { notes: notes }),
        ...(strikethroughs !== undefined && { strikethroughs: strikethroughs }),
        ...(highlightedQuestionText !== undefined && { highlightedQuestionText: highlightedQuestionText }),
        ...(highlightedExplanation !== undefined && { highlightedExplanation: highlightedExplanation }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[AUTOSAVE_ERROR]', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
