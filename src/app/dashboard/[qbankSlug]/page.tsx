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
import { Clock, GraduationCap, ChevronRight, FileText, LayoutTemplate, Brain, ChevronLeft, Target, AlertCircle, BarChart3 } from 'lucide-react';

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
    <div className="min-h-screen bg-[#F8FAF9] font-sans">
      <div className="container mx-auto py-10 px-4 md:px-8 max-w-7xl animate-page-enter">
        {/* Header Section */}
        <div className="mb-10">
          <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors mb-6">
            <ChevronLeft className="w-4 h-4" /> Back to Library
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{qbank.title}</h1>
                <span className="inline-flex items-center rounded-md bg-green-100 text-green-700 px-2.5 py-0.5 text-xs font-semibold border border-green-200">
                  Active Subscription
                </span>
              </div>
              <p className="text-gray-500 text-base max-w-2xl">
                Track your performance, review your notes, or start a new practice session to master this material.
              </p>
            </div>
            
            <div className="flex gap-3 shrink-0">
              <Link href={`/dashboard/${qbank.slug}/setup?mode=tutor`}>
                <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50">
                  <GraduationCap className="w-4 h-4" /> Tutor Mode
                </button>
              </Link>
              <Link href={`/dashboard/${qbank.slug}/setup?mode=timed`}>
                <button className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700">
                  <Clock className="w-4 h-4" /> Timed Mode
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider">Overall Progress</h3>
            </div>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-3xl font-extrabold text-gray-900 tracking-tight">{uniqueQuestionsAttempted}</span>
              <span className="text-sm font-medium text-gray-500">/ {qbank.totalQuestions} Questions</span>
            </div>
            <div className="mt-auto flex flex-col gap-2">
              <div className="flex justify-between text-xs font-semibold text-gray-500">
                <span>Completion</span>
                <span>{Math.round(completionPercentage)}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-blue-500" style={{ width: `${completionPercentage}%` }} />
              </div>
            </div>
          </div>
          
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider">Overall Accuracy</h3>
            </div>
            <div className="flex items-baseline gap-2 mt-auto">
              <span className="text-4xl font-extrabold text-gray-900 tracking-tight">{accuracy}%</span>
              <span className="text-sm font-medium text-gray-500">all attempts</span>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider">Questions to Review</h3>
            </div>
            <div className="flex items-baseline gap-2 mt-auto">
              <span className="text-4xl font-extrabold text-gray-900 tracking-tight">{flaggedCount}</span>
              <span className="text-sm font-medium text-gray-500">flagged items</span>
            </div>
          </div>
        </div>

        {/* Analytics Charts */}
        <div className="mb-12">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col h-full w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Recent Performance</h2>
              <button className="text-sm font-semibold text-teal-600 hover:text-teal-700">View History</button>
            </div>
            <div className="w-full min-h-[300px]">
              <PerformanceChart data={performanceData} />
            </div>
          </div>
        </div>

        {/* Study Tools Navigation */}
        <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-6">Study Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Link href={`/dashboard/${qbank.slug}/notes`} className="group block">
            <div className="rounded-xl border border-gray-200 bg-white p-6 h-full shadow-sm transition-all duration-200 hover:shadow-md hover:border-blue-200 hover:-translate-y-1">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center transition-colors group-hover:bg-blue-100">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">My Notes</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Review personal notes linked to specific questions and concepts.</p>
            </div>
          </Link>
          
          <Link href={`/dashboard/${qbank.slug}/flashcards`} className="group block">
            <div className="rounded-xl border border-gray-200 bg-white p-6 h-full shadow-sm transition-all duration-200 hover:shadow-md hover:border-purple-200 hover:-translate-y-1">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center transition-colors group-hover:bg-purple-100">
                  <Brain className="w-6 h-6" />
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Flashcards</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Master concepts using spaced-repetition flashcards you've created.</p>
            </div>
          </Link>

          <Link href={`/dashboard/${qbank.slug}/previous`} className="group block">
            <div className="rounded-xl border border-gray-200 bg-white p-6 h-full shadow-sm transition-all duration-200 hover:shadow-md hover:border-emerald-200 hover:-translate-y-1">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center transition-colors group-hover:bg-emerald-100">
                  <LayoutTemplate className="w-6 h-6" />
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Previous Blocks</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Review your performance on past blocks and resume suspended sessions.</p>
            </div>
          </Link>
        </div>

      </div>
    </div>
  );
}
