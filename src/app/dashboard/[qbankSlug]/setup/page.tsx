'use client';

import { useState, useEffect, Suspense, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Clock, GraduationCap, CheckCircle2, ChevronLeft, Target, Settings2 } from 'lucide-react';
import Link from 'next/link';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Loader } from '@/components/ui/Loader';

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
    <div className="max-w-4xl mx-auto">
      
      {/* Header Area */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-primary tracking-tight mb-2">Configure Practice Block</h1>
        <p className="text-base font-medium text-secondary">Customize your test settings for <span className="font-bold text-primary">{title}</span>.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg font-medium">
          {error}
        </div>
      )}

      {/* Bento Box Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Progress Box (Span 2) */}
        <div className="md:col-span-2 bg-white border border-[var(--color-border-subtle)] rounded-xl p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-primary">Available Questions</h3>
            </div>
            <p className="text-sm text-secondary font-medium mb-6">
              You have completed {completedQuestions} out of {totalQuestions} questions.
            </p>
          </div>
          
          <div>
            <div className="flex justify-between items-end mb-2">
              <span className="text-2xl font-bold text-primary tracking-tight">{remainingQuestions} <span className="text-sm font-semibold text-muted uppercase tracking-wider">Remaining</span></span>
              <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{Math.round(progressPercentage)}%</span>
            </div>
            <ProgressBar progress={progressPercentage} />
          </div>
        </div>

        {/* Info Box (Span 1) */}
        <div className="md:col-span-1 bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)] rounded-xl p-8 flex flex-col justify-center items-center text-center">
           <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
             <Clock className="w-6 h-6 text-blue-600" />
           </div>
           <h4 className="text-xl font-bold text-primary mb-1">~{estMinutes} Min</h4>
           <p className="text-sm text-secondary font-medium">Estimated time to complete remaining questions.</p>
        </div>

        {/* Mode Selection (Span 3) */}
        <div className="md:col-span-3 bg-white border border-[var(--color-border-subtle)] rounded-xl p-8">
          <div className="flex items-center gap-2 mb-6">
            <Settings2 className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-primary">Select Testing Mode</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              onClick={() => setMode('tutor')}
              className={`text-left p-6 rounded-xl border-2 transition-all duration-200 ${mode === 'tutor' ? 'border-blue-600 bg-blue-50/30' : 'border-[var(--color-border-subtle)] hover:border-blue-300 bg-white'}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${mode === 'tutor' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <span className={`block text-lg font-bold ${mode === 'tutor' ? 'text-blue-700' : 'text-primary'}`}>Tutor Mode</span>
                  <span className={`text-xs font-semibold uppercase tracking-wider ${mode === 'tutor' ? 'text-blue-600' : 'text-muted'}`}>Recommended</span>
                </div>
              </div>
              <p className="text-sm text-secondary font-medium leading-relaxed">
                Explanations shown immediately after each question. No strict timer. Best for deep learning.
              </p>
            </button>

            <button 
              onClick={() => setMode('timed')}
              className={`text-left p-6 rounded-xl border-2 transition-all duration-200 ${mode === 'timed' ? 'border-blue-600 bg-blue-50/30' : 'border-[var(--color-border-subtle)] hover:border-blue-300 bg-white'}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${mode === 'timed' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className={`block text-lg font-bold ${mode === 'timed' ? 'text-blue-700' : 'text-primary'}`}>Timed Mode</span>
                  <span className={`text-xs font-semibold uppercase tracking-wider ${mode === 'timed' ? 'text-blue-600' : 'text-muted'}`}>Simulated Exam</span>
                </div>
              </div>
              <p className="text-sm text-secondary font-medium leading-relaxed">
                Simulates real exam conditions. Explanations shown only at the end of the block.
              </p>
            </button>
          </div>
        </div>

      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between border-t border-[var(--color-border-subtle)] pt-6 mt-8">
        <p className="text-sm text-secondary flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Progress is automatically saved
        </p>
        <Button 
          size="lg" 
          className="w-48 text-[15px] font-bold gap-2" 
          onClick={handleStart} 
          isLoading={loading}
        >
          Start Block
        </Button>
      </div>

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
        <Loader size="lg" />
      </div>
    );
  }

  if (!data) {
    return <div className="text-red-500 font-semibold text-center mt-12">Failed to load QBank data.</div>;
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
    <div className="min-h-screen bg-[var(--background)] animate-page-enter">
      <div className="bg-white border-b border-[var(--color-border-subtle)] sticky top-0 z-10">
        <div className="container mx-auto px-4 md:px-8 h-16 flex items-center gap-4 max-w-5xl">
          <Link href={`/dashboard/${params.qbankSlug}`} className="w-8 h-8 flex items-center justify-center rounded-md border border-[var(--color-border-subtle)] text-secondary hover:text-primary hover:bg-gray-50 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <span className="text-sm font-semibold text-secondary uppercase tracking-wider">Test Configuration</span>
        </div>
      </div>
      <div className="container mx-auto py-12 px-4 md:px-8 max-w-5xl">
        <Suspense fallback={
          <div className="flex items-center justify-center h-64 text-secondary">
            <Loader size="lg" />
          </div>
        }>
          <SetupTestWrapper qbankSlug={params.qbankSlug} />
        </Suspense>
      </div>
    </div>
  );
}
