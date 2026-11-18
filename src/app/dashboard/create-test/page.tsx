'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  GraduationCap, 
  Clock, 
  CheckCircle2, 
  Layers, 
  ChevronLeft, 
  Sparkles, 
  AlertCircle,
  HelpCircle,
  Bookmark,
  XCircle,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface QBankStat {
  id: string;
  title: string;
  slug: string;
  qbankCode: string;
  specialtyTag: string;
  total: number;
  unused: number;
  incorrect: number;
  flagged: number;
}

export default function CreateTestPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [qbanks, setQbanks] = useState<QBankStat[]>([]);
  const [selectedBankIds, setSelectedBankIds] = useState<string[]>([]);
  const [testMode, setTestMode] = useState<'tutor' | 'timed'>('tutor');
  const [questionFilter, setQuestionFilter] = useState<'unused' | 'incorrect' | 'flagged' | 'all'>('unused');
  const [questionCount, setQuestionCount] = useState<number>(40);

  useEffect(() => {
    fetch('/api/user/question-pool-stats')
      .then(res => res.json())
      .then(data => {
        if (data.qbanks) {
          setQbanks(data.qbanks);
          // Default: select all available banks
          setSelectedBankIds(data.qbanks.map((q: QBankStat) => q.id));
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load question statistics.');
        setLoading(false);
      });
  }, []);

  // Calculate total available questions based on selection and filter
  const totalAvailable = selectedBankIds.reduce((sum, id) => {
    const bank = qbanks.find(b => b.id === id);
    if (!bank) return sum;
    if (questionFilter === 'unused') return sum + bank.unused;
    if (questionFilter === 'incorrect') return sum + bank.incorrect;
    if (questionFilter === 'flagged') return sum + bank.flagged;
    return sum + bank.total;
  }, 0);

  const toggleBank = (id: string) => {
    if (selectedBankIds.includes(id)) {
      setSelectedBankIds(selectedBankIds.filter(bId => bId !== id));
    } else {
      setSelectedBankIds([...selectedBankIds, id]);
    }
  };

  const selectAllBanks = () => {
    setSelectedBankIds(qbanks.map(b => b.id));
  };

  const clearAllBanks = () => {
    setSelectedBankIds([]);
  };

  const handleCreateTest = async () => {
    if (selectedBankIds.length === 0) {
      setError('Please select at least one organ system or discipline.');
      return;
    }

    if (totalAvailable === 0) {
      setError(`No questions available in the selected pool (${questionFilter.toUpperCase()}). Please change the filter or select more systems.`);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/test-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qbankIds: selectedBankIds,
          mode: testMode,
          filter: questionFilter,
          questionCount: Math.min(questionCount, totalAvailable),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to initialize test block.');
      }

      const { sessionId, qbankSlug } = await res.json();
      router.push(`/dashboard/${qbankSlug}/test/${sessionId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error generating test block.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-16 px-4 max-w-5xl flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Loading clinical question inventory...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 md:px-8 max-w-5xl animate-page-enter font-sans">
      
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-2">
            <ChevronLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-serif tracking-tight">
            Create Custom Test Block
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Configure custom exam parameters, select target organ systems, and generate a simulated board test block.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 bg-teal-50 border border-teal-200 text-teal-800 rounded-md">
            Step 1 Blueprint
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-sm">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">{error}</div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Test Configuration Matrix */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Section 1: Test Mode */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              1. Examination Mode
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setTestMode('tutor')}
                className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  testMode === 'tutor'
                    ? 'border-teal-600 bg-teal-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <div className={`p-2 rounded-lg ${testMode === 'tutor' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900">Tutor Mode</div>
                    <div className="text-[11px] text-teal-700 font-medium">Recommended for Learning</div>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Reveals distractor breakdowns, educational takeaways, and <strong>high-yield video mnemonics</strong> immediately after each answer submission.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setTestMode('timed')}
                className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  testMode === 'timed'
                    ? 'border-slate-900 bg-slate-50/60 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <div className={`p-2 rounded-lg ${testMode === 'timed' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900">Timed Mode</div>
                    <div className="text-[11px] text-slate-600 font-medium">Authentic Exam Pacing</div>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Standard 90 seconds per question with a running block clock. Explanations and video mnemonics remain locked until the block is submitted.
                </p>
              </button>
            </div>
          </div>

          {/* Section 2: Question Pool Status */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-600" />
              2. Question Status Pool
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'unused', label: 'Unused', desc: 'Fresh questions', icon: CheckCircle2, color: 'text-emerald-700 bg-emerald-50' },
                { id: 'incorrect', label: 'Incorrect', desc: 'Prior mistakes', icon: XCircle, color: 'text-rose-700 bg-rose-50' },
                { id: 'flagged', label: 'Marked', desc: 'Saved for review', icon: Bookmark, color: 'text-amber-700 bg-amber-50' },
                { id: 'all', label: 'All Pool', desc: 'Entire curriculum', icon: HelpCircle, color: 'text-blue-700 bg-blue-50' },
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setQuestionFilter(item.id as any)}
                  className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                    questionFilter === item.id
                      ? 'border-teal-600 bg-teal-50/30 shadow-2xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-slate-900">{item.label}</span>
                    <item.icon className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="text-[11px] text-slate-500">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Systems & Disciplines Matrix */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                3. Systems & Topic Modules
              </h2>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <button 
                  type="button" 
                  onClick={selectAllBanks}
                  className="text-teal-700 hover:underline cursor-pointer"
                >
                  Select All
                </button>
                <span className="text-slate-300">•</span>
                <button 
                  type="button" 
                  onClick={clearAllBanks}
                  className="text-slate-500 hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {qbanks.map(bank => {
                const isSelected = selectedBankIds.includes(bank.id);
                const countForFilter = 
                  questionFilter === 'unused' ? bank.unused :
                  questionFilter === 'incorrect' ? bank.incorrect :
                  questionFilter === 'flagged' ? bank.flagged : bank.total;

                return (
                  <label
                    key={bank.id}
                    className={`flex items-center justify-between p-3.5 cursor-pointer hover:bg-slate-50 transition-colors ${
                      isSelected ? 'bg-slate-50/70' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleBank(bank.id)}
                        className="w-4 h-4 rounded text-teal-600 border-slate-300 focus:ring-teal-500 cursor-pointer"
                      />
                      <div>
                        <div className="text-sm font-bold text-slate-900">{bank.title}</div>
                        <div className="text-xs text-slate-500">{bank.specialtyTag}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {countForFilter} Available
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Block Summary & Action */}
        <div className="lg:col-span-4 sticky top-24 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-4 pb-2 border-b border-slate-100">
              Block Specification
            </h3>

            {/* Question count selector */}
            <div className="space-y-3 mb-6">
              <label className="text-xs font-semibold text-slate-600 block">
                Number of Questions (Max 40 per block)
              </label>

              <div className="grid grid-cols-3 gap-2">
                {[10, 20, 40].map(count => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setQuestionCount(count)}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      questionCount === count
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {count} Qs
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="range"
                  min={1}
                  max={Math.min(40, totalAvailable > 0 ? totalAvailable : 40)}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
                <span className="text-xs font-mono font-bold text-slate-800 w-8 text-right">
                  {questionCount}
                </span>
              </div>
            </div>

            {/* Block Metrics */}
            <div className="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-4 mb-6">
              <div className="flex justify-between">
                <span>Selected Systems:</span>
                <span className="font-bold text-slate-900">{selectedBankIds.length} of {qbanks.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Pool Availability:</span>
                <span className="font-bold text-teal-700">{totalAvailable} questions</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Time:</span>
                <span className="font-bold text-slate-900">~{questionCount * 1.5} minutes</span>
              </div>
              <div className="flex justify-between">
                <span>Exam Interface:</span>
                <span className="font-bold text-slate-900">{testMode === 'tutor' ? 'Tutor Mode' : 'Timed Exam'}</span>
              </div>
            </div>

            {/* Launch button */}
            <Button
              variant="primary"
              onClick={handleCreateTest}
              disabled={submitting || selectedBankIds.length === 0 || totalAvailable === 0}
              className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-md shadow-teal-700/20 gap-2 border-none transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              {submitting ? 'Generating Block...' : 'Generate Test Block'}
            </Button>

            <p className="text-[11px] text-center text-slate-400 mt-3 leading-relaxed">
              Generates a verified USMLE block with video mnemonics and distractor breakdowns.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
