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
      <div className="mb-10 flex items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <Link
            href={`/dashboard/${params.qbankSlug}`}
            className="mb-5 inline-flex items-center gap-1 text-sm text-slate-600 transition-colors hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden /> Back to {qbank.title}
          </Link>
          <h1 className="font-serif text-4xl font-medium tracking-tight text-slate-900">Test History</h1>
        </div>
        <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.18em] tabular-nums text-slate-600">
          {testSessions.length} Sessions
        </span>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {testSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <h2 className="mb-2 font-serif text-xl text-slate-900">No tests taken yet</h2>
            <p className="mb-6 max-w-sm text-sm text-slate-600">
              You haven&apos;t started any practice blocks for this question bank.
            </p>
            <Link
              href={`/dashboard/${params.qbankSlug}`}
              className="rounded-md bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
            >
              Start Practice
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap text-left">
              <thead>
                <tr className="border-b border-slate-200 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-600">
                  <th scope="col" className="px-6 py-4 font-medium">Status</th>
                  <th scope="col" className="px-6 py-4 font-medium">Date Started</th>
                  <th scope="col" className="px-6 py-4 font-medium">Mode</th>
                  <th scope="col" className="px-6 py-4 font-medium">Performance</th>
                  <th scope="col" className="px-6 py-4 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {testSessions.map((ts) => {
                  const totalQuestions = ts.progress.length;
                  const attemptedQuestions = ts.progress.filter(p => p.selectedAnswer !== null).length;
                  const correctAnswers = ts.progress.filter(p => p.isCorrect).length;
                  const accuracy = attemptedQuestions > 0 ? Math.round((correctAnswers / attemptedQuestions) * 100) : 0;

                  const isCompleted = ts.status === 'completed';

                  return (
                    <tr key={ts.id} className="transition-colors hover:bg-slate-50">
                      <td className="px-6 py-4">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-teal-700">
                            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-amber-700">
                            <Clock className="h-3.5 w-3.5" aria-hidden /> In Progress
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-800">{ts.startedAt.toLocaleDateString()}</div>
                        <div className="text-xs text-slate-500">{ts.startedAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm capitalize text-slate-800">{ts.mode} Mode</span>
                      </td>
                      <td className="px-6 py-4">
                        {isCompleted ? (
                          <div className="flex items-center gap-3">
                            <span className="w-12 font-mono text-sm tabular-nums text-slate-900">{accuracy}%</span>
                            <div
                              className="h-px w-24 bg-slate-100"
                              role="progressbar"
                              aria-valuenow={accuracy}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-label="Accuracy"
                            >
                              <div className="h-px bg-teal-600" style={{ width: `${accuracy}%` }}></div>
                            </div>
                          </div>
                        ) : (
                          <span className="font-mono text-sm tabular-nums text-slate-600">
                            {attemptedQuestions} / {totalQuestions} Answered
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isCompleted ? (
                          <Link
                            href={`/dashboard/${params.qbankSlug}/session/${ts.id}/results`}
                            className="text-sm text-teal-700 transition-colors hover:text-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600"
                          >
                            View Results
                          </Link>
                        ) : (
                          <Link
                            href={`/dashboard/${params.qbankSlug}/test/${ts.id}`}
                            className="inline-flex items-center gap-1.5 rounded-md bg-teal-700 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
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