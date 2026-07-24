import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { CheckoutButton } from '@/components/CheckoutButton';
import { getCachedOrFetch } from '@/lib/redis';
import { ArrowRight, Lock, Unlock, Activity, Target, Zap } from 'lucide-react';
import { Card } from '@/components/ui/Card';

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

  let purchases = await prisma.purchase.findMany({
    where: { userId: session.user.id, status: 'active' },
    include: { qbank: true },
  });

  if (isAdmin) {
    purchases = allActiveQbanks.map(qbank => ({
      id: `admin_bypass_${qbank.id}`,
      userId: session.user.id,
      qbankId: qbank.id,
      status: 'active',
      amountPaidCents: 0,
      stripeSessionId: null,
      purchasedAt: new Date(),
      expiresAt: null,
      qbank: qbank
    } as any));
  }

  const purchasedQbankIds = purchases.map((p) => p.qbankId);
  const availableQbanks = allActiveQbanks.filter(qb => !purchasedQbankIds.includes(qb.id));

  // Calculate real analytics for purchased QBanks
  const userProgress = await prisma.userProgress.findMany({
    where: {
      userId: session.user.id,
      qbankId: { in: purchasedQbankIds },
      selectedAnswer: { not: null }, // Only count attempted questions
    },
    select: { qbankId: true, questionId: true, isCorrect: true },
  });

  const analyticsMap: Record<string, { attempted: Set<string>; correct: Set<string> }> = {};
  
  purchasedQbankIds.forEach(id => {
    analyticsMap[id] = { attempted: new Set(), correct: new Set() };
  });

  let totalAttempted = 0;
  let totalCorrect = 0;

  userProgress.forEach(progress => {
    if (analyticsMap[progress.qbankId]) {
      analyticsMap[progress.qbankId].attempted.add(progress.questionId);
      totalAttempted++;
      if (progress.isCorrect) {
        analyticsMap[progress.qbankId].correct.add(progress.questionId);
        totalCorrect++;
      }
    }
  });

  const overallAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24 animate-page-enter">
      
      {/* Top Header & Stats Ribbon */}
      <div className="bg-white border-b border-[var(--color-border-subtle)] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
              <h1 className="text-[32px] font-extrabold text-[var(--color-primary)] tracking-tight mb-2">My Curriculum</h1>
              <p className="text-base font-medium text-[var(--color-secondary)]">
                Welcome back, {session.user.name || session.user.email?.split('@')[0]}
              </p>
            </div>

            <div className="flex items-center gap-6 sm:gap-10 bg-slate-50 border border-[var(--color-border-subtle)] p-4 rounded-xl shadow-inner">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center border border-blue-200">
                  <Target className="w-6 h-6 text-blue-700" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-slate-500 uppercase tracking-widest">Accuracy</p>
                  <p className="text-2xl font-black text-slate-800 leading-none mt-1">{overallAccuracy}%</p>
                </div>
              </div>
              
              <div className="h-12 w-px bg-slate-300"></div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center border border-emerald-200">
                  <Activity className="w-6 h-6 text-emerald-700" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-slate-500 uppercase tracking-widest">Attempted</p>
                  <p className="text-2xl font-black text-slate-800 leading-none mt-1">{totalAttempted}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        
        {/* Active Subscriptions */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <Unlock className="w-6 h-6 text-[var(--color-accent)]" />
            <h2 className="text-[24px] font-bold text-[var(--color-primary)] tracking-tight">Active Workbooks</h2>
          </div>
          
          {purchases.length === 0 ? (
            <Card elevation="subtle" className="p-16 flex flex-col items-center justify-center text-center border-dashed border-2">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <Lock className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">No active subscriptions</h3>
              <p className="text-base font-medium text-slate-500 max-w-sm">
                Unlock a question bank from the store below to begin your board preparation.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {purchases.map(({ qbank }) => {
                const attemptedCount = analyticsMap[qbank.id]?.attempted.size || 0;
                const totalCount = qbank.totalQuestions || 1;
                const percentage = Math.round((attemptedCount / totalCount) * 100);
                const displayPercentage = Math.min(percentage, 100);

                return (
                  <Link href={`/dashboard/${qbank.slug}`} key={qbank.id} className="group block h-full">
                    <Card elevation="elevated" className="flex flex-col h-full hover:-translate-y-1 hover:border-blue-300">
                      <div className="p-7 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-5">
                          <h3 className="text-[18px] font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                            {qbank.title}
                          </h3>
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700 whitespace-nowrap ml-3 border border-blue-100">
                            {qbank.specialtyTag}
                          </span>
                        </div>
                        
                        <div className="mt-auto pt-6">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-[13px] font-bold text-slate-500 uppercase tracking-widest">Progress</span>
                            <span className="text-[15px] font-black text-slate-700">{displayPercentage}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden shadow-inner">
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-1000" style={{ width: `${displayPercentage}%` }}></div>
                          </div>
                          <p className="text-[13px] font-semibold text-slate-400 mt-3 text-right">
                            {attemptedCount} / {qbank.totalQuestions} Questions
                          </p>
                        </div>
                      </div>
                      <div className="bg-slate-50 px-7 py-4 border-t border-[var(--color-border-subtle)] flex items-center justify-between group-hover:bg-blue-50 transition-colors">
                        <span className="text-[14px] font-bold text-slate-700 group-hover:text-blue-700">Enter QBank</span>
                        <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors group-hover:translate-x-1" />
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Store Section */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <Lock className="w-6 h-6 text-slate-400" />
            <h2 className="text-[24px] font-bold text-slate-700 tracking-tight">Available to Unlock</h2>
          </div>
          
          {availableQbanks.length === 0 ? (
            <Card elevation="subtle" className="p-10 text-center border-dashed">
              <p className="text-[15px] font-bold text-slate-400 uppercase tracking-widest">All QBanks Unlocked</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {availableQbanks.map((qbank) => (
                <Card elevation="subtle" key={qbank.id} className="flex flex-col">
                  <div className="p-7 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-[18px] font-bold text-slate-800 line-clamp-2 leading-snug">{qbank.title}</h3>
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 whitespace-nowrap ml-3 border border-slate-200">
                        {qbank.specialtyTag}
                      </span>
                    </div>
                    <p className="text-[15px] text-slate-500 font-medium leading-relaxed line-clamp-3 mb-6">
                      {qbank.description}
                    </p>
                    
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        <span className="text-[13px] font-bold">{qbank.totalQuestions} Qs</span>
                      </div>
                      <span className="text-[22px] font-black text-slate-800">${(qbank.price / 100).toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="p-5 border-t border-[var(--color-border-subtle)] bg-slate-50">
                    <CheckoutButton qbankId={qbank.id} />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
