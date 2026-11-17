import { prisma } from '@/lib/db';
import { TestPlayer, TestSession } from '@/components/TestPlayer';
import { TestSecurityOverlay } from '@/components/TestSecurityOverlay';

export const dynamic = 'force-dynamic';

export default async function DemoTestPlayerPage(props: {
  searchParams: Promise<{ mode?: string; theme?: string }>;
}) {
  const searchParams = await props.searchParams;
  const requestedMode = (searchParams.mode === 'timed' ? 'timed' : 'tutor') as 'timed' | 'tutor';

  // Fetch real sample questions from Autoimmune Diseases QBank
  const qbank = await prisma.qBank.findFirst({
    where: { slug: 'autoimmune-diseases' },
    include: {
      questions: {
        take: 10,
        orderBy: { qid: 'asc' },
        include: {
          media: {
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  });

  const questions = qbank?.questions || [];

  const demoSession: TestSession = {
    id: 'demo-session-usmle',
    qbankSlug: 'autoimmune-diseases',
    mode: requestedMode,
    durationSec: requestedMode === 'timed' ? 600 : null,
    blockNumber: 1,
    questions: questions.map((q, index) => {
      const parsedOptions = (q.options as { id: string; text: string; explanation?: string | null }[]) || [];
      return {
        id: `demo-progress-${index + 1}`,
        order: index,
        question: {
          id: q.id,
          qid: q.qid,
          questionText: q.questionText,
          explanation: q.explanation,
          acceptableAnswers: q.acceptableAnswers,
          tags: q.tags,
          videoUrl: q.videoUrl || '/videos/mnemonics/autoimmune/boardroom.mp4',
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
            isCorrect: opt.id === q.correctAnswer,
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
      <TestSecurityOverlay userEmail="board-preview@medico.com" userIp="127.0.0.1">
        <TestPlayer 
          session={demoSession} 
          initialIndex={0} 
          userEmail="board-preview@medico.com" 
          userIp="127.0.0.1" 
        />
      </TestSecurityOverlay>
    </div>
  );
}
