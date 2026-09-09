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
import { isFeatureEnabled } from '@/lib/featureFlags';
import { Clock, GraduationCap, ChevronRight, FileText, LayoutTemplate, Brain, ChevronLeft, Search, BookOpen, Video, Calendar, Sparkles, Target } from 'lucide-react';

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

  // Feature flags
  const [readyDecksEnabled, plannerEnabled, libraryEnabled, videoEnabled, searchEnabled] = await Promise.all([
    isFeatureEnabled('READY_DECKS_V2'),
    isFeatureEnabled('STUDY_PLANNER'),
    isFeatureEnabled('MEDICAL_LIBRARY'),
    isFeatureEnabled('VIDEO_LEARNING'),
    isFeatureEnabled('UNIFIED_SEARCH'),
  ]);

  // Due flashcards count if ReadyDecks enabled
  let dueFlashcardsCount = 0;
  if (readyDecksEnabled) {
    dueFlashcardsCount = await prisma.flashcard.count({
      where: {
        userId: session.user.id,
        nextReview: { lte: new Date() },
      },
    });
  }

  // Active study plan if Study Planner enabled
  let activeStudyPlan: any = null;
  let todayAttemptsCount = 0;
  let daysRemaining: number | null = null;
  if (plannerEnabled) {
    activeStudyPlan = await prisma.studyPlan.findFirst({
      where: { userId: session.user.id, isActive: true },
    });

    if (activeStudyPlan) {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      todayAttemptsCount = await prisma.userProgress.count({
        where: {
          userId: session.user.id,
          attemptedAt: { gte: startOfToday },
        },
      });
      if (activeStudyPlan.targetExamDate) {
        daysRemaining = Math.max(0, Math.ceil((new Date(activeStudyPlan.targetExamDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      }
    }
  }

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

      {/* Study Planner Active Banner */}
      {plannerEnabled && activeStudyPlan && (
        <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-teal-900 to-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm border border-teal-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-teal-500/20 text-teal-300">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-teal-300 uppercase tracking-wider">
                Study Planner Active • {daysRemaining !== null ? `${daysRemaining} Days to Exam` : 'Exam Pace'}
              </div>
              <div className="text-sm font-bold text-white mt-0.5">
                Today: {todayAttemptsCount} of {activeStudyPlan.dailyGoalQuestions} questions completed
              </div>
            </div>
          </div>
          <Link href="/planner">
            <Button variant="secondary" size="sm" className="text-xs font-semibold">
              Open Planner
            </Button>
          </Link>
        </div>
      )}

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

      {/* Study Tools & High-Yield Learning Modules */}
      <h2 className="text-scale-lg text-primary tracking-tight mb-6">Study Tools & Resources</h2>
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
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center relative">
                <Brain className="w-6 h-6" />
                {readyDecksEnabled && dueFlashcardsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                    {dueFlashcardsCount}
                  </span>
                )}
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-[18px] font-bold text-primary">
                {readyDecksEnabled ? 'ReadyDecks 2.0' : 'Flashcards'}
              </h3>
              {readyDecksEnabled && dueFlashcardsCount > 0 && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                  {dueFlashcardsCount} Due
                </span>
              )}
            </div>
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

        {searchEnabled && (
          <Link href={`/dashboard/${qbank.slug}/search`} className="group">
            <Card elevation="subtle" className="p-6 h-full transition-all duration-200 group-hover:shadow-md group-hover:border-slate-200 group-hover:-translate-y-1 bg-white">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Search className="w-6 h-6" />
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-[18px] font-bold text-primary mb-2">Unified Search</h3>
              <p className="text-scale-sm text-secondary">Search across board questions, medical library guides, flashcards, and notes.</p>
            </Card>
          </Link>
        )}

        {libraryEnabled && (
          <Link href="/library" className="group">
            <Card elevation="subtle" className="p-6 h-full transition-all duration-200 group-hover:shadow-md group-hover:border-slate-200 group-hover:-translate-y-1 bg-white">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-[18px] font-bold text-primary mb-2">Medical Library</h3>
              <p className="text-scale-sm text-secondary">High-yield clinical disease summaries, diagnostic criteria, and board pearls.</p>
            </Card>
          </Link>
        )}

        {videoEnabled && (
          <Link href="/courses" className="group">
            <Card elevation="subtle" className="p-6 h-full transition-all duration-200 group-hover:shadow-md group-hover:border-slate-200 group-hover:-translate-y-1 bg-white">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Video className="w-6 h-6" />
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-purple-100 group-hover:text-purple-600 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-[18px] font-bold text-primary mb-2">Video Hub</h3>
              <p className="text-scale-sm text-secondary">Interactive video lectures with closed captions and linked board questions.</p>
            </Card>
          </Link>
        )}
      </div>

    </div>
  );
}
