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
    const { questionProgressId, selectedOptionId, isCorrect, timeTakenSec, notes, strikethroughs, highlightedQuestionText, highlightedExplanation, isFlagged } = body;

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

    // Only update timeTakenSec if the new time is strictly greater (prevents race conditions)
    const finalTimeTakenSec = (timeTakenSec !== undefined && timeTakenSec > (existingProgress.timeTakenSec || 0))
      ? timeTakenSec
      : undefined;

    // Build the update payload dynamically to avoid Prisma throwing on empty data
    const updateData: any = {};
    if (selectedOptionId !== undefined) updateData.selectedAnswer = selectedOptionId;
    if (isCorrect !== undefined) updateData.isCorrect = isCorrect;
    if (finalTimeTakenSec !== undefined) updateData.timeTakenSec = finalTimeTakenSec;
    if (notes !== undefined) updateData.notes = notes;
    if (strikethroughs !== undefined) updateData.strikethroughs = strikethroughs;
    if (highlightedQuestionText !== undefined) updateData.highlightedQuestionText = highlightedQuestionText;
    if (highlightedExplanation !== undefined) updateData.highlightedExplanation = highlightedExplanation;
    if (isFlagged !== undefined) updateData.flagged = isFlagged;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: true, ignored: true });
    }

    // Auto-save the individual question progress
    await prisma.userProgress.update({
      where: { id: questionProgressId },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[AUTOSAVE_ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, 
      { status: 500 }
    );
  }
}
