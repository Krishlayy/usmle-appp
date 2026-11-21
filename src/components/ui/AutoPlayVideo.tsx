'use client';

import { useEffect, useRef, useState } from 'react';
import { videoSrc } from '@/lib/videoUrl';

/**
 * Looping ambient/preview video that actually autoplays.
 *
 * - Browsers only autoplay muted video, and React does not reliably emit the `muted` attribute
 *   in server HTML, so muting is applied imperatively before play().
 * - Plays only while on screen and the tab is visible (smooth scrolling, less bandwidth).
 * - With prefers-reduced-motion it does not autoplay; native controls appear instead.
 * - A missing/failed file renders a quiet placeholder instead of a black box.
 */
export function AutoPlayVideo({
  src,
  muted = true,
  className = '',
  label,
  preload = 'metadata',
  showFallback = true,
}: {
  src: string;
  muted?: boolean;
  className?: string;
  label?: string;
  preload?: 'none' | 'metadata' | 'auto';
  /** Render a "Preview unavailable" tile on failure. Ambient backdrops pass false and render nothing. */
  showFallback?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (v) {
      v.muted = muted;
      v.defaultMuted = muted;
    }
  }, [muted]);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    // The error event can fire before hydration attaches onError, so check the settled state too.
    if (v.error) {
      setFailed(true);
      return;
    }
    const reduce =window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReduceMotion(reduce);
    if (reduce) return;

    let onScreen = false;
    const sync = () => {
      if (onScreen && !document.hidden) void v.play().catch(() => {});
      else v.pause();
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      { threshold: 0.25 },
    );
    io.observe(v);
    document.addEventListener('visibilitychange', sync);
    v.addEventListener('canplay', sync);
    // Some browsers defer autoplay until the first gesture.
    window.addEventListener('pointerdown', sync, { once: true });
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', sync);
      v.removeEventListener('canplay', sync);
      window.removeEventListener('pointerdown', sync);
    };
  }, [src]);

  if (failed) {
    if (!showFallback) return null;
    return (
      <div
        role="img"
        aria-label={label}
        className={`flex items-center justify-center bg-slate-100 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-400 ${className}`}
      >
        Preview unavailable
      </div>
    );
  }

  return (
    <video
      ref={ref}
      src={videoSrc(src)}
      loop
      muted
      playsInline
      preload={preload}
      controls={reduceMotion}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
