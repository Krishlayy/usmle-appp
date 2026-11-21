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

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[99999] flex select-none flex-col items-center justify-center bg-[#070a0f] px-5 text-slate-100"
    >
      <div className="flex w-full max-w-xs flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-teal-300/80">Loading</span>
          <span className="font-mono text-3xl font-medium tabular-nums text-white">{progress}%</span>
        </div>
        <div
          className="h-px w-full bg-white/10"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Loading progress"
        >
          <div
            className="h-px bg-teal-300 transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="h-5 text-sm text-slate-400">{text || statuses[statusIndex]}</p>
      </div>
    </div>
  );
}