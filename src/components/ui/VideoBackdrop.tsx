'use client';

import { useEffect, useRef } from 'react';

/**
 * Full-viewport looping video behind page content. Fixed, non-interactive, dimmed by
 * a scrim so foreground text always passes contrast. Pauses when the tab is hidden or
 * the user prefers reduced motion (poster/ink background remains).
 */
export function VideoBackdrop({ src = '/videos/hero-simulator.mp4' }: { src?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      v.pause();
      return;
    }
    const onVis = () => (document.hidden ? v.pause() : void v.play().catch(() => {}));
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden bg-[#070a0f]">
      <video
        ref={ref}
        src={src}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="h-full w-full object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#070a0f]/70 via-[#070a0f]/80 to-[#070a0f]" />
    </div>
  );
}
