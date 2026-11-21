import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { SessionResultsView, SessionResultsData } from '@/components/SessionResultsView';

export const dynamic = 'force-dynamic';

export default async function SessionResultsPage(props: {
  params: Promise<{ qbankSlug: string; sessionId: string }>;
}) {
  const params = await props.params;
  const session = await getServerSession(authOptions);

  let initialData: SessionResultsData | null = null;

  // If this is a real database session and user is authenticated, query the DB
  if (!params.sessionId.startsWith('usmle-exam-') && session?.user?.id) {
    try {
      const testSession = await prisma.testSession.findUnique({
        where: { id: params.sessionId },
        include: {
          progress: {
            include: {
              question: {
                include: {
                  media: {
                    orderBy: { order: 'asc' },
                  },
                },
              },
            },
            orderBy: { id: 'asc' },
          },
        },
      });

      const qbank = await prisma.qBank.findUnique({
        where: { slug: params.qbankSlug },
      });

      // Never serve the answer key for a block that hasn't been submitted (a student could
      // otherwise open /results mid-test and read answers).
      if (testSession && testSession.userId === session.user.id && testSession.status === 'completed') {
        initialData = {
          sessionId: testSession.id,
          qbankSlug: qbank?.slug || params.qbankSlug,
          qbankTitle: qbank?.title || 'USMLE Board Exam Block',
          mode: testSession.mode as 'tutor' | 'timed' | 'review',
          durationSec: testSession.durationSec,
          completedAt: testSession.completedAt?.toISOString(),
          questions: testSession.progress.map((p, index) => {
            const parsedOptions = (p.question.options as Array<{
              id: string;
              text: string;
              isCorrect?: boolean;
              isYellowDistractor?: boolean;
              explanation?: string | null;
            }>) || [];

            return {
              id: p.id,
              order: index,
              question: {
                id: p.question.id,
                qid: p.question.qid,
                questionText: p.question.questionText,
                explanation: p.question.explanation,
                videoUrl: p.question.videoUrl || null,
                tags: p.question.tags,
                subtopic: p.question.subtopic,
                media: p.question.media.map(m => ({
                  id: m.id,
                  url: m.url,
                  caption: m.caption,
                })),
                options: parsedOptions.map(opt => ({
                  id: opt.id,
                  text: opt.text,
                  isCorrect: opt.id === p.question.correctAnswer || Boolean(opt.isCorrect),
                  isYellowDistractor: Boolean(opt.isYellowDistractor),
                  explanation: opt.explanation || null,
                })),
              },
              isFlagged: Boolean(p.flagged),
              selectedOptionId: p.selectedAnswer,
              isCorrect: p.isCorrect,
              timeTakenSec: p.timeTakenSec || 0,
            };
          }),
        };
      }
    } catch (e) {
      console.warn('Could not query database session, falling back to client session:', e);
    }
  }

  // Render client results view. If initialData is null (e.g. simulator session),
  // it reads seamlessly from localStorage without ever throwing a 404!
  return (
    <SessionResultsView 
      initialData={initialData} 
      qbankSlug={params.qbankSlug} 
      sessionId={params.sessionId} 
    />
  );
}
