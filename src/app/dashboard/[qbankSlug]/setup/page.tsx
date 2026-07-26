'use client';

import { useState, useEffect, Suspense, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Clock, GraduationCap, CheckCircle2, ChevronLeft, Target, Settings2 } from 'lucide-react';
import Link from 'next/link';
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
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-[#111827] mb-3">Configure Practice Block</h1>
        <p className="text-base text-[#6B7280]">Customize your test settings for <span className="font-semibold text-[#111827]">{title}</span>.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg font-medium">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-[#FFFFFF] rounded-xl shadow-sm border border-[#E5E7EB] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#F8FAF9] flex items-center justify-center border border-[#E5E7EB]">
              <Target className="w-5 h-5 text-[#0D9488]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#111827]">Available Questions</h2>
              <p className="text-sm text-[#6B7280]">You have completed {completedQuestions} of {totalQuestions} questions</p>
            </div>
          </div>
          
          <div className="mb-2 flex justify-between items-end">
            <span className="text-2xl font-bold text-[#111827]">{remainingQuestions} <span className="text-sm font-medium text-[#6B7280]">remaining</span></span>
            <span className="text-sm font-bold text-[#0D9488]">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-[#E5E7EB] rounded-full h-2.5">
            <div className="bg-[#0D9488] h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
          </div>
        </div>

        <div className="bg-[#FFFFFF] rounded-xl shadow-sm border border-[#E5E7EB] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#F8FAF9] flex items-center justify-center border border-[#E5E7EB]">
              <Settings2 className="w-5 h-5 text-[#0D9488]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#111827]">Testing Mode</h2>
              <p className="text-sm text-[#6B7280]">Select how you want to practice</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              onClick={() => setMode('tutor')}
              className={`text-left p-5 rounded-xl border-2 transition-all duration-200 ${mode === 'tutor' ? 'border-[#0D9488] bg-[#0D9488]/5' : 'border-[#E5E7EB] hover:border-[#0D9488]/30 bg-white'}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <GraduationCap className={`w-6 h-6 ${mode === 'tutor' ? 'text-[#0D9488]' : 'text-[#6B7280]'}`} />
                <span className={`text-base font-bold ${mode === 'tutor' ? 'text-[#0D9488]' : 'text-[#111827]'}`}>Tutor Mode</span>
              </div>
              <p className="text-sm text-[#6B7280]">Explanations shown immediately after each question. Best for deep learning.</p>
            </button>

            <button 
              onClick={() => setMode('timed')}
              className={`text-left p-5 rounded-xl border-2 transition-all duration-200 ${mode === 'timed' ? 'border-[#0D9488] bg-[#0D9488]/5' : 'border-[#E5E7EB] hover:border-[#0D9488]/30 bg-white'}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <Clock className={`w-6 h-6 ${mode === 'timed' ? 'text-[#0D9488]' : 'text-[#6B7280]'}`} />
                <span className={`text-base font-bold ${mode === 'timed' ? 'text-[#0D9488]' : 'text-[#111827]'}`}>Timed Mode</span>
              </div>
              <p className="text-sm text-[#6B7280]">Simulates real exam conditions. Explanations shown at the end.</p>
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            size="lg" 
            className="w-full sm:w-auto px-8 bg-[#0D9488] hover:bg-[#0a7d6f] text-white font-bold rounded-lg transition-colors border-0"
            onClick={handleStart} 
            isLoading={loading}
          >
            Start Block
          </Button>
        </div>
      </div>
    </div>
  );
}

function SetupTestWrapper({ qbankSlug }: { qbankSlug: string }) {
  const [data, setData] = useState<{ title: string; totalQuestions: number; completedQuestions: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/qbanks/${qbankSlug}/progress`)
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [qbankSlug]);

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
    <div className="min-h-screen bg-[#F8FAF9] font-sans">
      <div className="bg-[#FFFFFF] border-b border-[#E5E7EB] sticky top-0 z-10">
        <div className="container mx-auto px-4 md:px-8 h-16 flex items-center gap-4 max-w-5xl">
          <Link href={`/dashboard/${params.qbankSlug}`} className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:text-[#111827] hover:bg-gray-50 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <span className="text-sm font-bold text-[#111827]">Test Setup</span>
        </div>
      </div>
      <div className="container mx-auto py-12 px-4 md:px-8 max-w-5xl">
        <Suspense fallback={
          <div className="flex items-center justify-center h-64">
            <Loader size="lg" />
          </div>
        }>
          <SetupTestWrapper qbankSlug={params.qbankSlug} />
        </Suspense>
      </div>
    </div>
  );
}
