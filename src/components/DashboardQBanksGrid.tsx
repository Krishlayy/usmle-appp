'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { QuickPracticeModal, QBankData } from './QuickPracticeModal';
import { Reveal } from '@/components/ui/Reveal';

interface DashboardQBanksGridProps {
  purchases: Array<{
    qbankId: string;
    qbank: {
      id: string;
      title: string;
      slug: string;
      description?: string | null;
      totalQuestions: number;
      specialtyTag: string;
    };
  }>;
  analyticsMap: Record<string, { attempted: string[]; correct: string[] }>;
}

export function DashboardQBanksGrid({ purchases, analyticsMap }: DashboardQBanksGridProps) {
  const [selectedQBank, setSelectedQBank] = useState<QBankData | null>(null);
  const [selectedMode, setSelectedMode] = useState<'tutor' | 'timed'>('tutor');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (qbank: DashboardQBanksGridProps['purchases'][0]['qbank'], mode: 'tutor' | 'timed' = 'tutor') => {
    const attempted = analyticsMap[qbank.id]?.attempted?.length || 0;
    const correct = analyticsMap[qbank.id]?.correct?.length || 0;
    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
    const totalCount = qbank.totalQuestions || 50;
    const completionPercentage = Math.min(100, Math.round((attempted / totalCount) * 100));

    setSelectedQBank({
      id: qbank.id,
      title: qbank.title,
      slug: qbank.slug,
      description: qbank.description || undefined,
      totalQuestions: totalCount,
      specialtyTag: qbank.specialtyTag,
      completionPercentage,
      accuracy,
      attemptedCount: attempted,
    });
    setSelectedMode(mode);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        {purchases.map(({ qbank }, i) => {
          const attemptedCount = analyticsMap[qbank.id]?.attempted?.length || 0;
          const correctCount = analyticsMap[qbank.id]?.correct?.length || 0;
          const totalCount = qbank.totalQuestions || 50;
          const displayPercentage = Math.min(Math.round((attemptedCount / totalCount) * 100), 100);
          const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;

          return (
            <Reveal key={qbank.id} delay={Math.min(i, 5) * 0.05}>
              <article className="group flex h-full flex-col justify-between gap-8 rounded-lg border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl transition-colors hover:border-white/25">
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-teal-300/80">
                      {qbank.specialtyTag}
                    </span>
                    <Link
                      href={`/dashboard/${qbank.slug}`}
                      className="inline-flex items-center gap-1 text-xs text-slate-500 transition-colors hover:text-white"
                    >
                      Overview <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </div>
                  <h3 className="mt-3 font-serif text-xl leading-snug text-white">{qbank.title}</h3>
                  {qbank.description && (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-400">{qbank.description}</p>
                  )}
                </div>

                <div className="flex flex-col gap-5">
                  <div>
                    <div className="mb-2 flex items-baseline justify-between text-xs text-slate-500">
                      <span>
                        <span className="font-mono text-sm text-white tabular-nums">{attemptedCount}</span> / {totalCount} done
                      </span>
                      <span>
                        Accuracy <span className="font-mono text-sm text-white tabular-nums">{accuracy}%</span>
                      </span>
                    </div>
                    <div
                      className="h-px w-full bg-white/10"
                      role="progressbar"
                      aria-valuenow={displayPercentage}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${qbank.title} completion`}
                    >
                      <div
                        className="h-px bg-teal-300 transition-[width] duration-700 ease-out"
                        style={{ width: `${displayPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenModal(qbank, 'tutor')}
                      className="rounded-md border border-white/15 px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:border-white/40 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300"
                    >
                      Tutor
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenModal(qbank, 'timed')}
                      className="rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-teal-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300"
                    >
                      Timed
                    </button>
                  </div>
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>

      <QuickPracticeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        qbank={selectedQBank}
        defaultMode={selectedMode}
      />
    </>
  );
}
