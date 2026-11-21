import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { TestPlayer } from '@/components/TestPlayer';
import { TestSecurityOverlay } from '@/components/TestSecurityOverlay';
import { headers } from 'next/headers';

export default async function TestSessionPage(
  props: { params: Promise<{ qbankSlug: string, sessionId: string }>, searchParams: Promise<{ mode?: string, item?: string }> }
) {
  const searchParams = await props.searchParams;
  const params = await props.params;
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

  const isReviewMode = searchParams.mode === 'review';

  if (testSession.status === 'completed' && !isReviewMode) {
    redirect(`/dashboard/${params.qbankSlug}/session/${testSession.id}/results`);
  }

  // Derive real block number: count how many sessions this user has started for this qbank
  const blockNumber = await prisma.testSession.count({
    where: { userId: session.user.id, qbankId: testSession.qbankId },
  });

  const mappedSession = {
    id: testSession.id,
    qbankSlug: params.qbankSlug,
    mode: testSession.mode as 'timed' | 'tutor',
    durationSec: testSession.durationSec,
    blockNumber,
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
        videoUrl: p.question.videoUrl || null,
        media: p.question.media,
        options: (p.question.options as { id: string; text: string; isCorrect?: boolean; isYellowDistractor?: boolean; explanation?: string | null }[]).map(opt => ({
          ...opt,
          isCorrect: opt.id === p.question.correctAnswer || Boolean(opt.isCorrect),
          isYellowDistractor: Boolean(opt.isYellowDistractor),
          explanation: opt.explanation || null,
        })),
      },
      isFlagged: p.flagged,
      selectedOptionId: p.selectedAnswer,
      isCorrect: p.isCorrect,
      timeTakenSec: p.timeTakenSec || 0,
      notes: p.notes || null,
      strikethroughs: p.strikethroughs || [],
      highlightedQuestionText: p.highlightedQuestionText || undefined,
      highlightedExplanation: p.highlightedExplanation || undefined,
    })),
  };

  const initialIndex = searchParams.item ? parseInt(searchParams.item, 10) : 0;
  
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'Unknown IP';
  const email = session.user.email || 'Unknown Email';

  return (
    <TestSecurityOverlay userEmail={email} userIp={ip}>
      <TestPlayer session={mappedSession} initialIndex={!isNaN(initialIndex) ? initialIndex : 0} userEmail={email} userIp={ip} />
    </TestSecurityOverlay>
  );
}
