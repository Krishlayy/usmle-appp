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
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={() => startDirectBlock('tutor')}
          disabled={loadingMode !== null}
          className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-800 transition-colors hover:border-slate-300 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600 disabled:opacity-60"
        >
          {loadingMode === 'tutor' ? (
            <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden />
          ) : (
            <GraduationCap className="h-4 w-4" aria-hidden />
          )}
          <span>Tutor Mode</span>
        </button>

        <button
          type="button"
          onClick={() => startDirectBlock('timed')}
          disabled={loadingMode !== null}
          className="inline-flex items-center gap-2 rounded-md bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600 disabled:opacity-60"
        >
          {loadingMode === 'timed' ? (
            <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden />
          ) : (
            <Clock className="h-4 w-4" aria-hidden />
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