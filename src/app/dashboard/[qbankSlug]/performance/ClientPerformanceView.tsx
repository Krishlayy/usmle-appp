'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { ArrowLeft, Printer, Search } from 'lucide-react';
import Link from 'next/link';

export type StatRow = {
  name: string;
  total: number;
  attempted: number;
  correct: number;
  incorrect: number;
  omitted: number;
  correctPct: number;
  incorrectPct: number;
  omittedPct: number;
  pRank: number;
};

const getOrdinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export default function ClientPerformanceView({ qbank, rows }: { qbank: any, rows: StatRow[] }) {
  const [activeTab, setActiveTab] = useState('Subjects');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRows = rows.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const withAttempts = [...rows].filter(r => r.attempted >= 1);
  const strongest = [...withAttempts].sort((a, b) => b.correctPct - a.correctPct)[0] || rows[0];
  const weakest = [...withAttempts].sort((a, b) => a.correctPct - b.correctPct)[0] || [...rows].sort((a, b) => a.correctPct - b.correctPct)[0];
  const focusRing = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300';

  return (
    <div className="min-h-full px-5 py-12 text-slate-100 md:px-10 md:py-16">
      <div className="mx-auto max-w-6xl">
        <Link href={`/dashboard/${qbank.slug}`} className={`mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white ${focusRing}`}>
          <ArrowLeft className="h-4 w-4" aria-hidden /> Back to Dashboard
        </Link>

        <h1 className="mb-10 font-serif text-4xl font-medium tracking-tight text-white">Performance Analytics</h1>

        {rows.length > 0 && (
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card elevation="subtle" className="p-6">
              <h3 className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-400">Strongest Subject</h3>
              <div className="mb-1 font-serif text-xl text-white">{strongest.name}</div>
              <div className="text-sm text-slate-400">
                Score: <span className="font-mono tabular-nums text-teal-300">{strongest.correctPct}%</span>
              </div>
            </Card>

            <Card elevation="subtle" className="p-6">
              <h3 className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-400">Weakest Subject</h3>
              <div className="mb-1 font-serif text-xl text-white">{weakest.name}</div>
              <div className="text-sm text-slate-400">
                Score: <span className="font-mono tabular-nums text-rose-300">{weakest.correctPct}%</span>
              </div>
            </Card>
          </div>
        )}

        <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.03] backdrop-blur-xl">
          <div className="border-b border-white/10 p-6">
            <div role="tablist" aria-label="Group by" className="mb-6 flex gap-8 border-b border-white/10">
              {['Subjects', 'Systems', 'Topics'].map(tab => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab}
                  onClick={() => setActiveTab(tab)}
                  className={`-mb-px border-b px-1 pb-3 text-sm transition-colors ${focusRing} ${activeTab === tab ? 'border-teal-300 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <label htmlFor="perf-show">Show:</label>
                <select id="perf-show" className={`border-b border-white/15 bg-transparent pb-1 text-white transition-colors focus:border-teal-300 ${focusRing}`}>
                  <option className="bg-[#0d1219]">Score</option>
                </select>
              </div>
              <div className="flex w-full items-center gap-4 sm:w-auto">
                <button type="button" className={`flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white ${focusRing}`}>
                  <Printer className="h-4 w-4" aria-hidden />
                  Print
                </button>
                <div className="relative flex-1 sm:flex-none">
                  <label htmlFor="perf-search" className="sr-only">Search topics</label>
                  <input
                    id="perf-search"
                    type="text"
                    placeholder="Search topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full border-b border-white/15 bg-transparent pb-1.5 pr-6 text-sm text-white transition-colors placeholder:text-slate-500 focus:border-teal-300 sm:w-56 ${focusRing}`}
                  />
                  <Search className="absolute right-0 top-0.5 h-4 w-4 text-slate-500" aria-hidden />
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-400">
                  <th scope="col" className="min-w-[240px] px-6 py-4 font-medium">Topic Name</th>
                  <th scope="col" className="px-6 py-4 text-center font-medium">Usage</th>
                  <th scope="col" className="px-6 py-4 text-center font-medium">Correct</th>
                  <th scope="col" className="px-6 py-4 text-center font-medium">Incorrect</th>
                  <th scope="col" className="px-6 py-4 text-center font-medium">Omitted</th>
                  <th scope="col" className="px-6 py-4 text-center font-medium">P-Rank</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredRows.length === 0 ? (
                  <tr><td colSpan={6} className="py-8 text-center text-slate-400">No topics match your search.</td></tr>
                ) : filteredRows.map((row) => (
                  <tr key={row.name} className="transition-colors hover:bg-white/[0.03]">
                    <td className="px-6 py-5">
                      <div className="mb-3 text-slate-100">{row.name}</div>
                      <div
                        className="h-px w-full max-w-[200px] bg-white/10"
                        role="progressbar"
                        aria-valuenow={Math.round((row.attempted / row.total) * 100)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${row.name} usage`}
                      >
                        <div className="h-px bg-teal-300 transition-[width] duration-700 ease-out" style={{ width: `${(row.attempted / row.total) * 100}%` }}></div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center font-mono tabular-nums text-slate-400">{row.attempted} / {row.total}</td>
                    <td className="px-6 py-5 text-center font-mono tabular-nums">
                      <span className="text-white">{row.correct}</span>
                      <span className="ml-1.5 text-xs text-slate-500">({row.correctPct}%)</span>
                    </td>
                    <td className="px-6 py-5 text-center font-mono tabular-nums">
                      <span className="text-white">{row.incorrect}</span>
                      <span className="ml-1.5 text-xs text-slate-500">({row.incorrectPct}%)</span>
                    </td>
                    <td className="px-6 py-5 text-center font-mono tabular-nums">
                      <span className="text-white">{row.omitted}</span>
                      <span className="ml-1.5 text-xs text-slate-500">({row.omittedPct}%)</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      {row.pRank ? (
                        <span className="inline-flex items-center justify-center rounded-sm border border-white/15 px-2.5 py-1 font-mono text-xs tabular-nums text-white">
                          {getOrdinal(row.pRank)}
                        </span>
                      ) : <span className="text-slate-500">-</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}