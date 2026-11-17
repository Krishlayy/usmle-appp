'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Sparkles, CheckCircle2, RotateCcw, MonitorPlay } from 'lucide-react';

export function HeroSimulatorMotion() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [interactiveMode, setInteractiveMode] = useState(true);
  
  // Interactive Simulation State
  const [cursorPos, setCursorPos] = useState({ x: 75, y: 80 });
  const [isClicking, setIsClicking] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [step, setStep] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Auto-run animated sequence when in interactive mode
  useEffect(() => {
    if (!interactiveMode) return;

    let timeoutId: NodeJS.Timeout;

    const runSequence = () => {
      // Step 0: Reset
      setStep(0);
      setSelectedOption(null);
      setShowMnemonic(false);
      setCursorPos({ x: 80, y: 75 });
      setIsClicking(false);

      // Step 1: Move cursor to Option A
      timeoutId = setTimeout(() => {
        setStep(1);
        setCursorPos({ x: 38, y: 44 });

        // Step 2: Click
        timeoutId = setTimeout(() => {
          setIsClicking(true);
          setSelectedOption('A');

          timeoutId = setTimeout(() => {
            setIsClicking(false);
            setStep(2);
            setShowMnemonic(true);

            // Step 3: Hold then loop
            timeoutId = setTimeout(() => {
              runSequence();
            }, 3500);
          }, 300);
        }, 1200);
      }, 800);
    };

    runSequence();

    return () => clearTimeout(timeoutId);
  }, [interactiveMode]);

  return (
    <div className="relative group w-full max-w-2xl mx-auto">
      {/* Ambient Gradient Glow */}
      <div className="absolute -inset-2 bg-gradient-to-r from-teal-500/20 via-cyan-500/20 to-blue-500/20 rounded-3xl blur-2xl opacity-60 group-hover:opacity-80 transition-opacity pointer-events-none" />

      {/* Main Glass Frame */}
      <div className="relative bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-[0_20px_50px_rgba(15,23,42,0.12)] overflow-hidden">
        
        {/* Top Window Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50/90 border-b border-slate-200 select-none">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-400/90 shadow-sm inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-400/90 shadow-sm inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-400/90 shadow-sm inline-block" />
            <span className="text-[11px] font-semibold text-slate-500 ml-2 tracking-wide font-mono">
              USMLE_SIMULATOR_PREVIEW
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Switcher Pill */}
            <div className="flex items-center bg-slate-200/70 p-0.5 rounded-lg text-[11px] font-medium text-slate-600">
              <button
                onClick={() => setInteractiveMode(false)}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  !interactiveMode ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'hover:text-slate-900'
                }`}
              >
                Motion Video
              </button>
              <button
                onClick={() => setInteractiveMode(true)}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  interactiveMode ? 'bg-white text-teal-700 shadow-xs font-semibold' : 'hover:text-slate-900'
                }`}
              >
                Interactive
              </button>
            </div>
          </div>
        </div>

        {/* Video Mode */}
        {!interactiveMode ? (
          <div className="relative aspect-[16/10] bg-slate-950 flex items-center justify-center overflow-hidden">
            <video
              ref={videoRef}
              src="/videos/hero-simulator.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover select-none"
            />

            {/* Subtle Overlay Badge */}
            <div className="absolute bottom-3 right-3 z-10 pointer-events-none">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/10 text-white text-[10px] font-medium tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Motion Graphic Loop • 60 FPS
              </span>
            </div>
          </div>
        ) : (
          /* Live Vector / Interactive Simulated Mode */
          <div className="relative min-h-[370px] bg-slate-50/50 p-5 sm:p-6 flex flex-col justify-between select-none overflow-hidden gap-3">
            
            {/* Top Navigation Bar in simulator */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/70">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                  CONFIDENTIAL CASE STUDY
                </span>
                <span className="text-[11px] text-slate-400 font-medium">Question 1 of 40</span>
              </div>
              <div className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                ⏱️ 01:14
              </div>
            </div>

            {/* Abstract Clinical Vignette Redacted Skeleton (No Real Question Exposed!) */}
            <div className="space-y-2 py-2">
              <div className="h-3 bg-slate-200/80 rounded-full w-full" />
              <div className="h-3 bg-slate-200/80 rounded-full w-[88%]" />
              <div className="h-3 bg-slate-200/80 rounded-full w-[72%]" />
            </div>

            {/* Option Cards */}
            <div className="space-y-2">
              {/* Option A (Target) */}
              <div 
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all duration-300 ${
                  selectedOption === 'A'
                    ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
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
                    Primary Diagnostic Hypothesis & Systematic Differential
                  </span>
                </div>
                {selectedOption === 'A' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 pr-2 animate-in fade-in zoom-in-95 duration-200">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                  </span>
                )}
              </div>

              {/* Option B (Distractor with Strikethrough) */}
              <div className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200/60 bg-slate-100/60 opacity-60">
                <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center text-xs font-bold">
                  B
                </span>
                <span className="text-xs text-slate-400 line-through">
                  Secondary Alternative Physiological Mechanism
                </span>
              </div>

              {/* Option C */}
              <div className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 bg-white">
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
              className={`p-3 rounded-xl border border-teal-200 bg-gradient-to-r from-teal-50 to-cyan-50 flex items-center justify-between transition-all duration-500 ${
                showMnemonic ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-xs">
                  <Play className="w-4 h-4 fill-white translate-x-0.5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-teal-900 flex items-center gap-1.5">
                    <span>Video Mnemonic Unlocked</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-teal-200/60 text-teal-800 font-mono">1:45</span>
                  </div>
                  <div className="text-[10px] text-teal-700">High-yield visual memory aid for rapid concept recall</div>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-teal-700 bg-white px-2 py-1 rounded-md border border-teal-200 shadow-2xs">
                Tutor Mode
              </span>
            </div>

            {/* Animated Pointer Cursor */}
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
        )}

      </div>
    </div>
  );
}
