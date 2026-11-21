'use client';

import React, { useState, useEffect } from 'react';

export function ClinicalLoadingScreen({ text }: { text?: string }) {
  const [progress, setProgress] = useState(15);
  const [statusIndex, setStatusIndex] = useState(0);

  const statuses = [
    "Calibrating High-Yield Question Bank...",
    "Loading USMLE Board Simulator...",
    "Pre-rendering Video Mnemonics...",
    "Synthesizing Distractor Rationales...",
    "Ready to Practice."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95;
        const next = prev + Math.floor(Math.random() * 8) + 4;
        return next > 95 ? 95 : next;
      });
    }, 280);

    const statusInterval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % statuses.length);
    }, 700);

    return () => {
      clearInterval(interval);
      clearInterval(statusInterval);
    };
  }, [statuses.length]);

  // Circumference for r=54 is 2 * PI * 54 = ~339.29
  const circumference = 339.3;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="fixed inset-0 z-[99999] bg-[#f8fafc] text-[#0f172a] flex flex-col items-center justify-center overflow-hidden font-sans select-none">
      {/* Background Medical Ambient Glows */}
      <div className="absolute top-[-10%] right-[15%] w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[15%] w-[450px] h-[450px] rounded-full bg-teal-500/10 blur-[100px] pointer-events-none" />

      {/* Subtle EKG Trace Horizon */}
      <div className="absolute bottom-12 inset-x-0 h-24 pointer-events-none opacity-40">
        <svg viewBox="0 0 1200 80" className="w-full h-full preserve-3d" fill="none">
          <path
            d="M 0 40 L 400 40 L 420 25 L 435 60 L 450 10 L 465 55 L 480 35 L 500 40 L 1200 40"
            stroke="#0d9488"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Center Clinical Neural Ring Loader */}
      <div className="relative flex flex-col items-center gap-6 z-10">
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 128 128">
            <circle
              className="text-slate-200"
              strokeWidth="5"
              stroke="currentColor"
              fill="transparent"
              r="54"
              cx="64"
              cy="64"
            />
            <circle
              className="text-teal-600 transition-all duration-300 ease-out"
              strokeWidth="5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="54"
              cx="64"
              cy="64"
            />
          </svg>

          {/* Stethoscope Pulse Center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200/80 flex items-center justify-center text-teal-700 shadow-sm animate-pulse">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/>
                <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/>
                <circle cx="20" cy="10" r="2"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Telemetry Progress & Status Text */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="font-mono text-3xl font-extrabold text-slate-900 tracking-tight">
            {progress}%
          </div>
          <div className="text-sm font-medium text-slate-600 transition-all duration-300 h-5">
            {text || statuses[statusIndex]}
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-[11px] font-semibold text-teal-700 shadow-2xs mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-ping" />
            <span>USMLE Clinical Engine Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
