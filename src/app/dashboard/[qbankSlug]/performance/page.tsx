import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import ClientPerformanceView from './ClientPerformanceView';

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

    // Calculate P-Rank accurately based on correctness (1-99 scale)
    const pRank = correctPct > 0 ? Math.round((correctPct / 100) * 99) + 1 : 0;

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
    <ClientPerformanceView qbank={qbank} rows={rows} />
  );
}
