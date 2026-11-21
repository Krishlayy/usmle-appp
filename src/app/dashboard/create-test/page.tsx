'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Play } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';

interface SystemOption {
  id: string;
  slug: string;
  title: string;
  count: number;
}

const AVAILABLE_SYSTEMS: SystemOption[] = [
  { id: 'autoimmune', slug: 'autoimmune-diseases', title: 'Autoimmune Diseases (SLE, Rheumatoid, Scleroderma, Sjögren)', count: 50 },
  { id: 'immunodeficiency', slug: 'immunodeficiency-disorders', title: 'Immunodeficiency Disorders (SCID, Bruton, CVID, DiGeorge)', count: 50 },
  { id: 'biologics', slug: 'biologics-targeted-therapeutics', title: 'Biologics & Targeted Therapeutics (Rituximab, Infliximab, Pembrolizumab)', count: 50 },
  { id: 'histology', slug: 'approach-to-histology', title: 'Approach to Histology (Biopsies, Glomeruli, Granulomas, Mallory Bodies)', count: 50 },
  { id: 'vasculitis', slug: 'rheumatology-vasculitis', title: 'Rheumatology & Vasculitis (Temporal Arteritis, Kawasaki, GPA, ANCA)', count: 50 },
];

export default function CreateTestPage() {
  const router = useRouter();

  const [examMode, setExamMode] = useState<'tutor' | 'timed'>('tutor');
  const [questionStatus, setQuestionStatus] = useState<string>('unused');
  const [selectedSystems, setSelectedSystems] = useState<string[]>(['autoimmune', 'immunodeficiency', 'biologics', 'histology', 'vasculitis']);
  const [questionCount, setQuestionCount] = useState<number>(20);
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleSystem = (id: string) => {
    if (selectedSystems.includes(id)) {
      if (selectedSystems.length > 1) {
        setSelectedSystems(selectedSystems.filter(s => s !== id));
      }
    } else {
      setSelectedSystems([...selectedSystems, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedSystems.length === AVAILABLE_SYSTEMS.length) {
      setSelectedSystems([AVAILABLE_SYSTEMS[0].id]);
    } else {
      setSelectedSystems(AVAILABLE_SYSTEMS.map(s => s.id));
    }
  };

  const handleGenerateBlock = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    
    // Select first matching slug or default to autoimmune
    const activeSys = AVAILABLE_SYSTEMS.find(s => selectedSystems.includes(s.id)) || AVAILABLE_SYSTEMS[0];
    
    // Navigate straight to authentic simulator
    router.push(`/simulator?mode=${examMode}&count=${questionCount}&qbank=${activeSys.slug}`);
  };

  const focusRing = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600';
  const legend = 'font-mono text-[11px] uppercase tracking-[0.18em] text-slate-600';

  return (
    <div className="min-h-screen bg-white px-5 py-12 text-slate-900 md:px-10 md:py-16">
      <div className="mx-auto max-w-4xl space-y-10">

        {/* Title Header */}
        <Reveal>
          <div className="border-b border-slate-200 pb-8">
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-teal-700">Interactive exam builder</p>
            <h1 className="font-serif text-4xl font-medium tracking-tight text-slate-900 md:text-5xl">
              Custom Test Generation <span className="text-teal-700">Matrix</span>
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
              Replicate the exact UWorld exam block builder. Configure mode, question pool status, organ systems, and timed block length.
            </p>
          </div>
        </Reveal>

        <form onSubmit={handleGenerateBlock} className="space-y-10">

          {/* 1. TEST MODE SELECTOR */}
          <fieldset className="space-y-3">
            <legend className={`${legend} mb-3`}>1. Select Examination Mode</legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                { id: 'tutor' as const, title: 'Tutor Mode (Immediate Rationale)', body: 'Reveals distractor breakdowns, educational objective, and high-yield video mnemonic immediately after each question.' },
                { id: 'timed' as const, title: 'Timed Mode (Strict Exam Pace)', body: 'Authentic 60-minute countdown with no answer reveals until the entire block is submitted for evaluation.' },
              ].map((m) => (
                <label
                  key={m.id}
                  className={`block cursor-pointer rounded-lg border p-5 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-teal-300 ${
                    examMode === m.id
                      ? 'border-teal-600 bg-slate-100'
                      : 'border-slate-200 bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <span className="mb-2 flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="examMode"
                      checked={examMode === m.id}
                      onChange={() => setExamMode(m.id)}
                      className="h-4 w-4 accent-teal-300"
                    />
                    <span className="text-sm font-medium text-slate-900">{m.title}</span>
                  </span>
                  <span className="block pl-6 text-xs leading-relaxed text-slate-600">{m.body}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* 2. QUESTION POOL STATUS */}
          <fieldset className="space-y-3">
            <legend className={`${legend} mb-3`}>2. Question Status Filter</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { id: 'unused', label: 'Unused Questions' },
                { id: 'incorrect', label: 'Incorrect Only' },
                { id: 'flagged', label: 'Marked / Flagged' },
                { id: 'all', label: 'All Pool (250 Qs)' },
              ].map(status => {
                const active = questionStatus === status.id;
                return (
                  <label
                    key={status.id}
                    className={`flex cursor-pointer items-center justify-between rounded-md border px-3 py-3 text-xs transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-teal-300 ${
                      active
                        ? 'border-teal-600 bg-slate-100 text-slate-900'
                        : 'border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="questionStatus"
                      className="sr-only"
                      checked={active}
                      onChange={() => setQuestionStatus(status.id)}
                    />
                    <span>{status.label}</span>
                    <span
                      aria-hidden
                      className={`flex h-3.5 w-3.5 items-center justify-center rounded-full border ${active ? 'border-teal-600' : 'border-slate-300'}`}
                    >
                      {active && <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {/* 3. ORGAN SYSTEM MULTI-SELECT */}
          <fieldset className="space-y-3">
            <div className="mb-3 flex items-center justify-between gap-4">
              <legend className={legend}>3. Organ Systems &amp; High-Yield Modules</legend>
              <button
                type="button"
                onClick={toggleSelectAll}
                className={`text-xs text-teal-700 underline-offset-4 transition-colors hover:text-teal-800 hover:underline ${focusRing}`}
              >
                {selectedSystems.length === AVAILABLE_SYSTEMS.length ? 'Deselect Extra' : 'Select All (5 Systems)'}
              </button>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-2 ">
              {AVAILABLE_SYSTEMS.map(sys => {
                const isChecked = selectedSystems.includes(sys.id);
                return (
                  <label
                    key={sys.id}
                    className="flex cursor-pointer items-center justify-between gap-4 rounded-md border-b border-slate-200 px-3 py-3 transition-colors last:border-b-0 hover:bg-slate-50 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-teal-300"
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSystem(sys.id)}
                        className="h-4 w-4 accent-teal-300"
                      />
                      <span className="text-sm text-slate-800">{sys.title}</span>
                    </span>
                    <span className="shrink-0 font-mono text-[11px] tabular-nums text-slate-500">
                      {sys.count} Qs
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {/* 4. BLOCK QUESTION COUNT */}
          <div className="space-y-3">
            <div className="mb-3 flex items-center justify-between gap-4">
              <label htmlFor="question-count" className={legend}>
                4. Number of Questions (Max 40 per USMLE block)
              </label>
              <span className="font-mono text-lg tabular-nums text-slate-900">
                {questionCount} Questions
              </span>
            </div>

            <input
              id="question-count"
              type="range"
              min="5"
              max="40"
              step="5"
              value={questionCount}
              onChange={(e) => setQuestionCount(parseInt(e.target.value))}
              className={`h-1 w-full cursor-pointer accent-teal-300 ${focusRing}`}
            />

            <div className="flex justify-between font-mono text-[11px] text-slate-500">
              <span>5 Qs (Quick Drill)</span>
              <span>20 Qs (Half Block)</span>
              <span>40 Qs (Standard USMLE Block)</span>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 sm:flex-row">
            <div className="text-xs text-slate-500">
              Selected: <span className="text-slate-800">{selectedSystems.length} systems</span> | <span className="text-slate-800">{examMode === 'tutor' ? 'Tutor Mode' : 'Timed 60m'}</span>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className={`flex w-full items-center justify-center gap-2 rounded-md bg-teal-700 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-800 disabled:opacity-60 sm:w-auto ${focusRing} focus-visible:outline-offset-2`}
            >
              <Play className="h-4 w-4" aria-hidden />
              <span>{isGenerating ? 'Configuring Exam Block...' : 'Generate Exam Block'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}