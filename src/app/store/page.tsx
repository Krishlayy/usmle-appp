import Link from 'next/link';
import { prisma } from '@/lib/db';
import { redis, getCachedOrFetch } from '@/lib/redis';

export const revalidate = 60;

export default async function StorePage() {
  const qbanks = await getCachedOrFetch(
    'qbanks:storefront:active',
    () => prisma.qBank.findMany({
      where: { isActive: true },
      orderBy: { title: 'asc' },
    }),
    60
  );

  return (
    <div className="container mx-auto py-16 px-4 md:px-6 max-w-7xl">
      <div className="mb-12 border-b border-gray-200 pb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-black mb-4">Question Banks</h1>
        <p className="text-lg text-gray-500 max-w-2xl">Browse our collection of high-yield, subject-specific question banks. Pay once, own forever.</p>
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
            <div key={qbank.id} className="clinical-card group flex flex-col overflow-hidden bg-white">
              <div className="p-8 flex-1">
                <div className="flex justify-between items-start mb-6">
                  <div className="inline-flex items-center bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                    {qbank.specialtyTag}
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-black mb-3">{qbank.title}</h2>
                <p className="text-gray-500 text-sm mb-6 line-clamp-3 leading-relaxed">
                  {qbank.description}
                </p>
                
                <div className="flex items-center gap-4 text-sm font-medium text-gray-700">
                  <div className="flex items-center border border-gray-200 px-3 py-1.5 rounded-none">
                    <svg className="mr-2 h-4 w-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {qbank.totalQuestions} Questions
                  </div>
                </div>
              </div>
              <div className="px-8 py-5 border-t border-gray-200 bg-white flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Lifetime Access</span>
                  <span className="text-2xl font-extrabold text-black">
                    ${(qbank.price / 100).toFixed(2)}
                  </span>
                </div>
                <Link
                  href={`/qbanks/${qbank.slug}`}
                  className="inline-flex items-center justify-center bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-all rounded-none"
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
