'use client';

export function MedicalLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center gap-4 p-8 text-slate-500"
    >
      <div className="relative h-px w-40 overflow-hidden bg-slate-200">
        <div className="absolute inset-y-0 left-0 w-full bg-teal-600 motion-safe:animate-[sweep_1.6s_ease-in-out_infinite]" />
      </div>
      <p className="font-mono text-[11px] uppercase tracking-[0.18em]">{text}</p>
    </div>
  );
}