'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminQBankImportPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/qbanks/upload');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh] text-slate-500 font-mono text-sm">
      Redirecting to Question Bank Ingestion Suite...
    </div>
  );
}
