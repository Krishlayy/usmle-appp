import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
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

    const body = await req.json();
    // NOTE: any client-sent `isCorrect` is deliberately ignored; grading is server-side.
    const { questionProgressId, selectedOptionId, timeTakenSec, notes, strikethroughs, highlightedQuestionText, highlightedExplanation, isFlagged } = body;

    if (!questionProgressId || typeof questionProgressId !== 'string') {
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

    // The progress row must belong to THIS session and user (prevents writing to other rows).
    const existingProgress = await prisma.userProgress.findFirst({
      where: { id: questionProgressId, testSessionId: params.sessionId, userId: session.user.id },
      select: { timeTakenSec: true, question: { select: { correctAnswer: true, options: true } } }
    });

    if (!existingProgress) {
      return new NextResponse('Progress not found', { status: 404 });
    }

    // Only update timeTakenSec if the new time is strictly greater (prevents race conditions)
    const finalTimeTakenSec = (typeof timeTakenSec === 'number' && Number.isFinite(timeTakenSec) && timeTakenSec > (existingProgress.timeTakenSec || 0))
      ? Math.floor(timeTakenSec)
      : undefined;

    const updateData: Record<string, unknown> = {};
    if (selectedOptionId !== undefined) {
      if (selectedOptionId !== null && !getOptionIds(existingProgress.question.options).includes(selectedOptionId)) {
        return new NextResponse('Invalid option', { status: 400 });
      }
      updateData.selectedAnswer = selectedOptionId;
      updateData.isCorrect = gradeAnswer(existingProgress.question, selectedOptionId);
    }
    if (finalTimeTakenSec !== undefined) updateData.timeTakenSec = finalTimeTakenSec;
    if (notes !== undefined) updateData.notes = notes;
    if (strikethroughs !== undefined) updateData.strikethroughs = strikethroughs;
    if (highlightedQuestionText !== undefined) updateData.highlightedQuestionText = highlightedQuestionText;
    if (highlightedExplanation !== undefined) updateData.highlightedExplanation = highlightedExplanation;
    if (isFlagged !== undefined) updateData.flagged = isFlagged;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: true, ignored: true });
    }

    await prisma.userProgress.update({
      where: { id: questionProgressId },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[AUTOSAVE_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
