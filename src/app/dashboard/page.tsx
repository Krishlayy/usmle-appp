import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { CheckoutButton } from '@/components/CheckoutButton';
import { getCachedOrFetch } from '@/lib/redis';
import { DashboardQBanksGrid } from '@/components/DashboardQBanksGrid';
import { DashboardHeroSection } from '@/components/dashboard/DashboardHeroSection';
import { Reveal } from '@/components/ui/Reveal';
import { ArrowUpRight } from 'lucide-react';

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

  const isStaff = ['ADMIN', 'SUPERADMIN'].includes(session.user.role);

  // Check onboarding status for candidates
  const userProfile = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingCompleted: true, preferredName: true, role: true },
  });

  if (!isStaff && userProfile && !userProfile.onboardingCompleted) {
    redirect('/onboarding');
  }

  const purchases = await prisma.purchase.findMany({
    where: { userId: session.user.id, status: 'active' },
    include: { qbank: true },
  });

  // For ADMIN/SUPERADMIN, provide access to all banks for quality checks.
  // For students, ONLY banks with an active purchase in the database are unlocked.
  const realPurchasedQbankIds = purchases.map(p => p.qbankId);
  const purchasedQbankIds = isStaff ? allActiveQbanks.map(q => q.id) : realPurchasedQbankIds;

  const displayPurchases = isStaff
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

  // Serialized for Client Components
  const serializedAnalyticsMap: Record<string, { attempted: string[]; correct: string[] }> = {};
  purchasedQbankIds.forEach(id => {
    serializedAnalyticsMap[id] = {
      attempted: Array.from(analyticsMap[id]?.attempted || []),
      correct: Array.from(analyticsMap[id]?.correct || []),
    };
  });

  const displayName = userProfile?.preferredName || session.user.name || session.user.email?.split('@')[0] || 'there';

  const totalAnswered = purchasedQbankIds.reduce((acc, id) => acc + (analyticsMap[id]?.attempted.size || 0), 0);
  const totalCorrect = purchasedQbankIds.reduce((acc, id) => acc + (analyticsMap[id]?.correct.size || 0), 0);
  const overallAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  const footerLinks = [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Support', href: 'mailto:support@microqbank.com' },
    { label: 'Contact', href: 'mailto:contact@microqbank.com' },
  ];

  const stats = [
    { label: 'Answered', value: totalAnswered.toLocaleString() },
    { label: 'Accuracy', value: `${overallAccuracy}%` },
    { label: 'Banks unlocked', value: String(displayPurchases.length) },
  ];

  return (
    <div className="relative flex min-h-screen flex-col bg-white text-slate-900">
      {/* Subtle medical ambient glow & micro-grid */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-50/50 via-white to-white" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px] opacity-40" />

      {/* The global Navbar comes from LayoutUIWrapper; root layout owns <main>. */}
      <div className="flex-1 px-5 pb-20 pt-10 md:px-10 md:pt-14">
        <div className="mx-auto flex max-w-6xl flex-col gap-16">

          {/* Hero Video & Welcome Section */}
          <DashboardHeroSection displayName={displayName} />

          {/* Candidate Clinical Performance Telemetry */}
          <Reveal delay={0.1}>
            <dl className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs sm:grid-cols-3 sm:divide-x sm:divide-slate-200">
              <div className="px-3 py-2 first:pl-0 sm:px-6">
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">Questions Solved</dt>
                <dd className="mt-2 font-mono text-3xl font-bold tabular-nums text-slate-900 md:text-4xl">
                  {totalAnswered.toLocaleString()}
                </dd>
                <p className="mt-1 text-[11px] text-slate-400 font-medium">Cumulative vignettes completed</p>
              </div>
              <div className="px-3 py-2 sm:px-6">
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">Overall Accuracy</dt>
                <dd className="mt-2 font-mono text-3xl font-bold tabular-nums text-teal-700 md:text-4xl">
                  {overallAccuracy}%
                </dd>
                <p className="mt-1 text-[11px] text-slate-400 font-medium">Target threshold &ge; 70%</p>
              </div>
              <div className="px-3 py-2 sm:px-6">
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">Curriculum Unlocked</dt>
                <dd className="mt-2 font-mono text-3xl font-bold tabular-nums text-slate-900 md:text-4xl">
                  {displayPurchases.length} / {allActiveQbanks.length} Banks
                </dd>
                <p className={`mt-1 text-[11px] font-semibold ${displayPurchases.length === allActiveQbanks.length ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {displayPurchases.length === allActiveQbanks.length ? '100% Core Curriculum Access' : `${allActiveQbanks.length - displayPurchases.length} module(s) available to unlock`}
                </p>
              </div>
            </dl>
          </Reveal>

          {/* Your QBanks */}
          <section className="flex flex-col gap-6">
            <Reveal>
              <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-slate-600">Your question banks</h2>
            </Reveal>

            {displayPurchases.length === 0 ? (
              <Reveal>
                <div className="rounded-lg border border-dashed border-slate-200 p-12 text-center">
                  <h3 className="font-serif text-xl text-slate-900">No active question banks</h3>
                  <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
                    Unlock a bank below to start practicing.
                  </p>
                </div>
              </Reveal>
            ) : (
              <DashboardQBanksGrid purchases={displayPurchases} analyticsMap={serializedAnalyticsMap} />
            )}
          </section>

          {/* Available to unlock (only shown if unowned banks exist) */}
          {availableQbanks.length > 0 && (
            <section className="flex flex-col gap-6">
              <Reveal>
                <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-slate-600">Available to unlock</h2>
              </Reveal>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {availableQbanks.map((qbank, i) => (
                  <Reveal key={qbank.id} delay={Math.min(i, 5) * 0.05}>
                    <article className="flex h-full flex-col justify-between gap-6 rounded-lg border border-slate-200 bg-white shadow-sm p-6 transition-colors hover:border-slate-300">
                      <div>
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="font-serif text-lg leading-snug text-slate-900">{qbank.title}</h3>
                          <span className="whitespace-nowrap font-mono text-[11px] uppercase tracking-wider text-teal-700">
                            {qbank.specialtyTag}
                          </span>
                        </div>
                        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600">{qbank.description}</p>
                      </div>
                      <div className="flex flex-col gap-4">
                        <div className="flex items-baseline justify-between border-t border-slate-200 pt-4">
                          <span className="font-mono text-2xl text-slate-900">${(qbank.price / 100).toFixed(2)}</span>
                          <span className="text-xs text-slate-500">{qbank.totalQuestions} questions</span>
                        </div>
                        <CheckoutButton qbankId={qbank.id} />
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <footer className="border-t border-slate-200">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between md:px-10">
          <p>
            <span className="text-slate-700">Micro Q-Bank</span> © {new Date().getFullYear()}
          </p>
          <nav aria-label="Footer links" className="flex items-center gap-6">
            {footerLinks.map((item) => (
              <Link key={item.label} href={item.href} className="transition-colors hover:text-slate-900">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
