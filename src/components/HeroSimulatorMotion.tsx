'use client';

import { useState, useEffect } from 'react';
import { Play, CheckCircle2 } from 'lucide-react';

export function HeroSimulatorMotion() {
  // Interactive Simulation State
  const [cursorPos, setCursorPos] = useState({ x: 80, y: 82 });
  const [isClicking, setIsClicking] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showMnemonic, setShowMnemonic] = useState(false);

  // Auto-run animated sequence on load / refresh
  useEffect(() => {
    let isCancelled = false;
    let timeouts: NodeJS.Timeout[] = [];

    const schedule = (fn: () => void, ms: number) => {
      const id = setTimeout(() => {
        if (!isCancelled) fn();
      }, ms);
      timeouts.push(id);
    };

    const runSequence = () => {
      // Step 0: Initial Reset
      setSelectedOption(null);
      setShowMnemonic(false);
      setCursorPos({ x: 80, y: 82 });
      setIsClicking(false);

      // Step 1: Smoothly glide cursor towards Option A
      schedule(() => {
        setCursorPos({ x: 34, y: 46 });

        // Step 2: Tactile click event
        schedule(() => {
          setIsClicking(true);
          setSelectedOption('A');

          // Step 3: Complete click & reveal Video Mnemonic
          schedule(() => {
            setIsClicking(false);
            setShowMnemonic(true);

            // Step 4: Hold state to let viewer absorb, then repeat loop
            schedule(() => {
              runSequence();
            }, 4500);
          }, 250);
        }, 1100);
      }, 700);
    };

    runSequence();

    return () => {
      isCancelled = true;
      timeouts.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="relative group w-full max-w-2xl mx-auto">
      {/* Ambient Gradient Glow */}
      <div className="absolute -inset-2 bg-gradient-to-r from-teal-500/15 via-cyan-500/15 to-blue-500/15 rounded-3xl blur-2xl opacity-60 group-hover:opacity-80 transition-opacity pointer-events-none" />

      {/* Main Glass Frame */}
      <div className="relative bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-[0_20px_50px_rgba(15,23,42,0.10)] overflow-hidden">
        
        {/* Minimal Plain Window Header (No tabs, no simulator preview text) */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50/80 border-b border-slate-200/80 select-none">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Interactive Simulator</span>
          </div>
        </div>

        {/* Live Vector Motion Graphic Simulator */}
        <div className="relative min-h-[380px] bg-slate-50/40 p-5 sm:p-6 flex flex-col justify-between select-none overflow-hidden gap-3">
          
          {/* Top Clinical Bar in Simulator */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/70">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200/70">
                CASE EVALUATION • CARDIOVASCULAR
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Item 1 of 40</span>
            </div>
            <div className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
              ⏱️ 01:12
            </div>
          </div>

          {/* Abstract Clinical Vignette Redacted Skeleton (No Real Question Exposed!) */}
          <div className="space-y-2 py-1.5">
            <div className="h-2.5 bg-slate-200/90 rounded-full w-full" />
            <div className="h-2.5 bg-slate-200/80 rounded-full w-[88%]" />
            <div className="h-2.5 bg-slate-200/70 rounded-full w-[65%]" />
          </div>

          {/* Option Cards */}
          <div className="space-y-2">
            {/* Option A (Selected by Animated Cursor) */}
            <div 
              className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 cursor-pointer ${
                selectedOption === 'A'
                  ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
              }`}
              onClick={() => {
                setSelectedOption('A');
                setShowMnemonic(true);
              }}
            >
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  selectedOption === 'A' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  A
                </span>
                <span className={`text-xs font-medium transition-colors ${
                  selectedOption === 'A' ? 'text-emerald-950 font-semibold' : 'text-slate-700'
                }`}>
                  Primary Diagnostic Differential & Pathologic Mechanism
                </span>
              </div>
              {selectedOption === 'A' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 pr-2 animate-in fade-in zoom-in-95 duration-200">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                </span>
              )}
            </div>

            {/* Option B (Distractor with Strikethrough) */}
            <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/60 bg-slate-100/60 opacity-60">
              <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center text-xs font-bold">
                B
              </span>
              <span className="text-xs text-slate-400 line-through">
                Secondary Alternative Physiological Finding
              </span>
            </div>

            {/* Option C */}
            <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white">
              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">
                C
              </span>
              <span className="text-xs text-slate-700">
                Non-contributory Pathological Presentation
              </span>
            </div>
          </div>

          {/* Video Mnemonic Unlocked Panel */}
          <div 
            className={`p-3 rounded-xl border border-teal-200/80 bg-gradient-to-r from-teal-50 via-cyan-50/60 to-white flex items-center justify-between transition-all duration-500 ${
              showMnemonic ? 'opacity-100 translate-y-0 shadow-xs' : 'opacity-0 translate-y-2 pointer-events-none'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-xs shrink-0">
                <Play className="w-4 h-4 fill-white translate-x-0.5" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-teal-900 flex items-center gap-1.5">
                  <span>Video Mnemonic Unlocked</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-teal-200/60 text-teal-800 font-mono">1:45</span>
                </div>
                <div className="text-[10px] text-teal-700">High-yield visual memory aid reinforces the core pathophysiology</div>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-teal-700 bg-white px-2 py-1 rounded-md border border-teal-200 shadow-2xs shrink-0 hidden sm:inline-block">
              Tutor Mode
            </span>
          </div>

          {/* Animated Pointer Cursor (Appears on enter / refresh) */}
          <div 
            className="absolute pointer-events-none transition-all duration-700 ease-out z-30"
            style={{
              left: `${cursorPos.x}%`,
              top: `${cursorPos.y}%`,
              transform: `translate(-2px, -2px) scale(${isClicking ? 0.9 : 1})`,
            }}
          >
            <svg 
              className="w-6 h-6 drop-shadow-md" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.45 0 .67-.54.35-.85L5.85 2.36a.5.5 0 0 0-.35-.15z" 
                fill="#0f172a" 
                stroke="#ffffff" 
                strokeWidth="1.5"
              />
            </svg>
            {isClicking && (
              <span className="absolute -top-1 -left-1 w-8 h-8 rounded-full border-2 border-teal-500 animate-ping opacity-75" />
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
