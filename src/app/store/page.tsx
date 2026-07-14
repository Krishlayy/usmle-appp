import Link from 'next/link';
import { prisma } from '@/lib/db';
import { redis } from '@/lib/redis';

export const revalidate = 60;

export default async function StorePage() {
  const cacheKey = 'qbanks:storefront:active';
  let qbanks = await redis.get<any[]>(cacheKey);

  if (!qbanks) {
    qbanks = await prisma.qBank.findMany({
      where: { isActive: true },
      orderBy: { title: 'asc' },
    });
    // Cache for 60 seconds to match ISR revalidate time
    await redis.set(cacheKey, qbanks, { ex: 60 });
  }

  return (
    <div className="container mx-auto py-16 px-4 md:px-6 max-w-7xl">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-4">Question Bank Directory</h1>
        <p className="text-lg text-slate-600 max-w-2xl">Browse our collection of high-yield, subject-specific question banks. Pay once, own forever.</p>
      </div>
      
      {qbanks.length === 0 ? (
        <div className="text-center text-slate-500 py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <svg className="mx-auto h-12 w-12 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-lg font-medium text-slate-900">No QBanks Available</h3>
          <p className="mt-1">We are currently preparing new question banks. Please check back soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {qbanks.map((qbank) => (
            <div key={qbank.id} className="clinical-card group flex flex-col overflow-hidden">
              <div className="p-8 flex-1">
                <div className="flex justify-between items-start mb-6">
                  <div className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10">
                    {qbank.specialtyTag}
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">{qbank.title}</h2>
                <p className="text-slate-600 text-sm mb-6 line-clamp-3 leading-relaxed">
                  {qbank.description}
                </p>
                
                <div className="flex items-center gap-4 text-sm font-medium text-slate-700">
                  <div className="flex items-center bg-slate-100 px-3 py-1.5 rounded-md">
                    <svg className="mr-2 h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {qbank.totalQuestions} Questions
                  </div>
                </div>
              </div>
              <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Lifetime Access</span>
                  <span className="text-2xl font-extrabold text-slate-900">
                    ${(qbank.price / 100).toFixed(2)}
                  </span>
                </div>
                <Link
                  href={`/qbanks/${qbank.slug}`}
                  className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
