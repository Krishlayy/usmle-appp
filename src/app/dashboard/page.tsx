import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { CheckoutButton } from '@/components/CheckoutButton';
import { getCachedOrFetch } from '@/lib/redis';
import { DashboardQBanksGrid } from '@/components/DashboardQBanksGrid';
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

  const isAdmin = ['ADMIN', 'SUPERADMIN'].includes(session.user.role);

  const purchases = await prisma.purchase.findMany({
    where: { userId: session.user.id, status: 'active' },
    include: { qbank: true },
  });

  // Ensure all active curriculum question banks are unlocked and directly accessible
  const purchasedQbankIds = allActiveQbanks.map(q => q.id);
  const displayPurchases = allActiveQbanks.map(qbank => ({ qbankId: qbank.id, qbank }));
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

  const displayName = session.user.name || session.user.email?.split('@')[0] || 'there';

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
      <div className="flex-1 px-5 pb-20 pt-16 md:px-10 md:pt-24">
        <div className="mx-auto flex max-w-6xl flex-col gap-20">

          {/* Greeting */}
          <section className="flex flex-col gap-10">
            <Reveal>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200/90 bg-teal-50 px-3 py-0.5 font-mono text-[10px] uppercase tracking-wider text-teal-800 font-semibold shadow-2xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-600 animate-pulse" />
                  Clinical Candidate Portal
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-slate-600">
                  Step 1 &amp; Step 2 CK Ready
                </span>
              </div>
              <h1 className="max-w-3xl font-serif text-4xl font-medium leading-[1.1] tracking-tight text-slate-900 md:text-6xl">
                Welcome back, {displayName}.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
                Short vignettes. High-yield video mnemonics. Full FRED v2 examination conditions. Pick up where you left off.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href="/simulator"
                  className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white shadow-xs transition-all duration-200 hover:bg-teal-800 hover:shadow-md cursor-pointer"
                >
                  Resume your last test
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/#qbanks"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
                >
                  Explore All Curriculum Banks
                </Link>
              </div>
            </Reveal>

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
                    {displayPurchases.length} / 4 Banks
                  </dd>
                  <p className="mt-1 text-[11px] text-emerald-600 font-semibold">100% Core Curriculum Access</p>
                </div>
              </dl>
            </Reveal>
          </section>

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
