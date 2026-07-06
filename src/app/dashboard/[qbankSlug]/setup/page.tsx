'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function SetupTestForm({ qbankSlug }: { qbankSlug: string }) {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'tutor';
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
        const data = await res.json();
        throw new Error(data.error || 'Failed to create test session');
      }

      const { sessionId } = await res.json();
      router.push(`/dashboard/${qbankSlug}/test/${sessionId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to start test session');
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border rounded-xl p-8 shadow-sm">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}
      <p className="text-gray-600 mb-6">
        You are about to start a {mode === 'timed' ? 'timed' : 'tutor'} block containing all available questions in this Question Bank.
      </p>

      <button
        onClick={handleStart}
        disabled={loading}
        className="w-full bg-blue-600 text-white rounded-md py-3 font-semibold hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading ? 'Starting...' : 'Start Block'}
      </button>
    </div>
  );
}

export default function SetupTestPage({ params }: { params: { qbankSlug: string } }) {
  return (
    <div className="container mx-auto py-12 px-4 max-w-lg">
      <h1 className="text-3xl font-bold mb-6">Setup Block</h1>
      <Suspense fallback={<div>Loading setup...</div>}>
        <SetupTestForm qbankSlug={params.qbankSlug} />
      </Suspense>
    </div>
  );
}
