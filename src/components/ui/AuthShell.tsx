import Link from 'next/link';
import type { ReactNode } from 'react';
import { VideoBackdrop } from '@/components/ui/VideoBackdrop';
import { Reveal } from '@/components/ui/Reveal';

export const authLabelClass =
  'mb-2 block font-mono text-[11px] uppercase tracking-[0.18em] text-slate-400';

export const authInputClass =
  'w-full rounded-md border border-white/15 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-slate-500 transition-colors hover:border-white/30 focus:border-teal-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300';

export const authErrorClass =
  'rounded-md border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300';

export const authLinkClass =
  'text-teal-300 underline underline-offset-4 transition-colors hover:text-teal-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300';

/**
 * Calm video backdrop + one centred hairline panel. The root layout owns <main>, so this
 * renders a plain div.
 */
export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="relative flex min-h-[calc(100vh-56px)] flex-1 flex-col items-center justify-center px-5 py-16 text-slate-100">
      <VideoBackdrop />
      <Reveal className="w-full max-w-[440px]">
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl sm:p-10">
          <div className="mb-8">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-teal-300/80">
              {eyebrow ?? 'MicroQBank'}
            </p>
            <h1 className="font-serif text-3xl font-medium tracking-tight text-white">{title}</h1>
            {subtitle && <p className="mt-3 text-sm leading-relaxed text-slate-400">{subtitle}</p>}
          </div>
          {children}
        </div>
        {footer && <div className="mt-6 text-center text-sm text-slate-400">{footer}</div>}
        <p className="mt-6 text-center">
          <Link
            href="/"
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300"
          >
            Back to home
          </Link>
        </p>
      </Reveal>
    </div>
  );
}