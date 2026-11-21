'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { VideoBackdrop } from '@/components/ui/VideoBackdrop';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service like Sentry
    console.error('Global Error Boundary Caught:', error);
  }, [error]);

  return (
    <div className="relative flex min-h-[calc(100vh-56px)] flex-1 items-center justify-center px-5 py-16 text-slate-100">
      <VideoBackdrop />
      <div className="w-full max-w-md rounded-lg border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl sm:p-10">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-teal-300/80">Error</p>
        <h1 className="font-serif text-3xl font-medium tracking-tight text-white">Something went wrong</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          We&apos;ve encountered an unexpected error. Our team has been notified.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-teal-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-md border border-white/15 px-4 py-2.5 text-center text-sm font-medium text-slate-200 transition-colors hover:border-white/40 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}