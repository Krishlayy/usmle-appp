'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GraduationCap, Clock, Loader2 } from 'lucide-react';
import { QuickPracticeModal, QBankData } from './QuickPracticeModal';

interface QuickPracticeButtonsProps {
  qbank: QBankData;
}

export function QuickPracticeButtons({ qbank }: QuickPracticeButtonsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'tutor' | 'timed'>('tutor');
  const [loadingMode, setLoadingMode] = useState<'tutor' | 'timed' | null>(null);

  useEffect(() => {
    const openParam = searchParams.get('openPractice');
    if (openParam === 'tutor' || openParam === 'timed') {
      setSelectedMode(openParam);
      setIsModalOpen(true);
    }
  }, [searchParams]);

  const totalQuestions = qbank.totalQuestions || 50;

  const startDirectBlock = async (mode: 'tutor' | 'timed') => {
    setLoadingMode(mode);
    try {
      const res = await fetch('/api/test-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qbankSlug: qbank.slug,
          mode,
          questionCount: totalQuestions,
          filter: 'all',
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create block');
      }

      const { sessionId, qbankSlug } = await res.json();
      router.push(`/dashboard/${qbankSlug || qbank.slug}/test/${sessionId}`);
    } catch {
      // Fallback: open modal if direct start fails
      setLoadingMode(null);
      setSelectedMode(mode);
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={() => startDirectBlock('tutor')}
          disabled={loadingMode !== null}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-bold shadow-2xs transition-all hover:scale-105 disabled:opacity-60 cursor-pointer"
        >
          {loadingMode === 'tutor' ? (
            <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
          ) : (
            <GraduationCap className="w-4 h-4 text-teal-600" />
          )}
          <span>Tutor Mode</span>
        </button>

        <button
          type="button"
          onClick={() => startDirectBlock('timed')}
          disabled={loadingMode !== null}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-teal-700/20 transition-all hover:scale-105 disabled:opacity-60 cursor-pointer"
        >
          {loadingMode === 'timed' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Clock className="w-4 h-4" />
          )}
          <span>Timed Mode</span>
        </button>
      </div>

      <QuickPracticeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        qbank={qbank}
        defaultMode={selectedMode}
      />
    </>
  );
}
