'use client';

import { use, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SetupTestPage(props: { params: Promise<{ qbankSlug: string }> }) {
  const params = use(props.params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'tutor';

  useEffect(() => {
    // Automatically redirect back to the QBank dashboard where QuickPracticeModal handles test launch seamlessly
    router.replace(`/dashboard/${params.qbankSlug}?openPractice=${mode}`);
  }, [params.qbankSlug, mode, router]);

  return (
    <div role="status" className="flex h-screen w-full items-center justify-center bg-white">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-600">Preparing your block...</p>
    </div>
  );
}