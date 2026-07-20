import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { ArrowLeft, Printer, Search } from 'lucide-react';

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

    // Determine performance tier color
    let barColor = 'bg-[var(--color-error)]';
    if (correctPct >= 70) barColor = 'bg-[var(--color-success)]';
    else if (correctPct >= 50) barColor = 'bg-[var(--color-warning)]';

    return {
      name: subtopic,
      total,
      ...stats,
      omitted,
      correctPct,
      incorrectPct,
      omittedPct,
      pRank,
      barColor,
    };
  }).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="min-h-full bg-[var(--background)] p-4 md:p-8 font-sans animate-page-enter">
      <div className="max-w-7xl mx-auto">
        <Link href={`/dashboard/${qbank.slug}`} className="inline-flex items-center gap-2 text-scale-sm text-secondary hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to {qbank.title}
        </Link>

        <h1 className="text-scale-2xl text-primary mb-8 tracking-tight">Performance Analytics</h1>

        <Card elevation="elevated" className="overflow-hidden bg-white">
          <div className="p-6 border-b border-[var(--color-border-subtle)]">
            <div className="flex gap-8 border-b border-[var(--color-border-subtle)] pb-1 mb-6">
              <button className="text-primary font-bold border-b-2 border-primary pb-2 px-1 -mb-[5px] text-scale-sm">Subjects</button>
              <button className="text-secondary hover:text-primary font-bold pb-2 px-1 text-scale-sm transition-colors">Systems</button>
              <button className="text-secondary hover:text-primary font-bold pb-2 px-1 text-scale-sm transition-colors">Topics</button>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-scale-sm text-secondary">
                  <span>Show:</span>
                  <select className="border-b border-[var(--color-border-subtle)] bg-transparent text-primary outline-none pb-1 font-semibold focus:border-primary transition-colors">
                    <option>Score</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 text-scale-sm text-secondary">
                  <select className="border-b border-[var(--color-border-subtle)] bg-transparent text-primary outline-none pb-1 font-semibold focus:border-primary transition-colors">
                    <option>Correct Only</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <button className="text-secondary hover:text-primary transition-colors flex items-center gap-1.5 text-scale-sm font-bold">
                  <Printer className="w-4 h-4 stroke-[2px]" />
                  Print
                </button>
                <div className="relative flex-1 sm:flex-none">
                  <input type="text" placeholder="Search topics..." className="w-full sm:w-56 border-b border-[var(--color-border-subtle)] pb-1.5 text-scale-sm outline-none focus:border-primary transition-colors bg-transparent text-primary placeholder-muted" />
                  <Search className="w-4 h-4 text-muted absolute right-0 top-0.5" />
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-scale-sm whitespace-nowrap">
              <thead>
                <tr className="text-secondary uppercase tracking-wider font-semibold border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-subtle)]">
                  <th className="px-6 py-4 min-w-[240px]">Topic Name</th>
                  <th className="px-6 py-4 text-center">Usage</th>
                  <th className="px-6 py-4 text-center">Correct</th>
                  <th className="px-6 py-4 text-center">Incorrect</th>
                  <th className="px-6 py-4 text-center">Omitted</th>
                  <th className="px-6 py-4 text-center">P-Rank</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-subtle)]">
                {rows.map((row) => (
                  <tr key={row.name} className="hover:bg-[var(--color-surface-subtle)] transition-colors group">
                    <td className="px-6 py-5">
                      <div className="font-semibold text-primary mb-2.5">{row.name}</div>
                      <div className="w-full max-w-[200px] h-1.5 bg-[var(--color-border-subtle)] rounded-full overflow-hidden flex">
                        <div className={`h-full transition-all duration-700 ease-out ${row.barColor}`} style={{ width: `${(row.attempted / row.total) * 100}%` }}></div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center text-secondary font-medium">{row.attempted} / {row.total}</td>
                    <td className="px-6 py-5 text-center">
                      <span className="text-primary font-bold">{row.correct}</span>
                      <span className="text-secondary ml-1.5 text-scale-xs">({row.correctPct}%)</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="text-primary font-bold">{row.incorrect}</span>
                      <span className="text-secondary ml-1.5 text-scale-xs">({row.incorrectPct}%)</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="text-primary font-bold">{row.omitted}</span>
                      <span className="text-secondary ml-1.5 text-scale-xs">({row.omittedPct}%)</span>
                    </td>
                    <td className="px-6 py-5 text-center text-secondary font-semibold">
                      {row.pRank ? (
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded bg-[var(--color-border-subtle)] text-primary">
                          {row.pRank}{row.pRank > 90 ? 'th' : 'st'}
                        </span>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
