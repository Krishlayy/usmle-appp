import Link from 'next/link';
import { prisma } from '@/lib/db';
import { getCachedOrFetch } from '@/lib/redis';
import { Card } from '@/components/ui/Card';
import { Database, ChevronRight, Layers, BarChart, ShieldCheck, CheckCircle2 } from 'lucide-react';

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
    <div className="min-h-screen bg-[#F8FAF9] font-sans pb-24">
      {/* Hero Section */}
      <div className="bg-[#0D4F47] py-20 px-4">
        <div className="container mx-auto max-w-[1200px] text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl text-white mb-6 font-bold tracking-tight">Choose Your Question Bank</h1>
          <p className="text-lg md:text-xl text-teal-100 max-w-2xl mx-auto font-medium">
            Targeted, high-yield question banks designed for USMLE and NBME board preparation. Master your weak points today.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 max-w-[1200px] -mt-12 relative z-10 animate-page-enter">
        {qbanks.length === 0 ? (
          <Card className="text-center py-20 bg-white shadow-sm border-[#E5E7EB] rounded-xl">
            <Database className="mx-auto h-12 w-12 text-[#E5E7EB] mb-4" strokeWidth={1.5} />
            <h3 className="text-xl text-[#111827] mb-2 font-bold">No Modules Available</h3>
            <p className="text-[#6B7280] text-sm font-medium">We are currently preparing new question banks. Please check back soon.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {qbanks.map((qbank) => {
              return (
                <Card key={qbank.id} className="flex flex-col h-full bg-white rounded-xl shadow-sm border-[#E5E7EB] hover:shadow-lg hover:border-[#0D9488]/30 transition-all duration-300 ease-out overflow-hidden group">
                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#0D9488]/10 text-[#0D9488]">
                        {qbank.specialtyTag}
                      </span>
                    </div>
                    
                    <h2 className="text-2xl text-[#111827] mb-3 font-bold leading-tight">{qbank.title}</h2>
                    
                    <p className="text-[#6B7280] text-sm leading-relaxed mb-6 flex-1">
                      {qbank.description}
                    </p>

                    <div className="space-y-3 mb-8">
                      <div className="flex items-center gap-3 text-sm text-[#111827]">
                        <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                        <span className="font-medium">{qbank.totalQuestions} High-Yield Questions</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-[#111827]">
                        <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                        <span>Detailed Explanations</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-[#111827]">
                        <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                        <span>Performance Tracking</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-8 py-6 bg-[#F8FAF9] border-t border-[#E5E7EB] flex items-center justify-between group-hover:bg-[#0D9488]/5 transition-colors">
                    <div className="flex flex-col">
                      <span className="text-xs text-[#6B7280] font-bold uppercase tracking-wider mb-1">Lifetime Access</span>
                      <span className="text-2xl text-[#111827] font-bold tracking-tight">
                        ${(qbank.price / 100).toFixed(2)}
                      </span>
                    </div>
                    <Link href={`/qbanks/${qbank.slug}`}>
                      <button className="bg-[#111827] hover:bg-[#1f2937] text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm">
                        View <ChevronRight className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Trust Signals */}
        <div className="mt-20 pt-10 border-t border-[#E5E7EB]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-4xl mx-auto">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-[#10B981]/10 text-[#10B981] rounded-full flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-[#111827] mb-1">Secure Checkout via Stripe</h4>
              <p className="text-sm text-[#6B7280]">Your payment information is encrypted and secure.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-[#0D9488]/10 text-[#0D9488] rounded-full flex items-center justify-center mb-4">
                <Layers className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-[#111827] mb-1">Lifetime Access</h4>
              <p className="text-sm text-[#6B7280]">Pay once and review the material as long as you need.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-[#3B82F6]/10 text-[#3B82F6] rounded-full flex items-center justify-center mb-4">
                <BarChart className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-[#111827] mb-1">30-Day Money Back</h4>
              <p className="text-sm text-[#6B7280]">Not satisfied? Get a full refund within 30 days.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
