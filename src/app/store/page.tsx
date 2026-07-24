import Link from 'next/link';
import { prisma } from '@/lib/db';
import { getCachedOrFetch } from '@/lib/redis';
import { Button } from '@/components/ui/Button';
import { Check, Database, ShieldCheck, Zap } from 'lucide-react';

export const revalidate = 60;

export default async function StorePage() {
  const qbanks = await getCachedOrFetch(
    'qbanks:storefront:active',
    async () => {
      try {
        return await prisma.qBank.findMany({
          where: { isActive: true },
          orderBy: { title: 'asc' },
        });
      } catch (error) {
        console.warn('Database unreachable, returning empty QBank list during build/fetch', error);
        return [];
      }
    },
    60
  );

  return (
    <div className="min-h-screen bg-[var(--background)] animate-page-enter py-20 px-4 md:px-8">
      
      {/* SaaS Pricing Header */}
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight mb-4">Transparent, Lifetime Access.</h1>
        <p className="text-lg text-secondary font-medium leading-relaxed">
          No recurring subscriptions. No hidden fees. Pay once for the modules you need and master the curriculum at your own pace.
        </p>
      </div>
      
      {qbanks.length === 0 ? (
        <div className="max-w-3xl mx-auto bg-white border border-[var(--color-border-subtle)] rounded-2xl p-16 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center border border-gray-200 mb-4">
            <Database className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-primary mb-2">No Modules Available</h3>
          <p className="text-secondary font-medium">We are currently preparing new question banks. Please check back soon.</p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-8 items-stretch">
            {qbanks.map((qbank, index) => {
              // Highlight the middle card if there are multiple, or just the first one
              const isPopular = index === 1 || (qbanks.length === 1 && index === 0);

              return (
                <div key={qbank.id} className={`relative flex flex-col w-full max-w-sm rounded-2xl bg-white border ${isPopular ? 'border-blue-600 shadow-lg scale-105 z-10' : 'border-[var(--color-border-subtle)] shadow-sm mt-4 lg:mt-0'} transition-transform duration-300`}>
                  
                  {isPopular && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <span className="bg-blue-600 text-white text-[11px] font-bold uppercase tracking-widest py-1 px-3 rounded-full shadow-sm">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="p-8 flex flex-col items-center text-center border-b border-[var(--color-border-subtle)]">
                    <span className="inline-block bg-gray-100 text-secondary text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-md mb-4">
                      {qbank.specialtyTag}
                    </span>
                    <h2 className="text-2xl font-bold text-primary mb-2 leading-tight">{qbank.title}</h2>
                    <div className="mt-4 flex items-end justify-center gap-1">
                      <span className="text-4xl font-bold text-primary tracking-tighter">${(qbank.price / 100).toFixed(0)}</span>
                      <span className="text-sm font-semibold text-secondary mb-1">.00</span>
                    </div>
                    <span className="text-sm font-semibold text-emerald-600 mt-2 bg-emerald-50 px-2.5 py-0.5 rounded">One-time payment</span>
                  </div>
                  
                  <div className="p-8 flex-1 flex flex-col bg-gray-50/50 rounded-b-2xl">
                    <p className="text-sm text-secondary font-medium leading-relaxed mb-6 text-center">
                      {qbank.description}
                    </p>
                    
                    <ul className="space-y-4 flex-1 mb-8">
                      <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <span className="text-sm font-medium text-primary"><span className="font-bold">{qbank.totalQuestions}</span> High-Yield Questions</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <span className="text-sm font-medium text-primary">In-depth Explanations</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <span className="text-sm font-medium text-primary">Performance Analytics</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <span className="text-sm font-medium text-primary">Lifetime Access</span>
                      </li>
                    </ul>
                    
                    <Link href={`/qbanks/${qbank.slug}`} className="w-full">
                      <Button variant={isPopular ? 'primary' : 'secondary'} className={`w-full py-6 text-sm font-bold shadow-sm ${isPopular ? '' : 'bg-white hover:bg-gray-50'}`}>
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Trust indicators */}
          <div className="mt-20 pt-10 border-t border-[var(--color-border-subtle)] flex flex-col md:flex-row justify-center items-center gap-10 text-center text-sm font-medium text-secondary">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" /> Secure SSL Checkout
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" /> Instant Account Access
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
