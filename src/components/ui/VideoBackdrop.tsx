import { AutoPlayVideo } from './AutoPlayVideo';

/**
 * Clean full-viewport ambient backdrop for clinical focus.
 * By default, renders a subtle medical radial gradient and micro-grid.
 * Background simulator video is disabled to eliminate visual clutter and distractions.
 */
export function VideoBackdrop({ src }: { src?: string }) {
  if (!src || src === '/videos/hero-simulator.mp4') {
    return (
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-white">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-50/50 via-white to-white" />
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px] opacity-40" />
      </div>
    );
  }

  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-teal-50 via-white to-sky-50">
      <AutoPlayVideo
        src={src}
        preload="auto"
        showFallback={false}
        className="h-full w-full scale-105 object-cover opacity-65 mix-blend-multiply"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/40 to-white/75 pointer-events-none" />
    </div>
  );
}

