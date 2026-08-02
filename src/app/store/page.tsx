import Link from 'next/link';
import { prisma } from '@/lib/db';
import { getCachedOrFetch } from '@/lib/redis';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { Database, ChevronRight, BookOpen, Layers, BarChart, ShieldCheck } from 'lucide-react';

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
    <div className="container mx-auto py-16 px-4 md:px-8 max-w-[1440px] animate-page-enter">
      <div className="mb-14 pb-8 border-b border-[var(--color-border-subtle)]">
        <h1 className="text-scale-2xl text-primary mb-4 tracking-tight font-bold">Professional Medical Curriculum</h1>
        <p className="text-scale-lg text-secondary max-w-2xl font-medium leading-relaxed">
          Targeted, high-yield question banks designed for USMLE and NBME board preparation. System-based modules to isolate and master weak points.
        </p>
      </div>
      
      {qbanks.length === 0 ? (
        <Card elevation="subtle" className="text-center py-20 bg-[#111524] border-dashed border-2 border-white/10">
          <Database className="mx-auto h-12 w-12 text-gray-500 mb-4" strokeWidth={1.5} />
          <h3 className="text-scale-lg text-primary mb-2 font-bold font-serif">No Modules Available</h3>
          <p className="text-secondary text-scale-sm font-medium">We are currently preparing new question banks. Please check back soon.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {qbanks.map((qbank) => {
            return (
              <Card key={qbank.id} elevation="subtle" className="flex flex-col h-full group hover:shadow-md hover:border-[var(--color-primary)] transition-all duration-300 ease-out border-[var(--color-border-subtle)]">
                <div className="p-8 flex-1 flex flex-col">
                  
                  <h2 className="text-[20px] text-primary mb-2 font-bold leading-tight font-serif">{qbank.title}</h2>
                  <div className="flex flex-wrap gap-2 mb-6">
                    <Tag variant="accent" size="sm">{qbank.specialtyTag}</Tag>
                  </div>
                  
                  <p className="text-secondary text-[15px] leading-relaxed mb-8 flex-1">
                     {qbank.description}
                  </p>
                  
                  {/* High Density Info Grid */}
                  <div className="grid grid-cols-1 gap-y-4 gap-x-6 text-[13px] font-medium text-secondary bg-[#0a0d14] p-4 rounded-xl border border-[var(--color-border-subtle)]">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-cyan-400" />
                      <span className="text-primary font-bold">{qbank.totalQuestions}</span> Qs
                    </div>
                  </div>
                </div>
                
                <div className="px-8 py-5 border-t border-[var(--color-border-subtle)] bg-[var(--color-surface-subtle)] flex items-center justify-between group-hover:bg-white/5 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-[11px] text-secondary font-bold uppercase tracking-wider mb-0.5">Lifetime License</span>
                    <span className="text-[20px] text-primary font-bold tracking-tight">
                      ${(qbank.price / 100).toFixed(2)}
                    </span>
                  </div>
                  <Link href={`/qbanks/${qbank.slug}`}>
                    <Button variant="primary" className="gap-2 shadow-sm font-semibold">
                      View Curriculum <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
