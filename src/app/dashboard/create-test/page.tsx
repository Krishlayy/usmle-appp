'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Play, Lock, ShieldCheck, Check, Sparkles, BookOpen, AlertCircle, ShoppingCart } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { CheckoutButton } from '@/components/CheckoutButton';

interface QBankStat {
  id: string;
  title: string;
  slug: string;
  qbankCode: string;
  specialtyTag: string;
  description: string;
  price: number;
  currency: string;
  total: number;
  unused: number;
  incorrect: number;
  flagged: number;
  isPurchased: boolean;
}

export default function CreateTestPage() {
  const router = useRouter();

  const [qbanks, setQbanks] = useState<QBankStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [examMode, setExamMode] = useState<'tutor' | 'timed'>('tutor');
  const [questionStatus, setQuestionStatus] = useState<'unused' | 'incorrect' | 'flagged' | 'all'>('unused');
  const [selectedQBankId, setSelectedQBankId] = useState<string>('');
  const [questionCount, setQuestionCount] = useState<number>(20);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/user/question-pool-stats');
        if (!res.ok) {
          throw new Error('Failed to load candidate question pool telemetry');
        }
        const data = await res.json();
        const list: QBankStat[] = data.qbanks || [];
        setQbanks(list);

        // Pre-select first unlocked bank if any
        const firstUnlocked = list.find(q => q.isPurchased);
        if (firstUnlocked) {
          setSelectedQBankId(firstUnlocked.id);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Unable to load question banks');
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const unlockedBanks = qbanks.filter(q => q.isPurchased);
  const lockedBanks = qbanks.filter(q => !q.isPurchased);
  const activeBank = qbanks.find(q => q.id === selectedQBankId);

  // Compute maximum available questions for active selection
  const availableInSelectedPool = activeBank
    ? (questionStatus === 'unused' ? activeBank.unused :
       questionStatus === 'incorrect' ? activeBank.incorrect :
       questionStatus === 'flagged' ? activeBank.flagged :
       activeBank.total)
    : 0;

  const handleGenerateBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQBankId) {
      alert('Please select an unlocked question bank.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch('/api/test-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qbankId: selectedQBankId,
          mode: examMode,
          filter: questionStatus,
          questionCount: Math.min(questionCount, availableInSelectedPool || questionCount),
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to create authentic test session');
      }

      const data = await res.json();
      router.push(`/dashboard/${data.qbankSlug}/test/${data.sessionId}`);
    } catch (err: any) {
      console.error('Session creation failed:', err);
      setError(err.message || 'Error generating test block');
      setIsGenerating(false);
    }
  };

  const legend = 'font-mono text-[11px] uppercase tracking-[0.18em] text-slate-600';

  return (
    <div className="min-h-screen bg-white px-5 py-12 text-slate-900 md:px-10 md:py-16">
      <div className="mx-auto max-w-4xl space-y-10">

        {/* Title Header */}
        <Reveal>
          <div className="border-b border-slate-200 pb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 font-mono text-xs uppercase tracking-wider text-teal-800 font-semibold">
                <Sparkles className="h-3 w-3 text-teal-600" /> Exam Session Builder
              </span>
              <span className="font-mono text-xs text-slate-400">USMLE Step 1 & 2 CK</span>
            </div>
            <h1 className="font-serif text-4xl font-medium tracking-tight text-slate-900 md:text-5xl">
              Create Custom <span className="text-teal-700">Exam Block</span>
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
              Configure strict timed exam simulation or tutor mode with distractor analysis and clinical mnemonics.
            </p>
          </div>
        </Reveal>

        {loading && (
          <div className="space-y-4 py-12 text-center">
            <div className="h-6 w-48 bg-slate-200 rounded animate-pulse mx-auto" />
            <p className="font-mono text-xs text-slate-500">Querying candidate question pools and license access...</p>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Notice</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {!loading && unlockedBanks.length === 0 && (
          <Reveal>
            <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/50 p-8 md:p-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-800 mb-4">
                <Lock className="h-7 w-7 text-amber-700" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-slate-900">
                All Question Banks Are Currently Locked
              </h2>
              <p className="mt-2 max-w-lg mx-auto text-sm text-slate-600 leading-relaxed">
                To generate test blocks, unlock one of the specialized question banks below. Test cards are supported in checkout for candidate and team verification.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 text-left">
                {lockedBanks.map((qb) => (
                  <div key={qb.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          {qb.specialtyTag}
                        </span>
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          ${(qb.price / 100).toFixed(2)}
                        </span>
                      </div>
                      <h3 className="mt-3 font-semibold text-slate-900 text-base">{qb.title}</h3>
                      <p className="mt-1 text-xs text-slate-500 line-clamp-2">{qb.description}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <CheckoutButton qbankId={qb.id} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        )}

        {!loading && unlockedBanks.length > 0 && (
          <form onSubmit={handleGenerateBlock} className="space-y-10">

            {/* 1. UNLOCKED QBANK SELECTOR */}
            <fieldset className="space-y-3">
              <legend className={`${legend} mb-3`}>1. Select Target Question Bank</legend>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {unlockedBanks.map((qb) => (
                  <label
                    key={qb.id}
                    className={`block cursor-pointer rounded-xl border p-5 transition-all ${
                      selectedQBankId === qb.id
                        ? 'border-teal-600 bg-teal-50/40 ring-2 ring-teal-600/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="qbank"
                          value={qb.id}
                          checked={selectedQBankId === qb.id}
                          onChange={() => setSelectedQBankId(qb.id)}
                          className="h-4 w-4 text-teal-600 border-slate-300 focus:ring-teal-500"
                        />
                        <span className="font-semibold text-slate-900 text-sm">{qb.title}</span>
                      </div>
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <ShieldCheck className="h-3 w-3" /> Unlocked
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500 line-clamp-2 pl-6">{qb.description}</p>
                    <div className="mt-3 flex items-center gap-4 pl-6 text-[11px] font-mono text-slate-500">
                      <span>Total: <strong>{qb.total}</strong></span>
                      <span>Unused: <strong className="text-teal-700">{qb.unused}</strong></span>
                      <span>Incorrect: <strong className="text-rose-600">{qb.incorrect}</strong></span>
                    </div>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* 2. TEST MODE SELECTOR */}
            <fieldset className="space-y-3">
              <legend className={`${legend} mb-3`}>2. Examination Mode</legend>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  { id: 'tutor' as const, title: 'Tutor Mode (Immediate Rationale)', body: 'Reveals distractor breakdowns, educational objectives, and high-yield video mnemonics immediately after each question.' },
                  { id: 'timed' as const, title: 'Timed Mode (Strict Exam Pace)', body: 'Authentic 90-sec/question countdown with full security telemetry. Explanations available upon block completion.' },
                ].map((m) => (
                  <label
                    key={m.id}
                    className={`block cursor-pointer rounded-xl border p-5 transition-all ${
                      examMode === m.id
                        ? 'border-teal-600 bg-teal-50/40 ring-2 ring-teal-600/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="radio"
                        name="mode"
                        value={m.id}
                        checked={examMode === m.id}
                        onChange={() => setExamMode(m.id)}
                        className="h-4 w-4 text-teal-600 border-slate-300 focus:ring-teal-500"
                      />
                      <span className="font-semibold text-slate-900 text-sm">{m.title}</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed pl-6">{m.body}</p>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* 3. QUESTION STATUS POOL */}
            <fieldset className="space-y-3">
              <legend className={`${legend} mb-3`}>3. Question Pool Status</legend>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { id: 'unused' as const, label: 'Unused Questions', count: activeBank?.unused ?? 0 },
                  { id: 'incorrect' as const, label: 'Incorrect Only', count: activeBank?.incorrect ?? 0 },
                  { id: 'flagged' as const, label: 'Flagged Only', count: activeBank?.flagged ?? 0 },
                  { id: 'all' as const, label: 'Entire Bank Pool', count: activeBank?.total ?? 0 },
                ].map((s) => (
                  <label
                    key={s.id}
                    className={`block cursor-pointer rounded-lg border p-4 text-center transition-all ${
                      questionStatus === s.id
                        ? 'border-teal-600 bg-teal-50/50 text-teal-950 font-medium'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={s.id}
                      checked={questionStatus === s.id}
                      onChange={() => setQuestionStatus(s.id)}
                      className="sr-only"
                    />
                    <div className="text-xs font-semibold">{s.label}</div>
                    <div className="mt-1 font-mono text-lg font-bold tabular-nums text-slate-900">
                      {s.count}
                    </div>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* 4. BLOCK LENGTH */}
            <fieldset className="space-y-3">
              <div className="flex items-center justify-between">
                <legend className={legend}>4. Block Size</legend>
                <span className="font-mono text-xs font-semibold text-teal-700">
                  {questionCount} Questions ({examMode === 'timed' ? `${questionCount * 1.5} min` : 'Self-paced'})
                </span>
              </div>
              <div className="flex items-center gap-3">
                {[10, 20, 30, 40, 50].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setQuestionCount(num)}
                    className={`flex-1 py-2.5 rounded-lg border font-mono text-xs font-bold transition-all ${
                      questionCount === num
                        ? 'border-teal-600 bg-teal-600 text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {num} Qs
                  </button>
                ))}
              </div>
            </fieldset>

            {/* SUBMIT BUTTON */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500">
                Ready to launch: <strong className="text-slate-900">{activeBank?.title}</strong> ({examMode.toUpperCase()} mode)
              </div>
              <button
                type="submit"
                disabled={isGenerating || !selectedQBankId}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-8 py-3.5 font-medium text-white shadow-md transition-all hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 cursor-pointer font-sans"
              >
                <Play className="h-4 w-4 fill-white" />
                {isGenerating ? 'Initializing Exam Block...' : 'Generate Exam Block'}
              </button>
            </div>
          </form>
        )}

        {/* LOCKED BANKS SECTION (if any exist) */}
        {!loading && unlockedBanks.length > 0 && lockedBanks.length > 0 && (
          <div className="pt-12 border-t border-slate-200">
            <h3 className="font-mono text-xs uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-slate-400" /> Additional Modules Available to Unlock
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {lockedBanks.map((qb) => (
                <div key={qb.id} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-sm">{qb.title}</span>
                      <span className="font-mono text-[10px] text-slate-500 font-bold uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-slate-200">
                        ${(qb.price / 100).toFixed(2)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-1">{qb.specialtyTag} &bull; {qb.total} questions</p>
                  </div>
                  <div className="shrink-0">
                    <CheckoutButton qbankId={qb.id} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
