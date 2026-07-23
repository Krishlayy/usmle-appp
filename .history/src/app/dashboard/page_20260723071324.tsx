import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { CheckoutButton } from '@/components/CheckoutButton';
import { getCachedOrFetch } from '@/lib/redis';
import { ArrowRight, Bell, CircleUserRound, Lock, ShieldCheck, Unlock } from 'lucide-react';

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
  const navItems = [
    { label: 'Dashboard', href: '/dashboard' },
    ...(isAdmin ? [{ label: 'Admin', href: '/admin' }] : []),
    { label: 'Log Out', href: '/login' },
  ];
  const utilityItems = [
    { label: 'Alerts', href: '#' },
    { label: 'Account', href: '#' },
  ];
  const footerLinks = [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Support', href: '#' },
    { label: 'Contact', href: '#' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1a1a1a] flex flex-col">
      <header className="border-b border-[#E8E8E8] bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-8">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold tracking-tight text-[#1a1a1a]">{brand}</span>
          </div>

          <nav aria-label="Main navigation" className="flex flex-wrap items-center justify-center gap-4 text-sm text-[#666]">
            {navItems.map((item) => (
              <Link key={item.label} href={item.href} className="transition-colors hover:text-[#1a1a1a]">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center justify-end gap-3">
            {utilityItems.map((item) => (
              <Link key={item.label} href={item.href} className="flex items-center gap-2 rounded-full border border-[#E8E8E8] bg-[#FAFAFA] px-3 py-2 text-sm text-[#999] transition-colors hover:text-[#1a1a1a]">
                {item.label === 'Alerts' ? <Bell className="h-4 w-4" /> : <CircleUserRound className="h-4 w-4" />}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-10 md:px-8 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8">
          <section className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]">My Dashboard</h1>
            <p className="text-[var(--color-text-secondary)]">Welcome back, {displayName}</p>
          </section>

          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-[var(--color-border-subtle)] pb-3">
              <Unlock className="h-5 w-5 text-[var(--color-text-secondary)]" />
              <h2 className="m-0 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">Active Subscriptions</h2>
            </div>

            {purchases.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-border-subtle)] bg-white p-10 text-center">
                <Lock className="mb-4 h-12 w-12 stroke-[1.5px] text-[var(--color-text-muted)]" />
                <h3 className="mb-2 text-xl font-semibold text-[var(--color-text-primary)]">No active QBanks</h3>
                <p className="max-w-md text-[var(--color-text-secondary)]">You haven&apos;t unlocked any question banks yet. Browse the store below to start practicing.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {purchases.map(({ qbank }, index) => {
                  const attemptedCount = analyticsMap[qbank.id]?.attempted.size || 0;
                  const totalCount = qbank.totalQuestions || 1;
                  const percentage = Math.round((attemptedCount / totalCount) * 100);
                  const displayPercentage = Math.min(percentage, 100);

                  return (
                    <article
                      key={qbank.id}
                      className="flex flex-col gap-4 rounded-2xl border border-[var(--color-border-subtle)] bg-white p-6 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">{qbank.title}</h3>
                        <span className="inline-flex items-center rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-surface-subtle)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                          {qbank.specialtyTag}
                        </span>
                      </div>

                      <div className="mt-auto flex flex-col gap-3">
                        <div className="flex items-center justify-between text-sm font-semibold text-[var(--color-text-secondary)]">
                          <span>Completion</span>
                          <span className="text-[var(--color-text-primary)]">{displayPercentage}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-border-subtle)]">
                          <div className="h-full rounded-full bg-[var(--color-primary)]" style={{ width: `${displayPercentage}%` }} />
                        </div>
                        <p className="text-right text-sm font-medium text-[var(--color-text-secondary)]">{attemptedCount} / {qbank.totalQuestions} Questions</p>
                      </div>

                      <Link href={`/dashboard/${qbank.slug}`} className="mt-auto block">
                        <span className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-hover)]">
                          <span>Go to Analytics & Practice</span>
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </Link>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-[var(--color-border-subtle)] pb-3">
              <Lock className="h-5 w-5 text-[var(--color-text-secondary)]" />
              <h2 className="m-0 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">Available to Unlock</h2>
            </div>

            {availableQbanks.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-border-subtle)] bg-white p-10 text-center">
                <ShieldCheck className="mb-4 h-12 w-12 text-[var(--color-primary)]" />
                <h3 className="mb-2 text-xl font-semibold text-[var(--color-text-primary)]">You own all available question banks!</h3>
                <p className="max-w-lg text-[var(--color-text-secondary)]">Great work—there are no additional banks to unlock right now. Keep practicing your current subscriptions.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {availableQbanks.map((qbank) => (
                  <div key={qbank.id} className="flex flex-col rounded-2xl border border-[var(--color-border-subtle)] bg-white shadow-sm transition-colors hover:border-[var(--color-primary)]">
                    <div className="flex flex-1 flex-col gap-4 p-6">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">{qbank.title}</h3>
                        <span className="inline-flex items-center rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-surface-subtle)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                          {qbank.specialtyTag}
                        </span>
                      </div>
                      <p className="mt-auto text-sm leading-relaxed text-[var(--color-text-secondary)]">{qbank.description}</p>
                    </div>
                    <div className="flex flex-col gap-4 border-t border-[var(--color-border-subtle)] bg-[var(--color-surface-subtle)] px-6 py-5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-[var(--color-text-secondary)]">{qbank.totalQuestions} Questions</span>
                        <span className="text-2xl font-bold text-[var(--color-text-primary)]">${(qbank.price / 100).toFixed(2)}</span>
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

      <footer className="border-t border-[var(--color-border-subtle)] bg-white/95">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 md:flex-row md:items-center md:justify-between md:px-8">
          <p className="text-sm text-[var(--color-text-secondary)]">
            <span className="font-semibold text-[var(--color-text-primary)]">{brand}</span> © 2026. All rights reserved.
          </p>
          <nav aria-label="Footer links" className="flex flex-wrap items-center gap-4 text-sm text-[var(--color-text-secondary)]">
            {footerLinks.map((item) => (
              <Link key={item.label} href={item.href} className="transition-colors hover:text-[var(--color-text-primary)]">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
