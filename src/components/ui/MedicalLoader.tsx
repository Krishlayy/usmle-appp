'use client';

export function MedicalLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center gap-4 p-8 text-slate-400"
    >
      <div className="relative h-px w-40 overflow-hidden bg-white/10">
        <div className="absolute inset-y-0 left-0 w-full bg-teal-300 motion-safe:animate-[sweep_1.6s_ease-in-out_infinite]" />
      </div>
      <p className="font-mono text-[11px] uppercase tracking-[0.18em]">{text}</p>
    </div>
  );
}