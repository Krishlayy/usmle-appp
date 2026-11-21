import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { VideoBackdrop } from '@/components/ui/VideoBackdrop';

export default function NotFound() {
  return (
    <div className="relative flex min-h-[calc(100vh-56px)] flex-1 items-center justify-center px-5 py-16 text-slate-100">
      <VideoBackdrop />
      <div className="w-full max-w-md rounded-lg border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl sm:p-10">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-teal-300/80">
          Error <span className="tabular-nums">404</span>
        </p>
        <h1 className="font-serif text-3xl font-medium tracking-tight text-white">Page not found</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          The page you are looking for doesn&apos;t exist or has been moved. Check the URL or navigate back to safety.
        </p>
        <Link
          href="/dashboard"
          className="mt-8 inline-flex items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-teal-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden /> Return to Dashboard
        </Link>
      </div>
    </div>
  );
}