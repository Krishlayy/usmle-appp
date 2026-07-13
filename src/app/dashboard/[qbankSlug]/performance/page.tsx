import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/db';

export default async function PerformanceOverallPage(props: { params: Promise<{ qbankSlug: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    redirect('/login');
  }

  const qbank = await prisma.qBank.findUnique({ where: { slug: params.qbankSlug } });
  if (!qbank) {
    notFound();
  }

  // Fetch all questions to get total counts per subtopic
  const allQuestions = await prisma.question.findMany({
    where: { qbankId: qbank.id },
    select: { id: true, subtopic: true }
  });

  const totalQuestionsBySubtopic: Record<string, number> = {};
  allQuestions.forEach(q => {
    const sub = q.subtopic || 'Uncategorized';
    totalQuestionsBySubtopic[sub] = (totalQuestionsBySubtopic[sub] || 0) + 1;
  });

  // Fetch user progress for this QBank
  const progress = await prisma.userProgress.findMany({
    where: {
      userId: session.user.id,
      qbankId: qbank.id,
      selectedAnswer: { not: null }
    },
    include: {
      question: { select: { subtopic: true } }
    }
  });

  // Aggregate stats
  const statsMap: Record<string, { attempted: number; correct: number; incorrect: number }> = {};

  progress.forEach(p => {
    const sub = p.question.subtopic || 'Uncategorized';
    if (!statsMap[sub]) {
      statsMap[sub] = { attempted: 0, correct: 0, incorrect: 0 };
    }
    statsMap[sub].attempted++;
    if (p.isCorrect) {
      statsMap[sub].correct++;
    } else {
      statsMap[sub].incorrect++;
    }
  });

  const rows = Object.keys(totalQuestionsBySubtopic).map(subtopic => {
    const total = totalQuestionsBySubtopic[subtopic];
    const stats = statsMap[subtopic] || { attempted: 0, correct: 0, incorrect: 0 };
    const omitted = total - stats.attempted;
    
    const correctPct = stats.attempted > 0 ? Math.round((stats.correct / stats.attempted) * 100) : 0;
    const incorrectPct = stats.attempted > 0 ? Math.round((stats.incorrect / stats.attempted) * 100) : 0;
    const omittedPct = total > 0 ? Math.round((omitted / total) * 100) : 0;

    // Mock P-Rank between 40th and 99th based on correctPct
    const pRank = correctPct > 0 ? Math.min(99, Math.max(40, correctPct + Math.floor(Math.random() * 10))) : 0;

    return {
      name: subtopic,
      total,
      ...stats,
      omitted,
      correctPct,
      incorrectPct,
      omittedPct,
      pRank,
    };
  }).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="p-8 bg-white min-h-full font-sans text-slate-800">
      <div className="flex gap-8 border-b border-blue-500 mb-8 pb-1">
        <button className="text-blue-500 font-bold border-b-2 border-blue-500 pb-2 px-1 -mb-[5px]">Subjects</button>
        <button className="text-slate-400 hover:text-slate-600 font-bold pb-2 px-1">Systems</button>
        <button className="text-slate-400 hover:text-slate-600 font-bold pb-2 px-1">Topics</button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Show:</span>
            <select className="border-b border-slate-300 bg-transparent text-slate-700 outline-none pb-1 font-medium">
              <option>Score</option>
            </select>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <select className="border-b border-slate-300 bg-transparent text-slate-700 outline-none pb-1 font-medium">
              <option>Correct Only</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-blue-500 flex items-center gap-1 text-sm font-bold">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            Print
          </button>
          <div className="relative">
            <input type="text" placeholder="Search" className="border-b border-slate-300 pb-1 w-48 text-sm outline-none" />
            <svg className="w-4 h-4 text-slate-400 absolute right-0 top-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="text-slate-400 uppercase tracking-wider font-bold border-b border-slate-200">
              <th className="pb-4 pt-2 font-bold min-w-[200px]">Name</th>
              <th className="pb-4 pt-2 font-bold text-center">Usage</th>
              <th className="pb-4 pt-2 font-bold text-center">Correct Q</th>
              <th className="pb-4 pt-2 font-bold text-center">Incorrect Q</th>
              <th className="pb-4 pt-2 font-bold text-center">Omitted Q</th>
              <th className="pb-4 pt-2 font-bold text-center">P-Rank</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.name} className="hover:bg-slate-50 transition-colors">
                <td className="py-5">
                  <div className="font-medium text-slate-700 mb-2">{row.name}</div>
                  <div className="w-48 h-1.5 bg-slate-200 rounded-full overflow-hidden flex">
                    <div className="bg-emerald-500 h-full" style={{ width: `${(row.attempted / row.total) * 100}%` }}></div>
                  </div>
                </td>
                <td className="py-5 text-center text-slate-500 font-medium">{row.attempted}/{row.total}</td>
                <td className="py-5 text-center">
                  <span className="text-slate-700 font-bold">{row.correct}</span>
                  <span className="text-slate-400 ml-1">({row.correctPct}%)</span>
                </td>
                <td className="py-5 text-center">
                  <span className="text-slate-700 font-bold">{row.incorrect}</span>
                  <span className="text-slate-400 ml-1">({row.incorrectPct}%)</span>
                </td>
                <td className="py-5 text-center">
                  <span className="text-slate-700 font-bold">{row.omitted}</span>
                  <span className="text-slate-400 ml-1">({row.omittedPct}%)</span>
                </td>
                <td className="py-5 text-center text-slate-500 font-medium">{row.pRank ? `${row.pRank}${row.pRank > 90 ? 'th' : 'st'}` : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
