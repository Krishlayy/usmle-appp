import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { CheckoutButton } from '@/components/CheckoutButton';
import { getCachedOrFetch } from '@/lib/redis';
import { ArrowRight, Lock, Check } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-6 md:px-12 font-sans antialiased">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-1">
            My Dashboard
          </h1>
          <p className="text-sm sm:text-base font-medium text-gray-500">
            Welcome back, {session.user.name || 'Dr. Khare'}
          </p>
        </header>

        {/* ACTIVE SUBSCRIPTIONS */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Lock className="w-4 h-4 text-gray-500" />
            <h2 className="text-xs font-bold text-gray-500 tracking-wider uppercase">
              ACTIVE SUBSCRIPTIONS
            </h2>
          </div>

          {purchases.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200/80 p-12 text-center">
              <p className="text-sm font-semibold text-gray-500">
                No active subscriptions found. Unlock a question bank below to begin.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {purchases.map(({ qbank }) => {
                const attemptedCount = analyticsMap[qbank.id]?.attempted.size || 0;
                const totalCount = qbank.totalQuestions || 1;
                const percentage = Math.round((attemptedCount / totalCount) * 100);
                const displayPercentage = Math.min(percentage, 100);

                return (
                  <div key={qbank.id} className="bg-white rounded-2xl border border-gray-200/90 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {qbank.title}
                      </h3>
                      <span className="inline-block px-3 py-1 rounded-full bg-[#E2E8F0]/70 text-[#475569] text-[11px] font-bold tracking-wider uppercase mb-6">
                        {qbank.specialtyTag}
                      </span>
                    </div>

                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">
                          COMPLETION
                        </span>
                        <span className="text-sm font-bold text-gray-900">
                          {displayPercentage}%
                        </span>
                      </div>

                      <div className="relative w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mb-2">
                        <div
                          className="bg-[#3B9793] h-full rounded-full transition-all duration-500"
                          style={{ width: `${displayPercentage}%` }}
                        />
                      </div>

                      <p className="text-xs font-semibold text-gray-400 text-right">
                        {attemptedCount} / {qbank.totalQuestions} Questions
                      </p>
                    </div>

                    <Link
                      href={`/dashboard/${qbank.slug}`}
                      className="w-full h-11 rounded-full bg-[#3B9793] hover:bg-[#31827E] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-xs"
                    >
                      <span>Go to Analytics & Practice</span>
                      <ArrowRight className="w-4 h-4 text-white" />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* AVAILABLE TO UNLOCK */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Lock className="w-4 h-4 text-gray-500" />
            <h2 className="text-xs font-bold text-gray-500 tracking-wider uppercase">
              AVAILABLE TO UNLOCK
            </h2>
          </div>

          {availableQbanks.length === 0 ? (
            <div className="bg-[#F1F5F9]/50 border border-gray-200/60 rounded-2xl p-12 md:p-16 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 mb-4">
                <Check className="w-5 h-5 text-gray-500" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-700 mb-2">
                You own all available question banks!
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 font-medium max-w-md mx-auto leading-relaxed">
                Check back later for new modules or contact support if you believe a module is missing from your account.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableQbanks.map((qbank) => (
                <div key={qbank.id} className="bg-white rounded-2xl border border-gray-200/90 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{qbank.title}</h3>
                    <span className="inline-block px-3 py-1 rounded-full bg-[#E2E8F0]/70 text-[#475569] text-[11px] font-bold tracking-wider uppercase mb-4">
                      {qbank.specialtyTag}
                    </span>
                    <p className="text-xs text-gray-500 leading-relaxed mb-6 line-clamp-3">
                      {qbank.description}
                    </p>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-bold text-gray-400 uppercase">PRICE</span>
                      <span className="text-lg font-extrabold text-gray-900">${(qbank.price / 100).toFixed(2)}</span>
                    </div>
                    <CheckoutButton qbankId={qbank.id} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
