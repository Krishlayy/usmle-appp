'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, GraduationCap, Clock, ArrowRight, Loader2 } from 'lucide-react';

export interface QBankData {
  id: string;
  title: string;
  slug: string;
  description?: string;
  totalQuestions: number;
  specialtyTag: string;
  completionPercentage?: number;
  accuracy?: number;
  attemptedCount?: number;
}

interface QuickPracticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  qbank: QBankData | null;
  defaultMode?: 'tutor' | 'timed';
}

export function QuickPracticeModal({ isOpen, onClose, qbank, defaultMode = 'tutor' }: QuickPracticeModalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<'tutor' | 'timed'>(defaultMode);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync mode and reset state on opening
  useEffect(() => {
    if (isOpen && qbank) {
      setError(null);
      setIsLoading(false);
      setMode(defaultMode);
    }
  }, [isOpen, qbank, defaultMode]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen || !qbank) return null;

  const totalQuestions = qbank.totalQuestions || 50;

  const handleStartBlock = async () => {
    setIsLoading(true);
    setError(null);

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
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to initialize clinical test session.');
      }

      const { sessionId, qbankSlug } = await res.json();
      router.push(`/dashboard/${qbankSlug || qbank.slug}/test/${sessionId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to start test session. Please try again.');
      setIsLoading(false);
    }
  };

  const modes = [
    {
      id: 'tutor' as const,
      Icon: GraduationCap,
      title: 'Tutor Mode',
      body: 'Untimed study. Distractor rationales, verified comparison tables, and visual mnemonics revealed immediately after submitting each question.',
      foot: 'Instant Answers & Mnemonics',
    },
    {
      id: 'timed' as const,
      Icon: Clock,
      title: 'Timed Mode',
      body: 'Authentic exam conditions. 90 seconds per item countdown. Explanations and performance metrics unlock upon block submission.',
      foot: 'Board Pacing & Clock',
    },
  ];

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center overflow-y-auto bg-slate-100 p-4 backdrop-blur-sm sm:p-6">
      {/* Backdrop click handler */}
      <div className="fixed inset-0" onClick={() => !isLoading && onClose()} />

      {/* Modal panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-practice-title"
        className="relative z-10 flex w-full max-w-lg flex-col rounded-lg border border-slate-200 bg-white text-slate-900"
      >
        <div className="flex items-start justify-between border-b border-slate-200 p-6">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-teal-700">
              {qbank.specialtyTag || 'Clinical Q-Bank'}
              <span className="text-slate-500"> &middot; <span className="tabular-nums">{totalQuestions}</span> Board-Style Items</span>
            </p>
            <h2 id="quick-practice-title" className="mt-3 font-serif text-2xl font-medium tracking-tight text-slate-900">
              {qbank.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-md p-1.5 text-slate-600 transition-colors hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600"
            title="Close (Esc)"
            aria-label="Close"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="space-y-6 p-6">
          {error && (
            <div role="alert" className="flex items-center justify-between rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span>{error}</span>
              <button type="button" onClick={() => setError(null)} aria-label="Dismiss error" className="ml-2 text-red-700 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600">
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
          )}

          <div role="radiogroup" aria-labelledby="quick-practice-mode-label">
            <p id="quick-practice-mode-label" className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-600">
              Select Examination Mode
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {modes.map(({ id, Icon, title, body, foot }) => {
                const selected = mode === id;
                return (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setMode(id)}
                    className={`flex flex-col justify-between rounded-lg border p-5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300 ${
                      selected
                        ? 'border-teal-600 bg-slate-100'
                        : 'border-slate-200 bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <Icon className={`h-5 w-5 ${selected ? 'text-teal-700' : 'text-slate-400'}`} strokeWidth={1.75} aria-hidden />
                      {selected && (
                        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-teal-700">Selected</span>
                      )}
                    </div>
                    <div>
                      <h4 className="mb-1 font-serif text-lg font-medium text-slate-900">{title}</h4>
                      <p className="text-xs leading-relaxed text-slate-600">{body}</p>
                    </div>
                    <p className="mt-4 border-t border-slate-200 pt-3 text-[11px] text-slate-700">{foot}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between border-y border-slate-200 py-3 text-xs text-slate-600">
            <span>Total Block Curriculum</span>
            <span className="font-mono tabular-nums text-slate-900">Full {totalQuestions} Questions</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 p-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-md border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-800 transition-colors hover:border-slate-300 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600 disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleStartBlock}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600 disabled:pointer-events-none disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden />
                <span>Launching {totalQuestions} Items...</span>
              </>
            ) : (
              <>
                <span>Start {totalQuestions}-Question Block</span>
                <ArrowRight className="h-4 w-4" aria-hidden />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}