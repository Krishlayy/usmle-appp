'use client';

import React from 'react';
import Link from 'next/link';
import { TrendingUp, Clock, Target, Play, CheckCircle2, ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';

interface SystemMastery {
  name: string;
  answered: number;
  correct: number;
  accuracy: number;
  peerAverage: number;
}

const PERFORMANCE_DATA = {
  step1PassLikelihood: "96.4%",
  confidenceInterval: "94.2% - 98.1%",
  totalQuestionsAnswered: 184,
  totalCorrect: 138,
  overallAccuracy: "74.8%",
  peerPercentile: 78,
  averageSecondsPerQuestion: 68,
  systems: [
    { name: "Autoimmune Diseases (SLE, RA, Scleroderma)", answered: 50, correct: 41, accuracy: 82, peerAverage: 67 },
    { name: "Immunodeficiency Disorders (SCID, Bruton, CVID)", answered: 45, correct: 35, accuracy: 77, peerAverage: 65 },
    { name: "Biologics & Targeted Therapeutics (Rituximab, Infliximab)", answered: 35, correct: 27, accuracy: 77, peerAverage: 62 },
    { name: "Approach to Histology & Biopsies", answered: 30, correct: 21, accuracy: 70, peerAverage: 59 },
    { name: "Basic Pharmacology & PK/PD", answered: 24, correct: 16, accuracy: 66, peerAverage: 58 }
  ] as SystemMastery[]
};

export default function PerformanceDashboardPage() {
  const d = PERFORMANCE_DATA;

  const kpis = [
    { label: 'Step 1 Pass Index', value: d.step1PassLikelihood, sub: `95% Confidence: ${d.confidenceInterval}`, Icon: Target },
    { label: 'Peer Percentile', value: `${d.peerPercentile}th`, sub: 'Above 78% of active candidates', Icon: TrendingUp },
    { label: 'Cumulative Accuracy', value: d.overallAccuracy, sub: `${d.totalCorrect} / ${d.totalQuestionsAnswered} Questions Correct`, Icon: CheckCircle2 },
    { label: 'Average Pace', value: `${d.averageSecondsPerQuestion}s`, sub: 'Target USMLE pace: 72s / question', Icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-[#070a0f] px-5 py-12 text-slate-100 md:px-10 md:py-16">
      <div className="mx-auto max-w-6xl space-y-12">

        {/* Header */}
        <Reveal>
          <div className="flex flex-col justify-between gap-6 border-b border-white/10 pb-8 md:flex-row md:items-end">
            <div>
              <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-teal-300/80">USMLE peer norming</p>
              <h1 className="font-serif text-4xl font-medium leading-[1.1] tracking-tight text-white md:text-5xl">
                Comparative Peer Analytics &amp; Score <span className="text-teal-300">Predictor</span>
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-400">
                Trace your cumulative board preparation against 12,000+ national peer medical student cohorts.
              </p>
            </div>

            <Link
              href="/dashboard/create-test"
              className="inline-flex shrink-0 items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-teal-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300"
            >
              <Play className="h-4 w-4" aria-hidden />
              <span>Generate New Block</span>
            </Link>
          </div>
        </Reveal>

        {/* KPI Stats Grid */}
        <Reveal delay={0.05}>
          <dl className="grid grid-cols-1 border-y border-white/10 sm:grid-cols-2 sm:divide-x sm:divide-white/10 lg:grid-cols-4">
            {kpis.map(({ label, value, sub, Icon }) => (
              <div key={label} className="px-4 py-6 first:pl-0 md:px-8">
                <dt className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.18em] text-slate-400">
                  <span>{label}</span>
                  <Icon className="h-4 w-4 text-slate-500" aria-hidden />
                </dt>
                <dd className="mt-3 font-mono text-3xl font-medium tabular-nums text-white md:text-4xl">{value}</dd>
                <p className="mt-2 text-xs text-slate-500">{sub}</p>
              </div>
            ))}
          </dl>
        </Reveal>

        {/* Organ System Accuracy Breakdown */}
        <Reveal>
          <section className="space-y-8 rounded-lg border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl sm:p-8">
            <div className="flex flex-col justify-between gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-serif text-xl font-medium tracking-tight text-white">
                  Organ-System Mastery vs Peer Benchmark
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Identifies weak topics for targeted drill and embedded video mnemonic reinforcement.
                </p>
              </div>
              <div className="flex items-center gap-5 text-xs">
                <div className="flex items-center gap-2">
                  <span aria-hidden className="inline-block h-px w-5 bg-teal-300" />
                  <span className="text-slate-200">Your Accuracy</span>
                </div>
                <div className="flex items-center gap-2">
                  <span aria-hidden className="inline-block h-px w-5 bg-slate-500" />
                  <span className="text-slate-500">Peer Average</span>
                </div>
              </div>
            </div>

            <div className="space-y-7">
              {d.systems.map((sys, idx) => {
                const isAhead = sys.accuracy >= sys.peerAverage;
                const diff = sys.accuracy - sys.peerAverage;

                return (
                  <div key={idx} className="space-y-3">
                    <div className="flex flex-col justify-between gap-1 text-xs sm:flex-row sm:items-center">
                      <span className="text-sm text-slate-200">{sys.name}</span>
                      <div className="flex items-center gap-4">
                        <span className="font-mono tabular-nums text-slate-400">{sys.correct}/{sys.answered} ({sys.accuracy}%)</span>
                        <span className={`font-mono text-[11px] tabular-nums ${isAhead ? 'text-teal-300' : 'text-rose-300'}`}>
                          {isAhead ? `+${diff}% vs Peers` : `${diff}% vs Peers`}
                        </span>
                      </div>
                    </div>

                    {/* Dual hairline progress */}
                    <div className="space-y-2">
                      <div
                        className="h-0.5 w-full bg-white/10"
                        role="progressbar"
                        aria-valuenow={sys.accuracy}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${sys.name} accuracy`}
                      >
                        <div className="h-0.5 bg-teal-300 transition-[width] duration-500" style={{ width: `${sys.accuracy}%` }} />
                      </div>
                      <div
                        className="h-px w-full bg-white/10"
                        role="progressbar"
                        aria-valuenow={sys.peerAverage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${sys.name} peer average`}
                      >
                        <div className="h-px bg-slate-500" style={{ width: `${sys.peerAverage}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-5">
              <span className="text-xs text-slate-500">Ready to boost lower-scoring systems?</span>
              <Link
                href="/simulator?mode=tutor"
                className="flex items-center gap-1 text-sm text-teal-300 transition-colors hover:text-teal-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300"
              >
                <span>Launch Targeted Tutor Drill</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </div>
          </section>
        </Reveal>

      </div>
    </div>
  );
}