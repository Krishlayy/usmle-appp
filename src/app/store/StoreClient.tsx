'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { VideoBackdrop } from '@/components/ui/VideoBackdrop';
import { Reveal } from '@/components/ui/Reveal';

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
    <div className="relative min-h-screen text-slate-900">
      <VideoBackdrop />
      <div className="mx-auto max-w-6xl px-5 py-16 md:px-10 md:py-24">
        <Reveal>
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-teal-700">Modular USMLE preparation</p>
          <h1 className="max-w-3xl font-serif text-4xl font-medium leading-[1.1] tracking-tight text-slate-900 md:text-6xl">
            Targeted System <span className="text-teal-700">Q-Banks</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
            Eliminate bloated subscriptions. Purchase only the specific systems or rotation modules you need with lifetime access, high-yield distractor analysis, and embedded video mnemonics.
          </p>
        </Reveal>

        {/* Filters */}
        <div role="group" aria-label="Filter by system" className="mt-12 flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4">
          {categories.map((category) => {
            const isActive = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategory(category.id)}
                aria-pressed={isActive}
                className={`rounded-md border px-4 py-2 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300 ${
                  isActive
                    ? 'border-slate-300 bg-teal-700 text-white'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                {category.label}
              </button>
            );
          })}
        </div>

        {filteredQBanks.length === 0 ? (
          <div className="mt-8 rounded-lg border border-dashed border-slate-200 p-12 text-center">
            <h3 className="font-serif text-xl text-slate-900">No Modules in this Category</h3>
            <p className="mx-auto mb-6 mt-2 max-w-md text-sm text-slate-600">
              We are actively preparing new systems. Explore our all systems view to see available modules.
            </p>
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className="rounded-md bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
            >
              Show All Modules
            </button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredQBanks.map((qbank, i) => {
              const priceFormatted = (qbank.price / 100).toFixed(2);
              return (
                <Reveal key={qbank.id} delay={Math.min(i, 5) * 0.05}>
                  <article className="flex h-full flex-col justify-between rounded-lg border border-slate-200 bg-white shadow-sm p-6 transition-colors hover:border-slate-300">
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-mono text-[11px] uppercase tracking-wider text-teal-700">
                          {qbank.specialtyTag}
                        </span>
                        <span className="font-mono text-[11px] uppercase tracking-wider tabular-nums text-slate-500">
                          {qbank.totalQuestions || 50} Questions
                        </span>
                      </div>

                      <h2 className="mt-3 font-serif text-xl font-medium leading-snug text-slate-900">
                        {qbank.title}
                      </h2>

                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">
                        {qbank.description}
                      </p>

                      <ul className="mb-6 mt-5 space-y-2 border-t border-slate-200 pt-4 text-xs text-slate-600">
                        <li className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 shrink-0 text-teal-700" aria-hidden />
                          <span>Full distractor rationale &amp; NBME style</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 shrink-0 text-teal-700" aria-hidden />
                          <span>Embedded video mnemonics included</span>
                        </li>
                      </ul>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                      <div>
                        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">Lifetime Access</div>
                        <div className="font-mono text-2xl tabular-nums text-slate-900">${priceFormatted}</div>
                      </div>

                      <Link
                        href={`/simulator?qbank=${qbank.slug}`}
                        className="inline-flex items-center gap-1.5 rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
                      >
                        <span>Start Module</span>
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                      </Link>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}