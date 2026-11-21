'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Layers, CheckCircle, Sparkles, Filter } from 'lucide-react';

export interface QBankItem {
  id: string;
  title: string;
  slug: string;
  specialtyTag: string;
  description: string;
  price: number; // in cents
  totalQuestions: number;
  difficulty?: string;
  topics?: string[];
}

interface StoreClientProps {
  initialQBanks: QBankItem[];
}

export default function StoreClient({ initialQBanks }: StoreClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: `All Systems (${initialQBanks.length})` },
    { id: 'immunology', label: 'Immunology', match: (cat: string) => cat.toLowerCase().includes('immuno') },
    { id: 'pharmacology', label: 'Pharmacology', match: (cat: string) => cat.toLowerCase().includes('pharm') },
    { id: 'pathology', label: 'Pathology & Histology', match: (cat: string) => cat.toLowerCase().includes('path') || cat.toLowerCase().includes('histo') },
  ];

  const filteredQBanks = initialQBanks.filter((qb) => {
    if (selectedCategory === 'all') return true;
    const cat = categories.find(c => c.id === selectedCategory);
    if (!cat || !cat.match) return true;
    return cat.match(qb.specialtyTag);
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-page-enter">
      {/* Header Section */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Modular USMLE Preparation</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold font-serif text-slate-900 tracking-tight">
          Targeted System <span className="text-teal-700 italic">Q-Banks</span>
        </h1>
        <p className="text-sm md:text-base text-slate-600 max-w-2xl leading-relaxed">
          Eliminate bloated subscriptions. Purchase only the specific systems or rotation modules you need with lifetime access, high-yield distractor analysis, and embedded video mnemonics.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4">
        {categories.map((category) => {
          const isActive = selectedCategory === category.id;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/10'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {category.label}
            </button>
          );
        })}
      </div>

      {/* Grid of Modules */}
      {filteredQBanks.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
          <Layers className="mx-auto h-12 w-12 text-slate-400 mb-3" />
          <h3 className="font-serif text-xl font-bold text-slate-900 mb-1">No Modules in this Category</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-4">
            We are actively preparing new systems. Explore our all systems view to see available modules.
          </p>
          <button
            onClick={() => setSelectedCategory('all')}
            className="px-4 py-2 bg-teal-600 text-white text-xs font-semibold rounded-lg hover:bg-teal-500 transition-colors"
          >
            Show All Modules
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQBanks.map((qbank) => {
            const priceFormatted = (qbank.price / 100).toFixed(2);
            return (
              <div
                key={qbank.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-teal-500/50 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {qbank.specialtyTag}
                    </span>
                    <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                      {qbank.totalQuestions || 50} Questions
                    </span>
                  </div>

                  <h2 className="font-serif text-xl font-bold text-slate-900 mb-2 group-hover:text-teal-700 transition-colors leading-snug">
                    {qbank.title}
                  </h2>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-3">
                    {qbank.description}
                  </p>

                  {/* High Yield Feature Badges */}
                  <div className="space-y-1.5 mb-6 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                      <span>Full distractor rationale & NBME style</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-600 flex-shrink-0" />
                      <span>Embedded video mnemonics included</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Lifetime Access</div>
                    <div className="text-2xl font-bold font-serif text-slate-900">
                      ${priceFormatted}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/simulator?qbank=${qbank.slug}`}
                      className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 group-hover:translate-x-0.5"
                    >
                      <span>Start Module</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
