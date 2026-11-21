'use client';

import React from 'react';
import Link from 'next/link';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Target, 
  Play, 
  Sparkles, 
  Award,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-page-enter">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
            <Award className="w-3.5 h-3.5 text-teal-600" />
            <span>USMLE Peer Norming</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold font-serif text-slate-900 tracking-tight">
            Comparative Peer Analytics & Score <span className="text-teal-700 italic">Predictor</span>
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            Trace your cumulative board preparation against 12,000+ national peer medical student cohorts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/create-test"
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs shadow-sm transition-all flex items-center gap-2"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Generate New Block</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-2 hover:border-teal-500/40 transition-all">
          <div className="text-[11px] font-bold uppercase tracking-wider text-teal-700 font-mono flex items-center justify-between">
            <span>Step 1 Pass Index</span>
            <Target className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-4xl font-extrabold text-slate-900 font-serif">{d.step1PassLikelihood}</div>
          <div className="text-xs text-slate-500">95% Confidence: {d.confidenceInterval}</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-2 hover:border-cyan-500/40 transition-all">
          <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-700 font-mono flex items-center justify-between">
            <span>Peer Percentile</span>
            <TrendingUp className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-4xl font-extrabold text-slate-900 font-serif">{d.peerPercentile}th</div>
          <div className="text-xs text-slate-500">Above 78% of active candidates</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-2 hover:border-slate-400/40 transition-all">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 font-mono flex items-center justify-between">
            <span>Cumulative Accuracy</span>
            <CheckCircle2 className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-4xl font-extrabold text-slate-900 font-serif">{d.overallAccuracy}</div>
          <div className="text-xs text-slate-500">{d.totalCorrect} / {d.totalQuestionsAnswered} Questions Correct</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-2 hover:border-amber-500/40 transition-all">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700 font-mono flex items-center justify-between">
            <span>Average Pace</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-4xl font-extrabold text-slate-900 font-serif">{d.averageSecondsPerQuestion}s</div>
          <div className="text-xs text-slate-500">Target USMLE pace: 72s / question</div>
        </div>

      </div>

      {/* Organ System Accuracy Breakdown */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold font-serif text-slate-900">
              Organ-System Mastery vs Peer Benchmark
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Identifies weak topics for targeted drill and embedded video mnemonic reinforcement.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-teal-600 inline-block" />
              <span className="text-slate-800">Your Accuracy</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-300 inline-block" />
              <span className="text-slate-500">Peer Average</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {d.systems.map((sys, idx) => {
            const isAhead = sys.accuracy >= sys.peerAverage;
            const diff = sys.accuracy - sys.peerAverage;

            return (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900">{sys.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500">{sys.correct}/{sys.answered} ({sys.accuracy}%)</span>
                    <span className={`font-mono font-bold px-1.5 py-0.5 rounded text-[11px] ${
                      isAhead ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {isAhead ? `+${diff}% vs Peers` : `${diff}% vs Peers`}
                    </span>
                  </div>
                </div>

                {/* Dual Progress Bars */}
                <div className="space-y-1">
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-teal-600 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${sys.accuracy}%` }} 
                    />
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-slate-300 h-full rounded-full" 
                      style={{ width: `${sys.peerAverage}%` }} 
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">Ready to boost lower-scoring systems?</span>
          <Link
            href="/simulator?mode=tutor"
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
          >
            <span>Launch Targeted Tutor Drill</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

    </div>
  );
}
