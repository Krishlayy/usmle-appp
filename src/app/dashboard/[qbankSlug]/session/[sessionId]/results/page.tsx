import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';

export default async function SessionResultsPage(props: { params: Promise<{ qbankSlug: string, sessionId: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    redirect('/login');
  }

  const testSession = await prisma.testSession.findUnique({
    where: { id: params.sessionId },
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
        orderBy: { id: 'asc' },
      },
    },
  });

  if (!testSession || testSession.userId !== session.user.id) {
    notFound();
  }

  const qbank = await prisma.qBank.findUnique({ where: { slug: params.qbankSlug } });
  if (!qbank) {
    notFound();
  }

  const totalQuestions = testSession.progress.length;
  const answeredQuestions = testSession.progress.filter(p => p.selectedAnswer).length;
  const correctQuestions = testSession.progress.filter(p => p.isCorrect).length;

  const scorePercentage = totalQuestions > 0 ? Math.round((correctQuestions / totalQuestions) * 100) : 0;

  const previousSession = await prisma.testSession.findFirst({
    where: {
      userId: session.user.id,
      qbankId: qbank.id,
      status: 'completed',
      completedAt: { lt: testSession.completedAt || new Date() },
      id: { not: testSession.id }
    },
    orderBy: { completedAt: 'desc' },
    include: { progress: true }
  });

  let previousScorePercentage: number | null = null;
  if (previousSession && previousSession.progress.length > 0) {
    const prevTotal = previousSession.progress.length;
    const prevCorrect = previousSession.progress.filter(p => p.isCorrect).length;
    previousScorePercentage = Math.round((prevCorrect / prevTotal) * 100);
  }

  const timeTakenTotal = testSession.progress.reduce((sum, p) => sum + (p.timeTakenSec || 0), 0);
  const timeTakenMinutes = Math.floor(timeTakenTotal / 60);
  const timeTakenSeconds = timeTakenTotal % 60;

  // Calculate subtopic statistics
  const subtopicStats: Record<string, { total: number, correct: number, incorrect: number, omitted: number }> = {};
  
  testSession.progress.forEach(p => {
    const subtopic = p.question.subtopic || 'Uncategorized';
    if (!subtopicStats[subtopic]) {
      subtopicStats[subtopic] = { total: 0, correct: 0, incorrect: 0, omitted: 0 };
    }
    subtopicStats[subtopic].total += 1;
    if (!p.selectedAnswer) subtopicStats[subtopic].omitted += 1;
    else if (p.isCorrect) subtopicStats[subtopic].correct += 1;
    else subtopicStats[subtopic].incorrect += 1;
  });

  const sortedSubtopics = Object.keys(subtopicStats).sort((a, b) => subtopicStats[b].incorrect - subtopicStats[a].incorrect);

  return (
    <div className="min-h-screen bg-[#f4f7f9] font-sans">
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <Link href={`/dashboard/${qbank.slug}`} className="text-sm text-blue-500 hover:underline mb-4 inline-block font-medium">
          &larr; Back to {qbank.title} Dashboard
        </Link>
        
        <h1 className="text-[28px] font-extrabold text-[#001738] mb-6 tracking-tight">Block Results</h1>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white rounded-md p-6 shadow-sm border border-slate-200 text-center flex flex-col justify-center h-[120px]">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Score</h3>
            <div className="text-[32px] font-black text-[#001738] leading-none">{scorePercentage}%</div>
            {previousScorePercentage !== null && (
              <div className={`text-xs font-bold mt-2 ${scorePercentage >= previousScorePercentage ? 'text-emerald-600' : 'text-red-500'}`}>
                {scorePercentage >= previousScorePercentage ? '▲' : '▼'} {Math.abs(scorePercentage - previousScorePercentage)}% vs previous test
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-md p-6 shadow-sm border border-slate-200 text-center flex flex-col justify-center h-[120px]">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Correct</h3>
            <div className="text-[32px] font-black text-emerald-600 leading-none">{correctQuestions} <span className="text-xl text-slate-400 font-bold">/ {totalQuestions}</span></div>
          </div>

          <div className="bg-white rounded-md p-6 shadow-sm border border-slate-200 text-center flex flex-col justify-center h-[120px]">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Answered</h3>
            <div className="text-[32px] font-black text-blue-600 leading-none">{answeredQuestions} <span className="text-xl text-slate-400 font-bold">/ {totalQuestions}</span></div>
          </div>

          <div className="bg-white rounded-md p-6 shadow-sm border border-slate-200 text-center flex flex-col justify-center h-[120px]">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Time Spent</h3>
            <div className="text-[32px] font-black text-[#001738] leading-none">
              {timeTakenMinutes}:{timeTakenSeconds.toString().padStart(2, '0')}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[22px] font-extrabold text-[#001738]">Test Analysis</h2>
          <a 
            href={`/dashboard/${params.qbankSlug}/test/${params.sessionId}?mode=review`}
            className="px-6 py-2 bg-[#003b5c] text-white font-bold text-sm rounded shadow hover:bg-[#004f7a] transition-colors"
          >
            Review Test Explanations
          </a>
        </div>
        
        <div className="bg-white rounded-md p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-[#001738] mb-4">Performance by Subtopic</h3>
          {sortedSubtopics.length === 0 ? (
            <div className="text-slate-500 text-sm">No topic data available for this block.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-200 bg-slate-50">
                    <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase">Subtopic</th>
                    <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase text-center">Total</th>
                    <th className="py-3 px-4 text-xs font-bold text-emerald-600 uppercase text-center">Correct</th>
                    <th className="py-3 px-4 text-xs font-bold text-red-600 uppercase text-center">Incorrect</th>
                    <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase text-center">Omitted</th>
                    <th className="py-3 px-4 text-xs font-bold text-[#001738] uppercase text-center">% Correct</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedSubtopics.map(tag => {
                    const stats = subtopicStats[tag];
                    const percent = Math.round((stats.correct / stats.total) * 100);
                    return (
                      <tr key={tag} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 text-sm font-bold text-slate-700 uppercase">{tag}</td>
                        <td className="py-3 px-4 text-sm font-medium text-slate-600 text-center">{stats.total}</td>
                        <td className="py-3 px-4 text-sm font-bold text-emerald-600 text-center">{stats.correct}</td>
                        <td className="py-3 px-4 text-sm font-bold text-red-600 text-center">{stats.incorrect > 0 ? stats.incorrect : '-'}</td>
                        <td className="py-3 px-4 text-sm font-medium text-slate-500 text-center">{stats.omitted > 0 ? stats.omitted : '-'}</td>
                        <td className="py-3 px-4 text-sm font-black text-[#001738] text-center">{percent}%</td>
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
