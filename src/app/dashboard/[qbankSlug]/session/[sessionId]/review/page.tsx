import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Bookmark, ArrowLeft, CheckCircle2, AlertCircle, FileText, ChevronRight } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <Link 
            href={`/dashboard/${params.qbankSlug}/test/${testSession.id}`}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors bg-slate-100 hover:bg-blue-50 px-3 py-1.5 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Test</span>
          </Link>
          <div className="h-5 w-px bg-slate-200" />
          <div>
            <h1 className="text-base font-bold text-slate-900">Block Review</h1>
            <p className="text-xs text-slate-500">Session ID: {testSession.id.slice(0, 8)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <form action={`/api/test-sessions/${testSession.id}/submit`} method="POST">
            <button 
              type="submit"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
            >
              End Block
            </button>
          </form>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto w-full p-6 space-y-6 flex-1 flex flex-col">
        {/* Metric Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{totalQuestions}</div>
              <div className="text-xs font-medium text-slate-500">Total Items</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-700">{completeCount}</div>
              <div className="text-xs font-medium text-slate-500">Completed</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-700">{incompleteCount}</div>
              <div className="text-xs font-medium text-slate-500">Incomplete</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Bookmark className="w-5 h-5 fill-rose-500 text-rose-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-rose-700">{markedCount}</div>
              <div className="text-xs font-medium text-slate-500">Flagged / Marked</div>
            </div>
          </div>
        </div>

        {/* Question List Table / Grid */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Item Status Table</h2>
            <span className="text-xs text-slate-500">Click any row to jump directly to that question</span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-xs uppercase font-semibold">
                <tr>
                  <th className="py-3 px-6 w-20">Item #</th>
                  <th className="py-3 px-6">Question Subject & Topic</th>
                  <th className="py-3 px-6 w-36">Status</th>
                  <th className="py-3 px-6 w-24 text-center">Marked</th>
                  <th className="py-3 px-6 w-24 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {testSession.progress.map((p, idx) => {
                  const isDone = !!p.selectedAnswer;
                  return (
                    <tr 
                      key={p.id}
                      className="hover:bg-blue-50/50 transition-colors group cursor-pointer"
                    >
                      <td className="py-3.5 px-6 font-bold text-slate-900">
                        <Link 
                          href={`/dashboard/${params.qbankSlug}/test/${testSession.id}?item=${idx}`}
                          className="flex items-center gap-1.5 group-hover:text-blue-600"
                        >
                          <span className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center text-xs font-semibold transition-colors">
                            {idx + 1}
                          </span>
                        </Link>
                      </td>
                      <td className="py-3.5 px-6">
                        <Link 
                          href={`/dashboard/${params.qbankSlug}/test/${testSession.id}?item=${idx}`}
                          className="block"
                        >
                          <span className="font-medium text-slate-800 group-hover:text-blue-600 transition-colors">
                            {p.question.subtopic || `Item ${p.question.qid || idx + 1}`}
                          </span>
                          {p.question.difficulty && (
                            <span className="text-xs text-slate-400 ml-2 capitalize">({p.question.difficulty})</span>
                          )}
                        </Link>
                      </td>
                      <td className="py-3.5 px-6">
                        {isDone ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Complete
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Incomplete
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        {p.flagged ? (
                          <span className="inline-flex items-center justify-center p-1 rounded bg-rose-50 text-rose-600">
                            <Bookmark className="w-4 h-4 fill-rose-500" />
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <Link 
                          href={`/dashboard/${params.qbankSlug}/test/${testSession.id}?item=${idx}`}
                          className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-700 gap-0.5 group-hover:translate-x-0.5 transition-transform"
                        >
                          Go <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer Bar */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <Link 
              href={`/dashboard/${params.qbankSlug}/test/${testSession.id}`} 
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 shadow-sm transition-all"
            >
              Continue Test Block
            </Link>

            <form action={`/api/test-sessions/${testSession.id}/submit`} method="POST">
              <button 
                type="submit"
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
              >
                End Block & View Results
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
