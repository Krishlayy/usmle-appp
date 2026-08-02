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
import { Clock, GraduationCap, ChevronRight, FileText, LayoutTemplate, Brain, ChevronLeft } from 'lucide-react';

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

  return (
    <div className="container mx-auto py-12 px-4 md:px-8 max-w-7xl animate-page-enter">
      {/* Header Section */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm font-semibold text-secondary hover:text-primary transition-colors mb-4">
            <ChevronLeft className="w-4 h-4" /> Back to Library
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-scale-xl text-primary tracking-tight">{qbank.title}</h1>
            <Tag variant="success" size="sm">Active Subscription</Tag>
          </div>
          <p className="text-secondary text-scale-sm mt-2 max-w-2xl">
            Track your performance, review your notes, or start a new practice session to master this material.
          </p>
        </div>
        
        <div className="flex gap-3 shrink-0">
          <Link href={`/dashboard/${qbank.slug}/setup?mode=tutor`}>
            <Button variant="secondary" className="gap-2">
              <GraduationCap className="w-4 h-4" /> Tutor Mode
            </Button>
          </Link>
          <Link href={`/dashboard/${qbank.slug}/setup?mode=timed`}>
            <Button variant="primary" className="gap-2 shadow-sm">
              <Clock className="w-4 h-4" /> Timed Mode
            </Button>
          </Link>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card elevation="subtle" className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-[14px] font-medium text-secondary">Overall Progress</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[28px] font-bold text-primary tracking-tight">{uniqueQuestionsAttempted}</span>
            <span className="text-[14px] font-medium text-muted">/ {qbank.totalQuestions} Questions</span>
          </div>
          <div className="mt-auto">
            <ProgressBar progress={completionPercentage} />
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

      {/* Analytics Charts */}
      <div className="mb-12">
        <Card elevation="subtle" className="p-6 flex flex-col h-full w-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-scale-lg text-primary tracking-tight">Recent Performance</h2>
            <Button variant="ghost" size="sm">View History</Button>
          </div>
          <div className="w-full min-h-[300px]">
            <PerformanceChart data={performanceData} />
          </div>
        </Card>
      </div>

      {/* Study Tools */}
      <h2 className="text-scale-lg text-primary tracking-tight mb-6">Study Tools</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Link href={`/dashboard/${qbank.slug}/notes`} className="group">
          <Card elevation="subtle" className="p-6 h-full transition-all duration-200 group-hover:shadow-md group-hover:border-slate-200 group-hover:-translate-y-1 bg-white">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-cyan-100 group-hover:text-cyan-600 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-[18px] font-bold text-primary mb-2">My Notes</h3>
            <p className="text-scale-sm text-secondary">Review personal notes linked to specific questions and concepts.</p>
          </Card>
        </Link>
        
        <Link href={`/dashboard/${qbank.slug}/flashcards`} className="group">
          <Card elevation="subtle" className="p-6 h-full transition-all duration-200 group-hover:shadow-md group-hover:border-slate-200 group-hover:-translate-y-1 bg-white">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                <Brain className="w-6 h-6" />
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-cyan-100 group-hover:text-cyan-600 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-[18px] font-bold text-primary mb-2">Flashcards</h3>
            <p className="text-scale-sm text-secondary">Master concepts using spaced-repetition flashcards you've created.</p>
          </Card>
        </Link>

        <Link href={`/dashboard/${qbank.slug}/previous`} className="group">
          <Card elevation="subtle" className="p-6 h-full transition-all duration-200 group-hover:shadow-md group-hover:border-slate-200 group-hover:-translate-y-1 bg-white">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                <LayoutTemplate className="w-6 h-6" />
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-cyan-100 group-hover:text-cyan-600 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-[18px] font-bold text-primary mb-2">Previous Blocks</h3>
            <p className="text-scale-sm text-secondary">Review your performance on past blocks and resume suspended sessions.</p>
          </Card>
        </Link>
      </div>

    </div>
  );
}
