'use client';

import { Activity } from 'lucide-react';

export function MedicalLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8 animate-fade-slide-up">
      <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 shadow-sm border border-blue-100 overflow-hidden">
        {/* Heartbeat sweep animation */}
        <div className="absolute inset-0 bg-blue-100/50 -translate-x-full animate-[sweep_2s_ease-in-out_infinite]" />
        
        {/* Pulse scale animation */}
        <div className="relative animate-[pulse-scale_2s_ease-in-out_infinite]">
          <Activity className="w-8 h-8" strokeWidth={2.5} />
        </div>
      </div>
      <p className="text-scale-sm font-semibold text-secondary animate-pulse">{text}</p>
    </div>
  );
}
