import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { ChevronLeft, FileText, Play, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

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
    <div className="min-h-screen bg-[var(--background)] animate-page-enter">
      {/* Header */}
      <div className="bg-white border-b border-[var(--color-border-subtle)] sticky top-0 z-10">
        <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between max-w-6xl">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/${params.qbankSlug}`} className="w-8 h-8 flex items-center justify-center rounded-md border border-[var(--color-border-subtle)] text-secondary hover:text-primary hover:bg-gray-50 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-scale-lg font-bold text-primary tracking-tight">Test History</h1>
          </div>
          <span className="text-sm font-semibold text-secondary bg-gray-100 px-3 py-1 rounded-full">
            {testSessions.length} Sessions
          </span>
        </div>
      </div>

      <div className="container mx-auto py-12 px-4 md:px-8 max-w-6xl">
        <div className="bg-white border border-[var(--color-border-subtle)] rounded-xl overflow-hidden shadow-sm">
          {testSessions.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100 mb-4">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-primary mb-2">No tests taken yet</h3>
              <p className="text-sm text-secondary font-medium max-w-sm mb-6">
                You haven't started any practice blocks for this question bank.
              </p>
              <Link href={`/dashboard/${params.qbankSlug}/setup`}>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md text-sm transition-colors shadow-sm">
                  Start Practice
                </button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-50 border-b border-[var(--color-border-subtle)] text-xs uppercase tracking-wider text-secondary font-semibold">
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date Started</th>
                    <th className="px-6 py-4">Mode</th>
                    <th className="px-6 py-4">Performance</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border-subtle)]">
                  {testSessions.map((ts) => {
                    const totalQuestions = ts.progress.length;
                    const attemptedQuestions = ts.progress.filter(p => p.selectedAnswer !== null).length;
                    const correctAnswers = ts.progress.filter(p => p.isCorrect).length;
                    const accuracy = attemptedQuestions > 0 ? Math.round((correctAnswers / attemptedQuestions) * 100) : 0;
                    
                    const isCompleted = ts.status === 'completed';

                    return (
                      <tr key={ts.id} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-6 py-4">
                          {isCompleted ? (
                            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-md text-xs font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-md text-xs font-bold">
                              <Clock className="w-3.5 h-3.5" /> In Progress
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-primary">{ts.startedAt.toLocaleDateString()}</div>
                          <div className="text-xs font-medium text-secondary">{ts.startedAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-primary capitalize">{ts.mode} Mode</span>
                        </td>
                        <td className="px-6 py-4">
                          {isCompleted ? (
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-primary w-12">{accuracy}%</span>
                              <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${accuracy}%` }}></div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm font-medium text-secondary">
                              {attemptedQuestions} / {totalQuestions} Answered
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {isCompleted ? (
                            <Link href={`/dashboard/${params.qbankSlug}/session/${ts.id}/results`}>
                              <button className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">
                                View Results
                              </button>
                            </Link>
                          ) : (
                            <Link href={`/dashboard/${params.qbankSlug}/test/${ts.id}`}>
                              <button className="inline-flex items-center gap-1.5 bg-primary hover:bg-blue-900 text-white text-sm font-bold px-4 py-1.5 rounded-md transition-colors shadow-sm">
                                <Play className="w-3.5 h-3.5 fill-current" /> Resume
                              </button>
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
    </div>
  );
}
