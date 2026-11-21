'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function ToastLogic() {
  const searchParams = useSearchParams();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (searchParams.get('purchased') === '1') {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  if (!show) return null;

  return (
    <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-5 duration-500">
      <div className="bg-green-600 text-white px-6 py-3 rounded-full shadow-lg font-medium flex items-center gap-2 border border-green-300">
        <svg className="w-5 h-5 text-green-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
        </svg>
        Purchase Successful! Your QBank has been unlocked.
      </div>
    </div>
  );
}

export function SuccessToast() {
  return (
    <Suspense fallback={null}>
      <ToastLogic />
    </Suspense>
  );
}
