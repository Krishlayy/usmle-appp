'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, ArrowRight, Maximize2 } from 'lucide-react';
import { FullScreenVideoModal } from './FullScreenVideoModal';

export function HeroSimulatorMotion() {
  const [selectedOption, setSelectedOption] = useState<string>('B');
  const [isClicking, setIsClicking] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 75, y: 55 });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Smooth automatic cursor animation simulating user interacting with option B
  useEffect(() => {
    let isCancelled = false;
    const timeouts: NodeJS.Timeout[] = [];

    const schedule = (fn: () => void, ms: number) => {
      const id = setTimeout(() => {
        if (!isCancelled) fn();
      }, ms);
      timeouts.push(id);
    };

    const runSequence = () => {
      setCursorPos({ x: 80, y: 75 });
      setIsClicking(false);

      schedule(() => {
        setCursorPos({ x: 50, y: 56 });

        schedule(() => {
          setIsClicking(true);
          setSelectedOption('B');

          schedule(() => {
            setIsClicking(false);
            schedule(() => {
              runSequence();
            }, 4500);
          }, 250);
        }, 1100);
      }, 800);
    };

    runSequence();

    return () => {
      isCancelled = true;
      timeouts.forEach(clearTimeout);
    };
  }, []);

  return (
    <>
      <div className="w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden relative group transition-all">
        {/* Top Minimal Window Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50/90 border-b border-slate-200 select-none">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Interactive Clinical Vignette</span>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-teal-50 hover:bg-teal-100 text-teal-800 text-[11px] font-semibold border border-teal-200 transition-colors"
              title="Play Video in Fullscreen"
            >
              <Maximize2 className="w-3 h-3 text-teal-700" />
              <span>Watch Video</span>
            </button>
          </div>
        </div>

        {/* Interactive Question Card Body */}
        <div className="p-5 flex flex-col justify-between select-none relative bg-white">
          {/* Top Bar in Simulator */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200/70 font-mono">
                CASE EVALUATION • CARDIOVASCULAR
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Item 1 of 40</span>
            </div>
            <div className="text-[11px] font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
              ⏱️ 01:12
            </div>
          </div>

          {/* Vignette Text */}
          <div className="py-3 text-left">
            <p className="text-xs text-slate-700 leading-relaxed font-sans">
              A 54-year-old male presents with exertional dyspnea and orthopnea. Auscultation reveals a grade 3/6 holosystolic murmur at the apex radiating to the left axilla. Which hemodynamic mechanism explains this finding?
            </p>
          </div>

          {/* Options */}
          <div className="space-y-2 text-left text-xs font-sans relative">
            {/* Option A */}
            <div 
              className={`p-2.5 rounded-lg border flex items-center gap-2.5 cursor-pointer transition-all ${
                selectedOption === 'A' ? 'border-teal-500 bg-teal-50/70' : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
              onClick={() => setSelectedOption('A')}
            >
              <span className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center font-semibold text-[10px] text-slate-600 bg-slate-50">
                A
              </span>
              <span className="text-slate-700">Subepithelial spike and dome immune deposits</span>
            </div>

            {/* Option B (Target of Animated Cursor) */}
            <div 
              className={`p-2.5 rounded-lg border-2 flex items-center justify-between gap-2.5 cursor-pointer transition-all ${
                selectedOption === 'B' 
                  ? 'border-teal-500 bg-teal-50/80 ring-2 ring-teal-500/20' 
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
              onClick={() => setSelectedOption('B')}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-[10px]">
                  B
                </span>
                <span className="font-semibold text-slate-900">
                  Mitral regurgitation with retrograde left atrial volume overload
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-white px-2 py-0.5 rounded border border-teal-300 shrink-0 font-mono">
                Correct 88%
              </span>
            </div>

            {/* Option C */}
            <div 
              className={`p-2.5 rounded-lg border flex items-center gap-2.5 cursor-pointer transition-all ${
                selectedOption === 'C' ? 'border-teal-500 bg-teal-50/70' : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
              onClick={() => setSelectedOption('C')}
            >
              <span className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center font-semibold text-[10px] text-slate-600 bg-slate-50">
                C
              </span>
              <span className="text-slate-700">Aortic stenosis with systolic crescendo-decrescendo murmur</span>
            </div>

            {/* Option D */}
            <div 
              className={`p-2.5 rounded-lg border flex items-center gap-2.5 cursor-pointer transition-all ${
                selectedOption === 'D' ? 'border-teal-500 bg-teal-50/70' : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
              onClick={() => setSelectedOption('D')}
            >
              <span className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center font-semibold text-[10px] text-slate-600 bg-slate-50">
                D
              </span>
              <span className="text-slate-700">Tricuspid regurgitation with inspiratory murmur augmentation</span>
            </div>
          </div>

          {/* Animated Hand/Cursor Vector */}
          <div 
            className="absolute pointer-events-none transition-all duration-700 ease-out z-30"
            style={{
              left: `${cursorPos.x}%`,
              top: `${cursorPos.y}%`,
              transform: `translate(-2px, -2px) scale(${isClicking ? 0.9 : 1})`,
            }}
          >
            <svg className="w-5 h-5 text-slate-900 drop-shadow-md" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 0l16 12.279-6.951 1.17 4.325 8.817-3.596 1.734-4.35-8.879-5.428 5.439z"/>
            </svg>
            {isClicking && (
              <span className="absolute -top-1 -left-1 w-7 h-7 rounded-full border-2 border-teal-500 animate-ping opacity-75" />
            )}
          </div>

          {/* Bottom Video Mnemonic Attached Teaser */}
          <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-teal-600 text-white flex items-center justify-center shadow-2xs">
                <Play className="w-3 h-3 fill-white translate-x-0.5" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-900">Video Mnemonic Attached</div>
                <div className="text-[10px] text-slate-500 font-sans">Mitral Valve Auscultation & Hemodynamics (2:15)</div>
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-2.5 py-1 rounded bg-white border border-slate-300 text-[11px] font-semibold text-teal-700 hover:bg-teal-50 transition-colors inline-flex items-center gap-1 shadow-2xs"
            >
              <span>Play Fullscreen Video</span>
              <Maximize2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 100% Fullscreen Cinematic Video Modal */}
      <FullScreenVideoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
