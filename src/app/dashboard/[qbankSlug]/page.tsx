import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { verifyQbankAccess } from '@/lib/verifyQbankAccess';
import Link from 'next/link';
import { PerformanceChart } from '@/components/PerformanceChart';
import { getCachedOrFetch } from '@/lib/redis';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { StatBlock } from '@/components/ui/StatBlock';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { QuickPracticeButtons } from '@/components/QuickPracticeButtons';
import { Reveal } from '@/components/ui/Reveal';
import { ChevronRight, FileText, LayoutTemplate, Brain, ChevronLeft } from 'lucide-react';

export default async function QBankDashboardPage(
  props: { 
    params: Promise<{ qbankSlug: string }>;
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
  }
) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    redirect('/login');
  }

  // 1. Find the QBank by slug
  const qbank = await getCachedOrFetch(
    `qbank:slug:${params.qbankSlug}`,
    () => prisma.qBank.findUnique({
      where: { slug: params.qbankSlug },
    }),
    3600
  );

  if (!qbank) {
    notFound();
  }

  // 1.5 Handle Stripe webhook latency (local testing or prod race conditions)
  if (searchParams?.session_id && typeof searchParams.session_id === 'string') {
    const { stripe } = await import('@/lib/stripe');
    try {
      const stripeSession = await stripe.checkout.sessions.retrieve(searchParams.session_id);
      if (stripeSession.payment_status === 'paid' && stripeSession.metadata?.userId === session.user.id && stripeSession.metadata?.qbankId === qbank.id) {
        await prisma.purchase.upsert({
          where: { stripeSessionId: stripeSession.id },
          create: {
            userId: session.user.id,
            qbankId: qbank.id,
            amountPaidCents: stripeSession.amount_total || 0,
            stripeSessionId: stripeSession.id,
            status: 'active',
            expiresAt: null,
          },
          update: { status: 'active' },
        });
      }
    } catch (e) {
      console.error('Failed to verify session_id synchronously:', e);
    }
  }

  // 2. Verify access
  try {
    await verifyQbankAccess(session.user.id, qbank.id);
  } catch {
    // If forbidden, redirect to public detail page
    redirect(`/qbanks/${qbank.slug}`);
  }

  // 3. Fetch user progress stats for this QBank, including question subtopic
  const progress = await prisma.userProgress.findMany({
    where: {
      userId: session.user.id,
      qbankId: qbank.id,
    },
    include: {
      question: {
        select: {
          subtopic: true,
          tags: true,
        }
      },
    },
  });

  // Calculate stats
  let uniqueQuestionsAttempted = new Set(progress.map((p) => p.questionId)).size;
  // Cap at totalQuestions in case database is out of sync with seed data
  if (uniqueQuestionsAttempted > qbank.totalQuestions) {
    uniqueQuestionsAttempted = qbank.totalQuestions;
  }
  
  const correctAttempts = progress.filter((p) => p.isCorrect).length;
  const totalAttempts = progress.length;
  const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;
  const flaggedCount = progress.filter((p) => p.flagged).length;
  
  let completionPercentage = qbank.totalQuestions > 0 ? (uniqueQuestionsAttempted / qbank.totalQuestions) * 100 : 0;
  if (completionPercentage > 100) completionPercentage = 100;

  // Fetch recent test sessions for performance chart
  const recentSessions = await prisma.testSession.findMany({
    where: {
      userId: session.user.id,
      qbankId: qbank.id,
      status: 'completed'
    },
    orderBy: { startedAt: 'asc' },
    take: 10,
    include: {
      progress: {
        select: { isCorrect: true }
      }
    }
  });

  const performanceData = recentSessions.map((s, index) => {
    const total = s.progress.length;
    const correct = s.progress.filter(p => p.isCorrect).length;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    return {
      name: `Test ${index + 1}`,
      accuracy
    };
  });

  const tools = [
    { href: `/dashboard/${qbank.slug}/notes`, icon: FileText, title: 'My Notes', body: 'Review personal notes linked to specific questions and concepts.' },
    { href: `/dashboard/${qbank.slug}/flashcards`, icon: Brain, title: 'Flashcards', body: "Master concepts using spaced-repetition flashcards you've created." },
    { href: `/dashboard/${qbank.slug}/previous`, icon: LayoutTemplate, title: 'Previous Blocks', body: 'Review your performance on past blocks and resume suspended sessions.' },
  ];

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 md:px-10 md:py-16">
      {/* Header Section */}
      <Reveal>
        <div className="mb-14 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <Link href="/dashboard" className="mb-6 inline-flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300">
              <ChevronLeft className="h-4 w-4" aria-hidden /> Back to Library
            </Link>
            <div className="flex flex-wrap items-center gap-4">
              <h1 className="font-serif text-4xl font-medium tracking-tight text-white md:text-5xl">{qbank.title}</h1>
              <Tag variant="success" size="sm">Active Subscription</Tag>
            </div>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-400">
              Track your performance, review your notes, or start a new practice session to master this material.
            </p>
          </div>

          <QuickPracticeButtons
            qbank={{
              id: qbank.id,
              title: qbank.title,
              slug: qbank.slug,
              description: qbank.description || undefined,
              totalQuestions: qbank.totalQuestions,
              specialtyTag: qbank.specialtyTag,
              completionPercentage,
              accuracy,
              attemptedCount: uniqueQuestionsAttempted,
            }}
          />
        </div>
      </Reveal>

      {/* Top Stats */}
      <Reveal delay={0.05}>
        <div className="mb-14 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card elevation="subtle" className="flex h-full flex-col p-6">
            <h3 className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-400">Overall Progress</h3>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl font-medium tabular-nums tracking-tight text-white">{uniqueQuestionsAttempted}</span>
              <span className="text-sm text-slate-500">/ {qbank.totalQuestions} Questions</span>
            </div>
            <div className="mt-auto pt-5">
              <ProgressBar progress={completionPercentage} label="Overall progress" />
            </div>
          </Card>

          <StatBlock
            label="Overall Accuracy"
            value={`${accuracy}%`}
            subValue="all attempts"
          />

          <StatBlock
            label="Questions to Review"
            value={flaggedCount}
            subValue="flagged items"
          />
        </div>
      </Reveal>

      {/* Analytics Charts */}
      <Reveal>
        <div className="mb-14">
          <Card elevation="subtle" className="flex h-full w-full flex-col p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-serif text-xl font-medium tracking-tight text-white">Recent Performance</h2>
              <Button variant="ghost" size="sm" className="text-slate-300">View History</Button>
            </div>
            <div className="min-h-[300px] w-full">
              <PerformanceChart data={performanceData} />
            </div>
          </Card>
        </div>
      </Reveal>

      {/* Study Tools */}
      <Reveal>
        <h2 className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Study Tools</h2>
      </Reveal>
      <div className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool, i) => (
          <Reveal key={tool.href} delay={i * 0.05}>
            <Link href={tool.href} className="group block h-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300">
              <Card elevation="subtle" className="h-full p-6 transition-colors group-hover:border-white/25">
                <div className="mb-6 flex items-start justify-between">
                  <tool.icon className="h-5 w-5 text-teal-300" strokeWidth={1.75} aria-hidden />
                  <ChevronRight className="h-4 w-4 text-slate-500 transition-colors group-hover:text-white" aria-hidden />
                </div>
                <h3 className="mb-2 font-serif text-lg font-medium text-white">{tool.title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{tool.body}</p>
              </Card>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}