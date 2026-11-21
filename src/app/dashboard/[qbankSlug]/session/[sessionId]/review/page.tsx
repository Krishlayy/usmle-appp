import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Bookmark, ArrowLeft, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';

export default async function SessionReviewPage(props: { params: Promise<{ qbankSlug: string, sessionId: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    redirect('/login');
  }

  const testSession = await prisma.testSession.findUnique({
    where: { id: params.sessionId },
    include: {
      progress: {
        orderBy: { id: 'asc' },
        include: { question: true }
      },
    },
  });

  if (!testSession || testSession.userId !== session.user.id) {
    notFound();
  }

  const totalQuestions = testSession.progress.length;
  const completeCount = testSession.progress.filter(p => !!p.selectedAnswer).length;
  const incompleteCount = totalQuestions - completeCount;
  const markedCount = testSession.progress.filter(p => p.flagged).length;

  const stats = [
    { label: 'Total Items', value: totalQuestions, tone: 'text-white' },
    { label: 'Completed', value: completeCount, tone: 'text-teal-300' },
    { label: 'Incomplete', value: incompleteCount, tone: 'text-amber-300' },
    { label: 'Flagged / Marked', value: markedCount, tone: 'text-rose-300' },
  ];
  const focusRing = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300';
  const itemHref = (idx: number) => `/dashboard/${params.qbankSlug}/test/${testSession.id}?item=${idx}`;

  return (
    <div className="flex min-h-screen flex-col bg-[#070a0f] text-slate-100">
      {/* Top Header (root layout owns <main>) */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-[#070a0f]/80 px-6 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard/${params.qbankSlug}/test/${testSession.id}`}
            className={`flex items-center gap-2 rounded-md border border-white/15 px-3 py-1.5 text-sm text-slate-200 transition-colors hover:border-white/40 hover:text-white ${focusRing}`}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            <span>Return to Test</span>
          </Link>
          <div>
            <h1 className="font-serif text-xl font-medium tracking-tight text-white">Block Review</h1>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">Session ID: {testSession.id.slice(0, 8)}</p>
          </div>
        </div>

        <form action={`/api/test-sessions/${testSession.id}/submit`} method="POST">
          <button
            type="submit"
            className={`rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-teal-200 ${focusRing} focus-visible:outline-offset-2`}
          >
            End Block
          </button>
        </form>
      </header>

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-5 py-10 md:px-10">
        <dl className="grid grid-cols-2 divide-white/10 border-y border-white/10 sm:grid-cols-4 sm:divide-x">
          {stats.map((s) => (
            <div key={s.label} className="px-4 py-5 first:pl-0">
              <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-400">{s.label}</dt>
              <dd className={`mt-2 font-mono text-3xl font-medium tabular-nums ${s.tone}`}>{s.value}</dd>
            </div>
          ))}
        </dl>

        <section className="flex flex-1 flex-col overflow-hidden rounded-lg border border-white/10 bg-white/[0.03] backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-300">Item Status Table</h2>
            <span className="text-xs text-slate-500">Select any row to jump directly to that question</span>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-400">
                  <th scope="col" className="w-20 px-6 py-3 font-medium">Item #</th>
                  <th scope="col" className="px-6 py-3 font-medium">Question Subject &amp; Topic</th>
                  <th scope="col" className="w-36 px-6 py-3 font-medium">Status</th>
                  <th scope="col" className="w-24 px-6 py-3 text-center font-medium">Marked</th>
                  <th scope="col" className="w-24 px-6 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {testSession.progress.map((p, idx) => {
                  const isDone = !!p.selectedAnswer;
                  return (
                    <tr key={p.id} className="group transition-colors hover:bg-white/[0.03]">
                      <td className="px-6 py-3.5">
                        <Link
                          href={itemHref(idx)}
                          aria-label={`Go to item ${idx + 1}`}
                          className={`font-mono tabular-nums text-white ${focusRing}`}
                        >
                          {idx + 1}
                        </Link>
                      </td>
                      <td className="px-6 py-3.5">
                        <Link href={itemHref(idx)} className={`block ${focusRing}`}>
                          <span className="text-slate-100 transition-colors group-hover:text-teal-200">
                            {p.question.subtopic || `Item ${p.question.qid || idx + 1}`}
                          </span>
                          {p.question.difficulty && (
                            <span className="ml-2 text-xs capitalize text-slate-500">({p.question.difficulty})</span>
                          )}
                        </Link>
                      </td>
                      <td className="px-6 py-3.5">
                        {isDone ? (
                          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-teal-300">
                            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                            Complete
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-amber-300">
                            <AlertCircle className="h-3.5 w-3.5" aria-hidden />
                            Incomplete
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        {p.flagged ? (
                          <span className="inline-flex items-center justify-center text-rose-300" role="img" aria-label="Marked">
                            <Bookmark className="h-4 w-4 fill-current" aria-hidden />
                          </span>
                        ) : (
                          <span className="text-slate-600" aria-label="Not marked">-</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <Link
                          href={itemHref(idx)}
                          className={`inline-flex items-center gap-0.5 text-xs text-teal-300 transition-colors hover:text-teal-200 ${focusRing}`}
                        >
                          Go <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer Bar */}
          <div className="flex items-center justify-between border-t border-white/10 p-4">
            <Link
              href={`/dashboard/${params.qbankSlug}/test/${testSession.id}`}
              className={`rounded-md border border-white/15 px-4 py-2 text-sm text-slate-200 transition-colors hover:border-white/40 hover:text-white ${focusRing}`}
            >
              Continue Test Block
            </Link>

            <form action={`/api/test-sessions/${testSession.id}/submit`} method="POST">
              <button
                type="submit"
                className={`rounded-md bg-white px-5 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-teal-200 ${focusRing} focus-visible:outline-offset-2`}
              >
                End Block &amp; View Results
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}