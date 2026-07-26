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

  return (
    <div className="min-h-full bg-[#F8FAF9] p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <Link href={`/dashboard/${qbank.slug}`} className="inline-flex items-center gap-2 text-sm font-bold text-[#6B7280] hover:text-[#111827] mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <h1 className="text-3xl font-extrabold text-[#111827] mb-8 tracking-tight">Performance Analytics</h1>

        {rows.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card elevation="elevated" className="bg-[#FFFFFF] rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden flex flex-col justify-between border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
              <div className="p-6">
                <h3 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">Strongest Subject</h3>
                <div className="text-xl font-bold text-[#111827] mb-1">
                  {[...rows].filter(r => r.attempted >= 1).sort((a, b) => b.correctPct - a.correctPct)[0]?.name || rows[0].name}
                </div>
                <div className="text-sm text-[#6B7280] font-medium">
                  Score: <span className="font-bold text-emerald-600">{[...rows].filter(r => r.attempted >= 1).sort((a, b) => b.correctPct - a.correctPct)[0]?.correctPct || rows[0].correctPct}%</span>
                </div>
              </div>
            </Card>

            <Card elevation="elevated" className="bg-[#FFFFFF] rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden flex flex-col justify-between border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
              <div className="p-6">
                <h3 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">Weakest Subject</h3>
                <div className="text-xl font-bold text-[#111827] mb-1">
                  {[...rows].filter(r => r.attempted >= 1).sort((a, b) => a.correctPct - b.correctPct)[0]?.name || [...rows].sort((a, b) => a.correctPct - b.correctPct)[0].name}
                </div>
                <div className="text-sm text-[#6B7280] font-medium">
                  Score: <span className="font-bold text-red-600">{[...rows].filter(r => r.attempted >= 1).sort((a, b) => a.correctPct - b.correctPct)[0]?.correctPct || [...rows].sort((a, b) => a.correctPct - b.correctPct)[0].correctPct}%</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        <div className="bg-[#FFFFFF] rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
          <div className="p-6 border-b border-[#E5E7EB]">
            <div className="flex gap-8 border-b border-[#E5E7EB] pb-1 mb-6">
              {['Subjects', 'Systems', 'Topics'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`font-bold pb-2 px-1 text-sm transition-colors border-b-2 -mb-[5px] ${activeTab === tab ? 'text-[#0D9488] border-[#0D9488]' : 'text-[#6B7280] border-transparent hover:text-[#111827]'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                  <span className="font-medium">Show:</span>
                  <select className="border-b border-[#E5E7EB] bg-transparent text-[#111827] outline-none pb-1 font-bold focus:border-[#0D9488] transition-colors">
                    <option>Score</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <button className="text-[#6B7280] hover:text-[#111827] transition-colors flex items-center gap-1.5 text-sm font-bold">
                  <Printer className="w-4 h-4 stroke-[2px]" />
                  Print
                </button>
                <div className="relative flex-1 sm:flex-none">
                  <input 
                    type="text" 
                    placeholder="Search topics..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-56 border-b border-[#E5E7EB] pb-1.5 text-sm font-medium outline-none focus:border-[#0D9488] transition-colors bg-transparent text-[#111827] placeholder-[#6B7280]" 
                  />
                  <Search className="w-4 h-4 text-[#6B7280] absolute right-0 top-0.5" />
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
              <thead>
                <tr className="text-[#6B7280] uppercase tracking-wider font-bold border-b border-[#E5E7EB] bg-[#F8FAF9]">
                  <th className="px-6 py-4 min-w-[240px]">Topic Name</th>
                  <th className="px-6 py-4 text-center">Usage</th>
                  <th className="px-6 py-4 text-center">Correct</th>
                  <th className="px-6 py-4 text-center">Incorrect</th>
                  <th className="px-6 py-4 text-center">Omitted</th>
                  <th className="px-6 py-4 text-center">P-Rank</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filteredRows.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-[#6B7280] font-medium">No topics match your search.</td></tr>
                ) : filteredRows.map((row) => (
                  <tr key={row.name} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="font-bold text-[#111827] mb-2">{row.name}</div>
                      <div className="w-full max-w-[200px] h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden flex">
                        <div className={`h-full transition-all duration-700 ease-out ${row.correctPct >= 70 ? 'bg-emerald-500' : row.correctPct >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${(row.attempted / row.total) * 100}%` }}></div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center text-[#6B7280] font-medium">{row.attempted} / {row.total}</td>
                    <td className="px-6 py-5 text-center">
                      <span className="text-[#111827] font-bold">{row.correct}</span>
                      <span className="text-[#6B7280] ml-1.5 text-xs font-medium">({row.correctPct}%)</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="text-[#111827] font-bold">{row.incorrect}</span>
                      <span className="text-[#6B7280] ml-1.5 text-xs font-medium">({row.incorrectPct}%)</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="text-[#111827] font-bold">{row.omitted}</span>
                      <span className="text-[#6B7280] ml-1.5 text-xs font-medium">({row.omittedPct}%)</span>
                    </td>
                    <td className="px-6 py-5 text-center text-[#6B7280] font-semibold">
                      {row.pRank ? (
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-[#F8FAF9] border border-[#E5E7EB] text-[#111827] font-bold text-xs shadow-sm">
                          {getOrdinal(row.pRank)}
                        </span>
                      ) : '-'}
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
