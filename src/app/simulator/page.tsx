import { prisma } from '@/lib/db';
import { TestPlayer, TestSession } from '@/components/TestPlayer';
import { TestSecurityOverlay } from '@/components/TestSecurityOverlay';
import { getCachedOrFetch } from '@/lib/redis';
import { parseOptions } from '@/lib/grading';

export const dynamic = 'force-dynamic';

export default async function SimulatorTestPlayerPage(props: {
  searchParams: Promise<{ mode?: string; theme?: string; qbank?: string; count?: string }>;
}) {
  const searchParams = await props.searchParams;
  const requestedMode = (
    searchParams.mode === 'timed' 
      ? 'timed' 
      : searchParams.mode === 'review' 
        ? 'review' 
        : 'tutor'
  ) as 'timed' | 'tutor' | 'review';
  const requestedSlug = searchParams.qbank || 'autoimmune-diseases';
  const questionCount = parseInt(searchParams.count || '50', 10);

  // Fetch questions with fast Redis caching (3600s)
  const qbank = await getCachedOrFetch(
    `simulator:qbank:${requestedSlug}:${questionCount}`,
    async () => {
      let bank = await prisma.qBank.findFirst({
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

      if (!bank || bank.questions.length === 0) {
        bank = await prisma.qBank.findFirst({
          where: { isActive: true },
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
      }
      return bank;
    },
    3600
  );

  const questions = qbank?.questions || [];

  const examSession: TestSession = {
    id: 'usmle-exam-block-1',
    qbankSlug: qbank?.slug || 'approach-to-histology',
    mode: requestedMode,
    durationSec: requestedMode === 'timed' ? 3600 : null,
    blockNumber: 1,
    questions: questions.map((q, index) => {
      const parsedOptions = parseOptions(q.options);
      return {
        id: `exam-progress-${index + 1}`,
        order: index,
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
        isFlagged: false,
        selectedOptionId: null,
        isCorrect: null,
        timeTakenSec: 0,
        notes: null,
        strikethroughs: [],
      };
    }),
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <TestSecurityOverlay userEmail="candidate@usmle-boards.org" userIp="192.168.1.38">
        <TestPlayer 
          session={examSession} 
          initialIndex={0} 
        />
      </TestSecurityOverlay>
    </div>
  );
}
