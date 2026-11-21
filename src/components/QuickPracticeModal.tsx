'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  X, 
  GraduationCap, 
  Clock, 
  ArrowRight, 
  Loader2,
  ShieldCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

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

  return (
    <div className="fixed inset-0 z-[999999] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-page-enter">
      {/* Backdrop click handler */}
      <div className="fixed inset-0" onClick={() => !isLoading && onClose()} />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-slate-200/90 shadow-2xl overflow-hidden z-10 flex flex-col transition-all">
        
        {/* Top Header */}
        <div className="flex items-start justify-between p-6 bg-slate-50/90 border-b border-slate-200">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[11px] font-bold border border-teal-200/80 font-mono">
                <ShieldCheck className="w-3 h-3 text-teal-600" />
                {qbank.specialtyTag || 'Clinical Q-Bank'}
              </span>
              <span className="text-xs text-slate-500 font-semibold font-mono">
                {totalQuestions} Board-Style Items
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 tracking-tight">
              {qbank.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-rose-600 hover:text-rose-900 font-bold ml-2">✕</button>
            </div>
          )}

          {/* Practice Mode Selector: Tutor vs Timed */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-3">
              Select Examination Mode
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tutor Mode Card */}
              <div
                onClick={() => setMode('tutor')}
                className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  mode === 'tutor'
                    ? 'border-teal-600 bg-teal-50/60 shadow-sm ring-2 ring-teal-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shadow-2xs">
                    <GraduationCap className="w-5 h-5 text-teal-700" />
                  </div>
                  {mode === 'tutor' && (
                    <span className="text-[10px] font-bold text-teal-800 bg-teal-100 border border-teal-300 px-2 py-0.5 rounded-full font-mono">
                      SELECTED
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-900 mb-1">Tutor Mode</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    Untimed study. Distractor rationales, verified comparison tables, and visual mnemonics revealed immediately after submitting each question.
                  </p>
                </div>

                <div className="mt-4 pt-2.5 border-t border-teal-100/70 flex items-center gap-1.5 text-[11px] text-teal-800 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>Instant Answers &amp; Mnemonics</span>
                </div>
              </div>

              {/* Timed Mode Card */}
              <div
                onClick={() => setMode('timed')}
                className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  mode === 'timed'
                    ? 'border-cyan-600 bg-cyan-50/60 shadow-sm ring-2 ring-cyan-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center shadow-2xs">
                    <Clock className="w-5 h-5 text-cyan-700" />
                  </div>
                  {mode === 'timed' && (
                    <span className="text-[10px] font-bold text-cyan-800 bg-cyan-100 border border-cyan-300 px-2 py-0.5 rounded-full font-mono">
                      SELECTED
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-900 mb-1">Timed Mode</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    Authentic exam conditions. 90 seconds per item countdown. Explanations and performance metrics unlock upon block submission.
                  </p>
                </div>

                <div className="mt-4 pt-2.5 border-t border-cyan-100/70 flex items-center gap-1.5 text-[11px] text-cyan-800 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Board Pacing &amp; Clock</span>
                </div>
              </div>
            </div>
          </div>

          {/* Block Overview Pill */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
            <span className="font-medium">Total Block Curriculum:</span>
            <span className="font-bold text-slate-900 font-mono">Full {totalQuestions} Questions</span>
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleStartBlock}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-teal-700/25 transition-all hover:scale-105 inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Launching {totalQuestions} Items...</span>
              </>
            ) : (
              <>
                <span>Start {totalQuestions}-Question Block</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
