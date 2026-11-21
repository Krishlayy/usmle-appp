'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { GraduationCap, Clock, ArrowRight } from 'lucide-react';
import { QuickPracticeModal, QBankData } from './QuickPracticeModal';

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
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
        {purchases.map(({ qbank }) => {
          const attemptedCount = analyticsMap[qbank.id]?.attempted?.length || 0;
          const correctCount = analyticsMap[qbank.id]?.correct?.length || 0;
          const totalCount = qbank.totalQuestions || 50;
          const percentage = Math.round((attemptedCount / totalCount) * 100);
          const displayPercentage = Math.min(percentage, 100);
          const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;

          return (
            <article
              key={qbank.id}
              className="relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm overflow-hidden transition-all hover:shadow-lg hover:border-teal-500/40 group"
            >
              {/* Left Medical Accent Indicator */}
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-teal-500 to-cyan-600" />

              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="inline-flex items-center rounded-md bg-teal-50 border border-teal-200/80 px-2.5 py-1 text-[11px] font-bold text-teal-800 font-mono">
                    {qbank.specialtyTag}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 font-mono">
                    {totalCount} Questions
                  </span>
                </div>

                {/* QBank Title */}
                <h3 className="text-xl font-bold font-serif text-slate-900 leading-snug group-hover:text-teal-700 transition-colors">
                  {qbank.title}
                </h3>

                {qbank.description && (
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {qbank.description}
                  </p>
                )}
              </div>

              {/* Progress and Stats metrics */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex flex-col">
                    <span className="text-slate-500 font-medium">Completion</span>
                    <span className="font-bold text-slate-900 text-sm">{displayPercentage}%</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-slate-500 font-medium">Accuracy</span>
                    <span className="font-bold text-teal-600 text-sm">{accuracy}%</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-500"
                    style={{ width: `${displayPercentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>{attemptedCount} of {totalCount} items completed</span>
                  <Link
                    href={`/dashboard/${qbank.slug}`}
                    className="text-slate-400 hover:text-slate-700 hover:underline inline-flex items-center gap-1"
                  >
                    <span>View Overview</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Direct Practice Actions: Tutor Mode vs Timed Mode */}
              <div className="mt-5 grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleOpenModal(qbank, 'tutor')}
                  className="flex items-center justify-center gap-2 rounded-xl border border-teal-200 bg-teal-50/70 px-4 py-2.5 text-xs font-bold text-teal-900 shadow-2xs hover:bg-teal-100 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <GraduationCap className="h-4 w-4 text-teal-700" />
                  <span>Tutor Mode</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenModal(qbank, 'timed')}
                  className="flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-teal-700/20 hover:bg-teal-500 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <Clock className="h-4 w-4" />
                  <span>Timed Mode</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Quick Practice Mode Selection Modal */}
      <QuickPracticeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        qbank={selectedQBank}
        defaultMode={selectedMode}
      />
    </>
  );
}
