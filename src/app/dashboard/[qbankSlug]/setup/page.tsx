'use client';

import { useState, useEffect, Suspense, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Clock, GraduationCap, CheckCircle2, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { ProgressBar } from '@/components/ui/ProgressBar';

type SetupTestFormProps = {
  qbankSlug: string;
  title: string;
  totalQuestions: number;
  completedQuestions: number;
};

function SetupTestForm({ qbankSlug, title, totalQuestions, completedQuestions }: SetupTestFormProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialMode = searchParams.get('mode') || 'tutor';
  const [mode, setMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const progressPercentage = totalQuestions > 0 ? (completedQuestions / totalQuestions) * 100 : 0;
  const remainingQuestions = totalQuestions - completedQuestions;
  const estMinutes = Math.round(remainingQuestions * 1.5);

  const handleStart = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/test-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qbankSlug, mode }),
      });

      if (!res.ok) {
        try {
          const data = await res.json();
          throw new Error(data.error || 'Failed to create test session');
        } catch(e) {
          throw new Error('Server returned an error');
        }
      }

      const { sessionId } = await res.json();
      router.push(`/dashboard/${qbankSlug}/test/${sessionId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to start test session');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card elevation="elevated" className="overflow-hidden border-[var(--color-border-subtle)]">
        {/* Header Area */}
        <div className="bg-[var(--color-surface-subtle)] border-b border-[var(--color-border-subtle)] px-8 py-6">
          <h1 className="text-[22px] font-bold text-primary tracking-tight mb-1">{title}</h1>
          <p className="text-[15px] font-medium text-secondary">{totalQuestions} Questions Total</p>
        </div>

        <div className="p-8 space-y-8">
          {/* Progress Section */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[16px] font-bold text-primary">
                {completedQuestions > 0 ? "Resume Practice" : "Start Practice"}
              </h3>
              <span className="text-[14px] font-bold text-primary bg-blue-50 px-2.5 py-1 rounded-md text-blue-700">
                {Math.round(progressPercentage)}% Complete
              </span>
            </div>
            <ProgressBar progress={progressPercentage} />
            <div className="flex justify-between mt-3 text-[13px] font-medium text-secondary">
              <span>{remainingQuestions} Questions Remaining</span>
              <span>~{estMinutes} Min Estimated</span>
            </div>
          </section>

          <div className="h-px bg-[var(--color-border-subtle)] w-full"></div>

          {/* Mode Selection */}
          <section>
            <h3 className="text-[16px] font-bold text-primary mb-4">Select Mode</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={() => setMode('tutor')}
                className={`text-left p-4 rounded-xl border-2 transition-all duration-200 ${mode === 'tutor' ? 'border-[var(--color-primary)] bg-blue-50/50 shadow-sm' : 'border-[var(--color-border-subtle)] hover:border-[#CBD5E1] bg-white'}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <GraduationCap className={`w-5 h-5 ${mode === 'tutor' ? 'text-[var(--color-primary)]' : 'text-slate-400'}`} />
                  <span className={`font-bold ${mode === 'tutor' ? 'text-[var(--color-primary)]' : 'text-primary'}`}>Tutor Mode</span>
                </div>
                <p className="text-[13px] text-secondary font-medium leading-snug pl-8">
                  Explanations shown immediately after each question. No strict timer.
                </p>
              </button>

              <button 
                onClick={() => setMode('timed')}
                className={`text-left p-4 rounded-xl border-2 transition-all duration-200 ${mode === 'timed' ? 'border-[var(--color-primary)] bg-blue-50/50 shadow-sm' : 'border-[var(--color-border-subtle)] hover:border-[#CBD5E1] bg-white'}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Clock className={`w-5 h-5 ${mode === 'timed' ? 'text-[var(--color-primary)]' : 'text-slate-400'}`} />
                  <span className={`font-bold ${mode === 'timed' ? 'text-[var(--color-primary)]' : 'text-primary'}`}>Timed Mode</span>
                </div>
                <p className="text-[13px] text-secondary font-medium leading-snug pl-8">
                  Simulates exam conditions. Explanations shown only at the end of the block.
                </p>
              </button>
            </div>
          </section>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl font-medium">
              {error}
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="bg-[var(--color-surface-subtle)] border-t border-[var(--color-border-subtle)] px-8 py-5 flex items-center justify-between">
          <p className="text-[13px] text-secondary flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Auto-saves progress
          </p>
          <Button 
            size="lg" 
            className="w-48 text-[15px] shadow-sm font-bold" 
            onClick={handleStart} 
            isLoading={loading}
          >
            Start Block
          </Button>
        </div>
      </Card>
    </div>
  );
}

// Data wrapper component
function SetupTestWrapper({ qbankSlug }: { qbankSlug: string }) {
  const [data, setData] = useState<{ title: string; totalQuestions: number; completedQuestions: number } | null>(null);
  const [loading, setLoading] = useState(true);

  // We fetch this via client-side API call since this is a 'use client' file.
  // We can't change 'use client' because useSearchParams requires it.
  useEffect(() => {
    fetch(`/api/qbanks/${qbankSlug}/progress`)
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563EB]"></div>
      </div>
    );
  }

  if (!data) {
    return <div className="text-red-500 font-semibold">Failed to load QBank data.</div>;
  }

  return (
    <SetupTestForm 
      qbankSlug={qbankSlug} 
      title={data.title} 
      totalQuestions={data.totalQuestions}
      completedQuestions={data.completedQuestions}
    />
  );
}

export default function SetupTestPage(props: { params: Promise<{ qbankSlug: string }> }) {
  const params = use(props.params);
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="bg-white border-b border-[var(--color-border-subtle)] sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 md:px-8 h-16 flex items-center gap-4">
          <Link href={`/dashboard/${params.qbankSlug}`} className="text-secondary hover:text-primary transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-scale-lg font-bold text-primary">Start Practice</h1>
        </div>
      </div>
      <div className="container mx-auto py-10 px-4 md:px-8 max-w-[1280px]">
        <Suspense fallback={
          <div className="flex items-center justify-center h-64 text-secondary">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563EB]"></div>
          </div>
        }>
          <SetupTestWrapper qbankSlug={params.qbankSlug} />
        </Suspense>
      </div>
    </div>
  );
}
