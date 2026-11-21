import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { ChevronLeft, Play, CheckCircle2, Clock } from 'lucide-react';

export default async function PreviousTestsPage(props: { params: Promise<{ qbankSlug: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    redirect('/login');
  }

  const qbank = await prisma.qBank.findUnique({
    where: { slug: params.qbankSlug },
  });

  if (!qbank) {
    notFound();
  }

  const testSessions = await prisma.testSession.findMany({
    where: {
      userId: session.user.id,
      qbankId: qbank.id,
    },
    orderBy: { startedAt: 'desc' },
    include: {
      progress: {
        select: {
          isCorrect: true,
          selectedAnswer: true
        }
      }
    }
  });

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 md:px-10 md:py-16">
      <div className="mb-10 flex items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <Link
            href={`/dashboard/${params.qbankSlug}`}
            className="mb-5 inline-flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden /> Back to {qbank.title}
          </Link>
          <h1 className="font-serif text-4xl font-medium tracking-tight text-white">Test History</h1>
        </div>
        <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.18em] tabular-nums text-slate-400">
          {testSessions.length} Sessions
        </span>
      </div>

      <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.03] backdrop-blur-xl">
        {testSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <h2 className="mb-2 font-serif text-xl text-white">No tests taken yet</h2>
            <p className="mb-6 max-w-sm text-sm text-slate-400">
              You haven&apos;t started any practice blocks for this question bank.
            </p>
            <Link
              href={`/dashboard/${params.qbankSlug}`}
              className="rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-teal-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300"
            >
              Start Practice
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap text-left">
              <thead>
                <tr className="border-b border-white/10 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-400">
                  <th scope="col" className="px-6 py-4 font-medium">Status</th>
                  <th scope="col" className="px-6 py-4 font-medium">Date Started</th>
                  <th scope="col" className="px-6 py-4 font-medium">Mode</th>
                  <th scope="col" className="px-6 py-4 font-medium">Performance</th>
                  <th scope="col" className="px-6 py-4 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {testSessions.map((ts) => {
                  const totalQuestions = ts.progress.length;
                  const attemptedQuestions = ts.progress.filter(p => p.selectedAnswer !== null).length;
                  const correctAnswers = ts.progress.filter(p => p.isCorrect).length;
                  const accuracy = attemptedQuestions > 0 ? Math.round((correctAnswers / attemptedQuestions) * 100) : 0;

                  const isCompleted = ts.status === 'completed';

                  return (
                    <tr key={ts.id} className="transition-colors hover:bg-white/[0.03]">
                      <td className="px-6 py-4">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-teal-300">
                            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-amber-300">
                            <Clock className="h-3.5 w-3.5" aria-hidden /> In Progress
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-200">{ts.startedAt.toLocaleDateString()}</div>
                        <div className="text-xs text-slate-500">{ts.startedAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm capitalize text-slate-200">{ts.mode} Mode</span>
                      </td>
                      <td className="px-6 py-4">
                        {isCompleted ? (
                          <div className="flex items-center gap-3">
                            <span className="w-12 font-mono text-sm tabular-nums text-white">{accuracy}%</span>
                            <div
                              className="h-px w-24 bg-white/10"
                              role="progressbar"
                              aria-valuenow={accuracy}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-label="Accuracy"
                            >
                              <div className="h-px bg-teal-300" style={{ width: `${accuracy}%` }}></div>
                            </div>
                          </div>
                        ) : (
                          <span className="font-mono text-sm tabular-nums text-slate-400">
                            {attemptedQuestions} / {totalQuestions} Answered
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isCompleted ? (
                          <Link
                            href={`/dashboard/${params.qbankSlug}/session/${ts.id}/results`}
                            className="text-sm text-teal-300 transition-colors hover:text-teal-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300"
                          >
                            View Results
                          </Link>
                        ) : (
                          <Link
                            href={`/dashboard/${params.qbankSlug}/test/${ts.id}`}
                            className="inline-flex items-center gap-1.5 rounded-md bg-white px-4 py-1.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-teal-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300"
                          >
                            <Play className="h-3.5 w-3.5" aria-hidden /> Resume
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}