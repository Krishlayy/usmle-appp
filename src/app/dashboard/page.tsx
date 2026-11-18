import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { CheckoutButton } from '@/components/CheckoutButton';
import { getCachedOrFetch } from '@/lib/redis';
import { ArrowRight, Bell, CircleUserRound, Lock, ShieldCheck, Unlock, CheckCircle2, Target, LogOut, Play, BarChart3, Brain, Sparkles } from 'lucide-react';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    redirect('/login');
  }

  const allActiveQbanks = await getCachedOrFetch(
    'qbanks:active',
    () => prisma.qBank.findMany({
      where: { isActive: true },
      orderBy: { title: 'asc' },
    }),
    3600
  );

  const isAdmin = ['ADMIN', 'SUPERADMIN'].includes(session.user.role);

  const purchases = await prisma.purchase.findMany({
    where: { userId: session.user.id, status: 'active' },
    include: { qbank: true },
  });

  // Admins see all QBanks as unlocked without needing purchase records
  const purchasedQbankIds = isAdmin
    ? allActiveQbanks.map(q => q.id)
    : purchases.map((p) => p.qbankId);

  // For admins, build a display-only purchase list from the real qbank data
  const displayPurchases = isAdmin
    ? allActiveQbanks.map(qbank => ({ qbankId: qbank.id, qbank }))
    : purchases.map(p => ({ qbankId: p.qbankId, qbank: p.qbank }));

  const availableQbanks = allActiveQbanks.filter(qb => !purchasedQbankIds.includes(qb.id));

  // Fetch only the fields needed for analytics — do NOT load all columns
  const userProgress = await prisma.userProgress.findMany({
    where: {
      userId: session.user.id,
      qbankId: { in: purchasedQbankIds },
      selectedAnswer: { not: null },
    },
    select: { qbankId: true, questionId: true, isCorrect: true },
  });

  const analyticsMap: Record<string, { attempted: Set<string>; correct: Set<string> }> = {};

  purchasedQbankIds.forEach(id => {
    analyticsMap[id] = { attempted: new Set(), correct: new Set() };
  });

  userProgress.forEach(progress => {
    if (analyticsMap[progress.qbankId]) {
      analyticsMap[progress.qbankId].attempted.add(progress.questionId);
      if (progress.isCorrect) {
        analyticsMap[progress.qbankId].correct.add(progress.questionId);
      }
    }
  });

  const displayName = session.user.name || session.user.email?.split('@')[0] || 'there';
  const brand = 'Micro Q Bank';
  
  const totalAnswered = purchasedQbankIds.reduce((acc, id) => acc + (analyticsMap[id]?.attempted.size || 0), 0);
  const totalCorrect = purchasedQbankIds.reduce((acc, id) => acc + (analyticsMap[id]?.correct.size || 0), 0);
  const overallAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  const footerLinks = [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Support', href: 'mailto:support@microqbank.com' },
    { label: 'Contact', href: 'mailto:contact@microqbank.com' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-gray-900 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold text-lg">M</div>
            <span className="font-bold text-xl text-gray-900 tracking-tight">{brand}</span>
          </Link>

          <div className="hidden md:flex items-center gap-4 text-sm font-semibold">
            <Link href="/dashboard" className="text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg">
              Library
            </Link>
            <Link href="/dashboard/create-test" className="text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-50 flex items-center gap-1.5 transition-colors">
              <Play className="w-3.5 h-3.5 text-teal-600 fill-teal-600" /> Create Test Block
            </Link>
            <Link href="/dashboard/performance" className="text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-50 flex items-center gap-1.5 transition-colors">
              <BarChart3 className="w-3.5 h-3.5 text-cyan-600" /> Analytics
            </Link>
            <Link href="/dashboard/flashcards" className="text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-50 flex items-center gap-1.5 transition-colors">
              <Brain className="w-3.5 h-3.5 text-amber-600" /> Flashcards
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <CircleUserRound className="w-5 h-5 text-gray-400" />
            <span>{displayName}</span>
          </div>
          <Link href="/login" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Log Out</span>
          </Link>
        </div>
      </nav>

      <main className="flex-1 px-4 py-8 md:px-8 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-10">
          
          {/* Greeting & Quick Action Bar */}
          <section className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-1">Welcome back, {displayName}</h1>
                <p className="text-gray-500">Ready to master your medical knowledge with high-yield video mnemonics?</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link href="/dashboard/create-test">
                  <span className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-teal-500 transition-all cursor-pointer">
                    <Play className="w-4 h-4 fill-white" />
                    Create Test Block
                  </span>
                </Link>
                <Link href="/dashboard/performance">
                  <span className="inline-flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-800 shadow-2xs hover:bg-gray-50 transition-all cursor-pointer">
                    <BarChart3 className="w-4 h-4 text-cyan-600" />
                    Analytics
                  </span>
                </Link>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Questions Answered</p>
                  <p className="text-2xl font-bold text-gray-900">{totalAnswered}</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Overall Accuracy</p>
                  <p className="text-2xl font-bold text-gray-900">{overallAccuracy}%</p>
                </div>
              </div>
            </div>
          </section>

          {/* Active Subscriptions */}
          <section className="flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <Unlock className="h-5 w-5 text-teal-600" />
              <h2 className="text-lg font-bold text-gray-900">Your QBanks</h2>
            </div>

            {displayPurchases.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
                <Lock className="mb-4 h-12 w-12 text-gray-300" />
                <h3 className="mb-2 text-xl font-bold text-gray-900">No active QBanks</h3>
                <p className="max-w-md text-gray-500">You haven&apos;t unlocked any question banks yet. Browse the store below to start practicing.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {displayPurchases.map(({ qbank }) => {
                  const attemptedCount = analyticsMap[qbank.id]?.attempted.size || 0;
                  const correctCount = analyticsMap[qbank.id]?.correct.size || 0;
                  const totalCount = qbank.totalQuestions || 1;
                  const percentage = Math.round((attemptedCount / totalCount) * 100);
                  const displayPercentage = Math.min(percentage, 100);
                  const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;

                  return (
                    <article
                      key={qbank.id}
                      className="relative flex flex-col gap-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm overflow-hidden transition-all hover:shadow-md"
                    >
                      {/* Left accent bar */}
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-teal-600" />
                      
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-xl font-bold text-gray-900 leading-tight">{qbank.title}</h3>
                        <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                          {qbank.specialtyTag}
                        </span>
                      </div>

                      <div className="mt-auto flex flex-col gap-4">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex flex-col">
                            <span className="text-gray-500 font-medium">Completion</span>
                            <span className="font-bold text-gray-900">{displayPercentage}%</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-gray-500 font-medium">Accuracy</span>
                            <span className="font-bold text-teal-600">{accuracy}%</span>
                          </div>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                          <div className="h-full rounded-full bg-teal-500" style={{ width: `${displayPercentage}%` }} />
                        </div>
                        <p className="text-right text-xs font-medium text-gray-500">{attemptedCount} of {qbank.totalQuestions} Questions completed</p>
                      </div>

                      <Link href={`/dashboard/${qbank.slug}`} className="mt-2 block">
                        <span className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-700">
                          <span>Open QBank</span>
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </Link>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* Available to Unlock */}
          <section className="flex flex-col gap-5 mt-4">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-bold text-gray-900">Available to Unlock</h2>
            </div>

            {availableQbanks.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
                <ShieldCheck className="mb-4 h-12 w-12 text-teal-500" />
                <h3 className="mb-2 text-xl font-bold text-gray-900">You own all available question banks!</h3>
                <p className="max-w-lg text-gray-500">Great work—there are no additional banks to unlock right now. Keep practicing your current subscriptions.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {availableQbanks.map((qbank) => (
                  <div key={qbank.id} className="flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:border-teal-500 hover:shadow-md">
                    <div className="flex flex-1 flex-col gap-4 p-6">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-lg font-bold text-gray-900">{qbank.title}</h3>
                        <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600 whitespace-nowrap">
                          {qbank.specialtyTag}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-gray-600 line-clamp-3">{qbank.description}</p>
                    </div>
                    
                    <div className="flex flex-col gap-4 border-t border-gray-100 bg-gray-50/50 p-6 rounded-b-xl">
                      <div className="flex items-baseline justify-between">
                        <span className="text-3xl font-extrabold text-gray-900">${(qbank.price / 100).toFixed(2)}</span>
                        <span className="text-sm font-medium text-gray-500">{qbank.totalQuestions} Questions</span>
                      </div>
                      <CheckoutButton qbankId={qbank.id} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white mt-auto">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between md:px-8">
          <p className="text-sm text-gray-500">
            <span className="font-bold text-gray-900">{brand}</span> © {new Date().getFullYear()}. All rights reserved.
          </p>
          <nav aria-label="Footer links" className="flex flex-wrap items-center gap-6 text-sm text-gray-500 font-medium">
            {footerLinks.map((item) => (
              <Link key={item.label} href={item.href} className="transition-colors hover:text-gray-900">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
