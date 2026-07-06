import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { TestPlayer } from '@/components/TestPlayer';

export default async function TestSessionPage({ params }: { params: { qbankSlug: string, sessionId: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    redirect('/login');
  }

  const testSession = await prisma.testSession.findUnique({
    where: {
      id: params.sessionId,
    },
    include: {
      progress: {
        include: {
          question: {
            include: {
              media: {
                orderBy: { order: 'asc' }
              }
            }
          },
        },
        orderBy: {
          id: 'asc',
        },
      },
    },
  });

  if (!testSession || testSession.userId !== session.user.id) {
    notFound();
  }

  if (testSession.status === 'completed') {
    redirect(`/dashboard/session/${testSession.id}/results`);
  }

  const mappedSession = {
    id: testSession.id,
    mode: testSession.mode,
    durationSec: testSession.durationSec,
    questions: testSession.progress.map((p, index) => ({
      id: p.id,
      order: index,
      question: {
        id: p.question.id,
        qid: p.question.qid,
        questionText: p.question.questionText,
        explanation: p.question.explanation,
        acceptableAnswers: p.question.acceptableAnswers,
        tags: p.question.tags,
        media: p.question.media,
        options: (p.question.options as { id: string; text: string; isCorrect?: boolean; explanation?: string | null }[]).map(opt => ({
          ...opt,
          isCorrect: opt.id === p.question.correctAnswer,
          explanation: opt.explanation || null,
        })),
      },
      isFlagged: p.flagged,
      selectedOptionId: p.selectedAnswer,
      isCorrect: p.isCorrect,
      timeTakenSec: p.timeTakenSec || 0,
    })),
  };

  return <TestPlayer session={mappedSession} />;
}
