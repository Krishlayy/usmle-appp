import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { verifyQbankAccess } from '@/lib/verifyQbankAccess';
import { TestPlayer, TestSession } from '@/components/TestPlayer';
import { TestSecurityOverlay } from '@/components/TestSecurityOverlay';
import { parseOptions } from '@/lib/grading';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function SimulatorTestPlayerPage(props: {
  searchParams: Promise<{ mode?: string; theme?: string; qbank?: string; count?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    redirect('/login?callbackUrl=/simulator');
  }

  const searchParams = await props.searchParams;
  const requestedMode = (
    searchParams.mode === 'timed' 
      ? 'timed' 
      : searchParams.mode === 'review' 
        ? 'review' 
        : 'tutor'
  ) as 'timed' | 'tutor' | 'review';
  const requestedSlug = searchParams.qbank || 'approach-to-histology';
  const questionCount = parseInt(searchParams.count || '50', 10);

  const qbank = await prisma.qBank.findFirst({
    where: { slug: requestedSlug, isActive: true },
    include: {
      questions: {
        take: questionCount,
        orderBy: { qid: 'asc' },
        include: {
          media: {
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  });

  if (!qbank) {
    notFound();
  }

  // Strict enterprise check: user must own this QBank to access questions
  try {
    await verifyQbankAccess(session.user.id, qbank.id);
  } catch {
    redirect(`/qbanks/${qbank.slug}?locked=1`);
  }

  const questions = qbank.questions || [];
  const headersList = await headers();
  const userIp = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'Unknown IP';
  const userEmail = session.user.email || 'Candidate';

  const examSession: TestSession = {
    id: 'usmle-exam-block-1',
    qbankSlug: qbank.slug,
    mode: requestedMode,
    durationSec: requestedMode === 'timed' ? 3600 : null,
    blockNumber: 1,
    questions: questions.map((q, index) => {
      const parsedOptions = parseOptions(q.options);
      return {
        id: `exam-progress-${index + 1}`,
        order: index,
        selectedOptionId: null,
        isCorrect: null,
        timeTakenSec: 0,
        isFlagged: false,
        question: {
          id: q.id,
          qid: q.qid,
          questionText: q.questionText,
          explanation: q.explanation,
          acceptableAnswers: q.acceptableAnswers,
          tags: q.tags,
          videoUrl: q.videoUrl || null,
          media: q.media.map(m => ({
            id: m.id,
            type: m.type,
            url: m.url,
            caption: m.caption,
            displaySize: m.displaySize,
            placement: m.placement,
          })),
          options: parsedOptions.map(opt => ({
            id: opt.id,
            text: opt.text,
            isCorrect: opt.id === q.correctAnswer || Boolean((opt as { isCorrect?: boolean }).isCorrect),
            isYellowDistractor: Boolean((opt as { isYellowDistractor?: boolean }).isYellowDistractor),
            explanation: opt.explanation || null,
          })),
        },
      };
    }),
  };

  return (
    <div className="relative min-h-screen bg-slate-100 flex flex-col font-sans select-none antialiased">
      <TestSecurityOverlay userEmail={userEmail} userIp={userIp}>
        <TestPlayer
          session={examSession}
          userEmail={userEmail}
          userIp={userIp}
        />
      </TestSecurityOverlay>
    </div>
  );
}
