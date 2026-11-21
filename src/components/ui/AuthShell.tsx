import Link from 'next/link';
import type { ReactNode } from 'react';
import { VideoBackdrop } from '@/components/ui/VideoBackdrop';
import { Reveal } from '@/components/ui/Reveal';

export const authLabelClass =
  'mb-2 block font-mono text-[11px] uppercase tracking-[0.18em] text-slate-600';

export const authInputClass =
  'w-full rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 transition-colors hover:border-slate-300 focus:border-teal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600';

export const authErrorClass =
  'rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700';

export const authLinkClass =
  'text-teal-700 underline underline-offset-4 transition-colors hover:text-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600';

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
    <div className="relative flex min-h-[calc(100vh-56px)] flex-1 flex-col items-center justify-center px-5 py-16 text-slate-900">
      <VideoBackdrop />
      <Reveal className="w-full max-w-[440px]">
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-8 sm:p-10">
          <div className="mb-8">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-teal-700">
              {eyebrow ?? 'MicroQBank'}
            </p>
            <h1 className="font-serif text-3xl font-medium tracking-tight text-slate-900">{title}</h1>
            {subtitle && <p className="mt-3 text-sm leading-relaxed text-slate-600">{subtitle}</p>}
          </div>
          {children}
        </div>
        {footer && <div className="mt-6 text-center text-sm text-slate-600">{footer}</div>}
        <p className="mt-6 text-center">
          <Link
            href="/"
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500 transition-colors hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600"
          >
            Back to home
          </Link>
        </p>
      </Reveal>
    </div>
  );
}