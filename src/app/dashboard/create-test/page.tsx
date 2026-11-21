'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Play, 
  Clock, 
  HelpCircle, 
  CheckCircle2, 
  Sparkles, 
  Sliders, 
  Layers, 
  BookmarkCheck,
  AlertCircle
} from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8 animate-page-enter">
      
      {/* Title Header */}
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
          <Sliders className="w-3.5 h-3.5 text-teal-600" />
          <span>Interactive Exam Builder</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold font-serif text-slate-900 tracking-tight">
          Custom Test Generation <span className="text-teal-700 italic">Matrix</span>
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl">
          Replicate the exact UWorld exam block builder. Configure mode, question pool status, organ systems, and timed block length.
        </p>
      </div>

      <form onSubmit={handleGenerateBlock} className="space-y-8">
        
        {/* 1. TEST MODE SELECTOR */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1.5">
            <span>1. Select Examination Mode</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div 
              onClick={() => setExamMode('tutor')}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                examMode === 'tutor' 
                  ? 'border-teal-600 bg-teal-50/70 shadow-sm ring-2 ring-teal-600/10' 
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <input 
                  type="radio" 
                  name="examMode" 
                  checked={examMode === 'tutor'} 
                  onChange={() => setExamMode('tutor')}
                  className="text-teal-600 focus:ring-teal-500" 
                />
                <span className="font-bold text-sm text-slate-900">Tutor Mode (Immediate Rationale)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-5">
                Reveals distractor breakdowns, educational objective, and high-yield video mnemonic immediately after each question.
              </p>
            </div>

            <div 
              onClick={() => setExamMode('timed')}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                examMode === 'timed' 
                  ? 'border-teal-600 bg-teal-50/70 shadow-sm ring-2 ring-teal-600/10' 
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <input 
                  type="radio" 
                  name="examMode" 
                  checked={examMode === 'timed'} 
                  onChange={() => setExamMode('timed')}
                  className="text-teal-600 focus:ring-teal-500" 
                />
                <span className="font-bold text-sm text-slate-900">Timed Mode (Strict Exam Pace)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-5">
                Authentic 60-minute countdown with no answer reveals until the entire block is submitted for evaluation.
              </p>
            </div>

          </div>
        </div>

        {/* 2. QUESTION POOL STATUS */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
            2. Question Status Filter
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {[
              { id: 'unused', label: 'Unused Questions' },
              { id: 'incorrect', label: 'Incorrect Only' },
              { id: 'flagged', label: 'Marked / Flagged' },
              { id: 'all', label: 'All Pool (250 Qs)' },
            ].map(status => {
              const active = questionStatus === status.id;
              return (
                <div
                  key={status.id}
                  onClick={() => setQuestionStatus(status.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    active 
                      ? 'border-teal-600 bg-teal-50 font-bold text-teal-900 shadow-sm' 
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <span className="text-xs">{status.label}</span>
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    active ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-300'
                  }`}>
                    {active && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. ORGAN SYSTEM MULTI-SELECT */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
              3. Organ Systems & High-Yield Modules
            </label>
            <button 
              type="button" 
              onClick={toggleSelectAll} 
              className="text-xs font-semibold text-teal-700 hover:underline"
            >
              {selectedSystems.length === AVAILABLE_SYSTEMS.length ? 'Deselect Extra' : 'Select All (5 Systems)'}
            </button>
          </div>

          <div className="space-y-2 bg-white rounded-xl border border-slate-200 p-4">
            {AVAILABLE_SYSTEMS.map(sys => {
              const isChecked = selectedSystems.includes(sys.id);
              return (
                <label 
                  key={sys.id}
                  onClick={() => toggleSystem(sys.id)}
                  className="flex items-center justify-between py-2 border-b border-slate-100 last:border-b-0 cursor-pointer hover:bg-slate-50 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <input 
                      type="checkbox" 
                      checked={isChecked}
                      onChange={() => {}}
                      className="rounded text-teal-600 focus:ring-teal-500" 
                    />
                    <span className="text-xs font-medium text-slate-900">{sys.title}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {sys.count} Qs
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* 4. BLOCK QUESTION COUNT */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
              4. Number of Questions (Max 40 per USMLE block)
            </label>
            <span className="font-mono text-base font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-lg border border-teal-200">
              {questionCount} Questions
            </span>
          </div>

          <input 
            type="range" 
            min="5" 
            max="40" 
            step="5" 
            value={questionCount} 
            onChange={(e) => setQuestionCount(parseInt(e.target.value))}
            className="w-full accent-teal-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
          />

          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>5 Qs (Quick Drill)</span>
            <span>20 Qs (Half Block)</span>
            <span>40 Qs (Standard USMLE Block)</span>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            Selected: <span className="font-semibold text-slate-800">{selectedSystems.length} systems</span> | <span className="font-semibold text-slate-800">{examMode === 'tutor' ? 'Tutor Mode' : 'Timed 60m'}</span>
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm shadow-md shadow-teal-700/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{isGenerating ? 'Configuring Exam Block...' : 'Generate Exam Block'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
