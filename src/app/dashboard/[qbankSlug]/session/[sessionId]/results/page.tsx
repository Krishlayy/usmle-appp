import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { ChevronLeft, RotateCcw, Plus, Clock, Target, CheckCircle2, XCircle } from 'lucide-react';

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
  const incorrectQuestions = answeredQuestions - correctQuestions;

  const scorePercentage = totalQuestions > 0 ? Math.round((correctQuestions / totalQuestions) * 100) : 0;

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

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scorePercentage / 100) * circumference;

  return (
    <div className="min-h-screen bg-[#F8FAF9] font-sans">
      <div className="bg-[#FFFFFF] border-b border-[#E5E7EB] sticky top-0 z-10">
        <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between max-w-5xl">
          <Link href={`/dashboard/${qbank.slug}`} className="flex items-center gap-2 text-sm font-bold text-[#6B7280] hover:text-[#111827] transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <Link 
              href={`/dashboard/${params.qbankSlug}/test/${params.sessionId}?mode=review`}
              className="px-4 py-2 bg-[#FFFFFF] border border-[#E5E7EB] text-[#111827] font-bold text-sm rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Review Session
            </Link>
            <Link 
              href={`/dashboard/${params.qbankSlug}/setup`}
              className="px-4 py-2 bg-[#0D9488] text-white font-bold text-sm rounded-lg hover:bg-[#0a7d6f] flex items-center gap-2 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> New Block
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-10 px-4 md:px-8 max-w-5xl">
        <div className="flex flex-col items-center mb-10">
          <div className="relative w-40 h-40 flex items-center justify-center mb-4">
            <svg className="transform -rotate-90 w-40 h-40">
              <circle cx="80" cy="80" r="70" stroke="#E5E7EB" strokeWidth="12" fill="transparent" />
              <circle 
                cx="80" cy="80" r="70" 
                stroke="#0D9488" 
                strokeWidth="12" 
                fill="transparent" 
                strokeDasharray={circumference * (70/60)} 
                strokeDashoffset={(circumference * (70/60)) - (scorePercentage / 100) * (circumference * (70/60))} 
                className="transition-all duration-1000 ease-out" 
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-4xl font-extrabold text-[#111827]">{scorePercentage}%</span>
              <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mt-1">Score</span>
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-[#111827] mb-1">Session Complete!</h1>
          <p className="text-[#6B7280] font-medium">Here is how you performed on this block.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-[#FFFFFF] rounded-xl shadow-sm border border-[#E5E7EB] p-6 text-center hover:shadow-md transition-shadow">
            <Target className="w-6 h-6 text-[#0D9488] mx-auto mb-3" />
            <div className="text-2xl font-extrabold text-[#111827] mb-1">{scorePercentage}%</div>
            <h3 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Overall Score</h3>
          </div>
          <div className="bg-[#FFFFFF] rounded-xl shadow-sm border border-[#E5E7EB] p-6 text-center hover:shadow-md transition-shadow">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-3" />
            <div className="text-2xl font-extrabold text-emerald-600 mb-1">{correctQuestions}</div>
            <h3 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Correct</h3>
          </div>
          <div className="bg-[#FFFFFF] rounded-xl shadow-sm border border-[#E5E7EB] p-6 text-center hover:shadow-md transition-shadow">
            <XCircle className="w-6 h-6 text-red-500 mx-auto mb-3" />
            <div className="text-2xl font-extrabold text-red-600 mb-1">{incorrectQuestions}</div>
            <h3 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Incorrect</h3>
          </div>
          <div className="bg-[#FFFFFF] rounded-xl shadow-sm border border-[#E5E7EB] p-6 text-center hover:shadow-md transition-shadow">
            <Clock className="w-6 h-6 text-[#111827] mx-auto mb-3" />
            <div className="text-2xl font-extrabold text-[#111827] mb-1">
              {timeTakenMinutes}:{timeTakenSeconds.toString().padStart(2, '0')}
            </div>
            <h3 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Time Spent</h3>
          </div>
        </div>

        <div className="bg-[#FFFFFF] rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
          <div className="p-6 border-b border-[#E5E7EB]">
            <h3 className="text-lg font-bold text-[#111827]">Performance by Topic</h3>
          </div>
          {sortedSubtopics.length === 0 ? (
            <div className="p-6 text-[#6B7280] text-sm text-center font-medium">No topic data available for this block.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8FAF9] border-b border-[#E5E7EB]">
                    <th className="py-4 px-6 text-xs font-bold text-[#6B7280] uppercase tracking-wider">Subtopic</th>
                    <th className="py-4 px-6 text-xs font-bold text-[#6B7280] uppercase tracking-wider text-center">Total</th>
                    <th className="py-4 px-6 text-xs font-bold text-[#6B7280] uppercase tracking-wider text-center">Correct</th>
                    <th className="py-4 px-6 text-xs font-bold text-[#6B7280] uppercase tracking-wider text-center">Incorrect</th>
                    <th className="py-4 px-6 text-xs font-bold text-[#6B7280] uppercase tracking-wider text-center">Omitted</th>
                    <th className="py-4 px-6 text-xs font-bold text-[#6B7280] uppercase tracking-wider text-right">Accuracy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {sortedSubtopics.map(tag => {
                    const stats = subtopicStats[tag];
                    const percent = Math.round((stats.correct / stats.total) * 100);
                    let colorClass = 'text-[#111827]';
                    if (percent >= 70) colorClass = 'text-emerald-600';
                    else if (percent < 50) colorClass = 'text-red-600';

                    return (
                      <tr key={tag} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6 text-sm font-bold text-[#111827]">{tag}</td>
                        <td className="py-4 px-6 text-sm font-medium text-[#6B7280] text-center">{stats.total}</td>
                        <td className="py-4 px-6 text-sm font-bold text-emerald-600 text-center">{stats.correct > 0 ? stats.correct : '-'}</td>
                        <td className="py-4 px-6 text-sm font-bold text-red-600 text-center">{stats.incorrect > 0 ? stats.incorrect : '-'}</td>
                        <td className="py-4 px-6 text-sm font-medium text-[#6B7280] text-center">{stats.omitted > 0 ? stats.omitted : '-'}</td>
                        <td className={`py-4 px-6 text-sm font-black text-right ${colorClass}`}>{percent}%</td>
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
