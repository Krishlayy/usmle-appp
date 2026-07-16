import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { CheckoutButton } from '@/components/CheckoutButton';
import { getCachedOrFetch } from '@/lib/redis';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    redirect('/login');
  }

  const purchases = await prisma.purchase.findMany({
    where: { userId: session.user.id, status: 'active' },
    include: { qbank: true },
  });

  const purchasedQbankIds = purchases.map((p) => p.qbankId);

  const allActiveQbanks = await getCachedOrFetch(
    'qbanks:active',
    () => prisma.qBank.findMany({
      where: { isActive: true },
      orderBy: { title: 'asc' },
    }),
    3600
  );

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
    <div className="container mx-auto py-12 px-4 md:px-6 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">My Dashboard</h1>
          <p className="text-slate-500 font-medium">Welcome back, {session.user.name || session.user.email?.split('@')[0]}</p>
        </div>
      </div>

      <section className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-bold text-black tracking-tight">Active Subscriptions</h2>
        </div>
        
        {purchases.length === 0 ? (
          <div className="glass-panel rounded-xl p-12 text-center flex flex-col items-center justify-center">
            <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="text-lg font-bold text-slate-700 mb-2">No active QBanks</h3>
            <p className="text-slate-500 max-w-md">You haven&apos;t unlocked any question banks yet. Browse the store below to start practicing.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {purchases.map(({ qbank }) => {
              const attemptedCount = analyticsMap[qbank.id]?.attempted.size || 0;
              const totalCount = qbank.totalQuestions || 1; // avoid div by 0
              const percentage = Math.round((attemptedCount / totalCount) * 100);
              const displayPercentage = Math.min(percentage, 100);

              return (
              <div key={qbank.id} className="clinical-card group flex flex-col overflow-hidden">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{qbank.title}</h3>
                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                      {qbank.specialtyTag}
                    </span>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex justify-between text-sm mb-2 font-medium">
                      <span className="text-gray-500">Completion</span>
                      <span className="text-black">{displayPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-1 overflow-hidden rounded-none">
                      <div className="bg-black h-1 transition-all duration-1000 ease-out" style={{ width: `${displayPercentage}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 text-right">{attemptedCount} / {qbank.totalQuestions} Questions</p>
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-end">
                  <Link
                    href={`/dashboard/${qbank.slug}`}
                    className="inline-flex items-center justify-center bg-black text-white font-medium hover:bg-gray-800 transition-colors px-4 py-2 w-full text-sm"
                  >
                    Go to Analytics & Practice
                  </Link>
                </div>
              </div>
            )})}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-bold text-black tracking-tight">Available to Unlock</h2>
        </div>
        
        {availableQbanks.length === 0 ? (
          <div className="glass-panel rounded-xl p-8 text-center text-slate-500">
            You own all available question banks!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableQbanks.map((qbank) => (
              <div key={qbank.id} className="clinical-card group flex flex-col overflow-hidden bg-white">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-black">{qbank.title}</h3>
                    <span className="inline-flex items-center bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                      {qbank.specialtyTag}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                    {qbank.description}
                  </p>
                </div>
                <div className="px-6 py-5 border-t border-slate-200 bg-white flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-500">{qbank.totalQuestions} Questions</span>
                    <span className="text-lg font-extrabold text-slate-900">${(qbank.price / 100).toFixed(2)}</span>
                  </div>
                  <CheckoutButton qbankId={qbank.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
