import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { gradeAnswer, getOptionIds } from '@/lib/grading';

type StoredOption = {
  id: string;
  isCorrect?: boolean;
  isYellowDistractor?: boolean;
  explanation?: string | null;
};

/**
 * Tutor-mode reveal. Persists the student's answer, then returns the answer key
 * for that ONE question. Timed sessions never reveal until completed.
 */
export async function POST(req: Request, props: { params: Promise<{ sessionId: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { questionProgressId, selectedOptionId } = await req.json();
    if (typeof questionProgressId !== 'string' || typeof selectedOptionId !== 'string') {
      return new NextResponse('Invalid request', { status: 400 });
    }

    const testSession = await prisma.testSession.findUnique({
      where: { id: params.sessionId },
      select: { userId: true, mode: true, status: true },
    });
    if (!testSession || testSession.userId !== session.user.id) {
      return new NextResponse('Not found', { status: 404 });
    }
    if (testSession.mode !== 'tutor' && testSession.status !== 'completed') {
      return new NextResponse('Answers are hidden until the block is finished', { status: 403 });
    }

    const progress = await prisma.userProgress.findFirst({
      where: { id: questionProgressId, testSessionId: params.sessionId, userId: session.user.id },
      select: {
        question: {
          select: { correctAnswer: true, options: true, explanation: true, videoUrl: true },
        },
      },
    });
    if (!progress) {
      return new NextResponse('Progress not found', { status: 404 });
    }

    const { question } = progress;
    if (!getOptionIds(question.options).includes(selectedOptionId)) {
      return new NextResponse('Invalid option', { status: 400 });
    }

    const isCorrect = gradeAnswer(question, selectedOptionId);

    if (testSession.status !== 'completed') {
      await prisma.userProgress.update({
        where: { id: questionProgressId },
        data: { selectedAnswer: selectedOptionId, isCorrect },
      });
    }

    return NextResponse.json({
      isCorrect,
      explanation: question.explanation,
      videoUrl: question.videoUrl || null,
      options: (question.options as StoredOption[]).map(o => ({
        id: o.id,
        isCorrect: o.id === question.correctAnswer || Boolean(o.isCorrect),
        isYellowDistractor: Boolean(o.isYellowDistractor),
        explanation: o.explanation || null,
      })),
    });
  } catch (error) {
    console.error('[TEST_SESSION_REVEAL_ERROR]', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
