'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { LandingQBanksSection } from '@/components/LandingQBanksSection';
import { VideoBackdrop } from '@/components/ui/VideoBackdrop';
import { Reveal } from '@/components/ui/Reveal';
import { ArrowRight } from 'lucide-react';

const STATS = [
  { value: '200', label: 'Curated questions' },
  { value: '165', label: 'Video mnemonics' },
  { value: '94', label: 'Medical exhibits' },
  { value: '2', label: 'Tutor & timed modes' },
];

const PILLARS = [
  {
    n: '01',
    title: 'Authentic Board Simulation',
    body: 'Matches the exact visual layout, strikethrough, lab value lookups, and reverse-color contrast of official NBME FRED v2 and UWorld exam software.',
  },
  {
    n: '02',
    title: 'Selectable Comparison Tables',
    body: 'No flattened images or uncopyable text. High-yield differential diagnosis tables are rendered in clean, highlightable HTML with clear column borders.',
  },
  {
    n: '03',
    title: 'HD Visual Memory Anchors',
    body: 'Complex molecular mechanisms and histopathology slides are reinforced by dedicated video mnemonics mapped directly to every question item.',
  },
];

export default function Home() {
  const { data: session } = useSession();
  void session;

  return (
    <div className="relative flex min-h-screen flex-col text-slate-100">
      <VideoBackdrop />

      {/* Hero. The root layout owns <main>; sections here are plain elements. */}
      <section className="flex min-h-[85vh] items-center px-5 py-24 md:px-10">
        <div className="mx-auto w-full max-w-6xl">
          <Reveal>
            <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.18em] text-teal-300/80">
              Clinical-grade USMLE&reg; question banks
            </p>
            <h1 className="max-w-4xl font-serif text-5xl font-medium leading-[1.05] tracking-tight text-white md:text-7xl">
              Master Medical Concepts with <span className="text-teal-300">Clinical Authority</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-400 md:text-lg">
              Eliminate exam surprise. Practice full 50-question blocks in authentic board conditions with instant distractor rationales, selectable comparison tables, and cinematic video mnemonics.
            </p>
            <div className="mt-10">
              <a
                href="#qbanks"
                className="inline-flex items-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-teal-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300"
              >
                <span>Explore Question Banks</span>
                <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="mt-20">
            <dl className="grid grid-cols-2 border-y border-white/10 md:grid-cols-4 md:divide-x md:divide-white/10">
              {STATS.map((s) => (
                <div key={s.label} className="px-4 py-6 first:pl-0 md:px-8">
                  <dt className="text-xs uppercase tracking-widest text-slate-500">{s.label}</dt>
                  <dd className="mt-2 font-mono text-3xl font-medium tabular-nums text-white md:text-4xl">{s.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      <div className="flex-1">
        <LandingQBanksSection />

        <section className="mx-auto w-full max-w-6xl border-t border-white/10 px-5 py-24 md:px-10">
          <Reveal>
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-teal-300/80">Method</p>
            <h2 className="max-w-2xl font-serif text-3xl font-medium tracking-tight text-white md:text-4xl">
              Designed for Medical Student Cognition
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-400">
              Every question stem, distractor breakdown, and comparison table is optimized to maximize retention per minute of active recall.
            </p>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
            {PILLARS.map((p, i) => (
              <Reveal key={p.n} delay={i * 0.05}>
                <div className="h-full rounded-lg border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl transition-colors hover:border-white/25">
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-teal-300/80">{p.n}</span>
                  <h3 className="mt-4 font-serif text-xl font-medium tracking-tight text-white">{p.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-400">{p.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      </div>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between md:px-10">
          <p>
            <span className="text-slate-300">MicroQBank USMLE&reg;</span> &copy; {new Date().getFullYear()} All rights reserved.
          </p>
          <nav aria-label="Footer links" className="flex items-center gap-6">
            <Link href="/privacy" className="transition-colors hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="transition-colors hover:text-white">Terms of Service</Link>
            <Link href="/simulator" className="transition-colors hover:text-white">Board Simulator</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}