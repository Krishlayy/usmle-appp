import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { CheckoutButton } from '@/components/CheckoutButton';
import { getCachedOrFetch } from '@/lib/redis';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Lock, Unlock } from 'lucide-react';

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

  userProgress.forEach(progress => {
    if (analyticsMap[progress.qbankId]) {
      analyticsMap[progress.qbankId].attempted.add(progress.questionId);
      if (progress.isCorrect) {
        analyticsMap[progress.qbankId].correct.add(progress.questionId);
      }
    }
  });

  return (
    <div className="container mx-auto py-12 px-4 md:px-8 max-w-7xl animate-page-enter">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
        <div>
          <h1 className="text-scale-2xl text-primary mb-2">My Dashboard</h1>
          <p className="text-scale-base text-secondary font-medium">Welcome back, {session.user.name || session.user.email?.split('@')[0]}</p>
        </div>
      </div>

      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6 border-b border-[var(--color-border-subtle)] pb-4">
          <Unlock className="w-5 h-5 text-primary" />
          <h2 className="text-scale-lg text-primary tracking-tight m-0">Active Subscriptions</h2>
        </div>
        
        {purchases.length === 0 ? (
          <Card elevation="subtle" className="p-12 text-center flex flex-col items-center justify-center bg-[var(--color-surface-subtle)]">
            <Lock className="w-12 h-12 text-muted mb-4 stroke-[1.5px]" />
            <h3 className="text-scale-lg text-primary mb-2">No active QBanks</h3>
            <p className="text-scale-base text-secondary max-w-md">You haven&apos;t unlocked any question banks yet. Browse the store below to start practicing.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {purchases.map(({ qbank }) => {
              const attemptedCount = analyticsMap[qbank.id]?.attempted.size || 0;
              const totalCount = qbank.totalQuestions || 1; // avoid div by 0
              const percentage = Math.round((attemptedCount / totalCount) * 100);
              const displayPercentage = Math.min(percentage, 100);

              return (
              <Card key={qbank.id} elevation="elevated" className="group flex flex-col hover:-translate-y-1 transition-transform duration-300">
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-scale-lg font-bold text-primary group-hover:text-accent transition-colors">{qbank.title}</h3>
                    <span className="inline-flex items-center rounded-md bg-[var(--color-surface-subtle)] px-2.5 py-1 text-scale-xs font-semibold text-secondary border border-[var(--color-border-subtle)]">
                      {qbank.specialtyTag}
                    </span>
                  </div>
                  
                  <div className="mt-auto">
                    <div className="flex justify-between text-scale-sm mb-3 font-semibold">
                      <span className="text-secondary">Completion</span>
                      <span className="text-primary">{displayPercentage}%</span>
                    </div>
                    <div className="w-full bg-[var(--color-border-subtle)] h-2 rounded-full overflow-hidden">
                      <div className="bg-[var(--color-primary)] h-full transition-all duration-1000 ease-out rounded-full" style={{ width: `${displayPercentage}%` }}></div>
                    </div>
                    <p className="text-scale-xs text-muted mt-3 text-right font-medium">{attemptedCount} / {qbank.totalQuestions} Questions</p>
                  </div>
                </div>
                <div className="px-6 py-5 border-t border-[var(--color-border-subtle)] bg-[var(--color-surface-subtle)] mt-auto">
                  <Link href={`/dashboard/${qbank.slug}`} className="w-full block">
                    <Button variant="primary" className="w-full gap-2">
                      Go to Analytics & Practice <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            )})}
          </div>
        )}
      </section>

      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6 border-b border-[var(--color-border-subtle)] pb-4">
          <Lock className="w-5 h-5 text-primary" />
          <h2 className="text-scale-lg text-primary tracking-tight m-0">Available to Unlock</h2>
        </div>
        
        {availableQbanks.length === 0 ? (
          <Card elevation="subtle" className="p-8 text-center text-secondary bg-[var(--color-surface-subtle)] font-medium">
            You own all available question banks!
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableQbanks.map((qbank) => (
              <Card key={qbank.id} elevation="subtle" className="flex flex-col hover:border-[var(--color-primary)] transition-colors duration-200">
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-scale-lg font-bold text-primary">{qbank.title}</h3>
                    <span className="inline-flex items-center rounded-md bg-[var(--color-surface-subtle)] px-2.5 py-1 text-scale-xs font-semibold text-secondary border border-[var(--color-border-subtle)]">
                      {qbank.specialtyTag}
                    </span>
                  </div>
                  <p className="text-secondary text-scale-sm mt-auto mb-2 line-clamp-3 leading-relaxed">
                    {qbank.description}
                  </p>
                </div>
                <div className="px-6 py-5 border-t border-[var(--color-border-subtle)] bg-[var(--color-surface-subtle)] flex flex-col gap-4 mt-auto">
                  <div className="flex items-center justify-between">
                    <span className="text-scale-sm font-semibold text-secondary">{qbank.totalQuestions} Questions</span>
                    <span className="text-scale-xl font-bold text-primary">${(qbank.price / 100).toFixed(2)}</span>
                  </div>
                  <CheckoutButton qbankId={qbank.id} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
