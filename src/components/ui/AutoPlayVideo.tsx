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
  maxDuration,
  controls = false,
  videoRef,
}: {
  src: string;
  muted?: boolean;
  className?: string;
  label?: string;
  preload?: 'none' | 'metadata' | 'auto';
  /** Render a "Preview unavailable" tile on failure. Ambient backdrops pass false and render nothing. */
  showFallback?: boolean;
  /** Maximum playback duration in seconds for looping previews (e.g. 3s). Disabled in fullscreen. */
  maxDuration?: number;
  /** Whether to show native player controls. Defaults to false. */
  controls?: boolean;
  /** Optional external ref to control the video element */
  videoRef?: React.RefObject<HTMLVideoElement | null> | ((node: HTMLVideoElement | null) => void);
}) {
  const localRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const setRefs = (node: HTMLVideoElement | null) => {
    (localRef as any).current = node;
    if (typeof videoRef === 'function') {
      videoRef(node);
    } else if (videoRef && 'current' in videoRef) {
      (videoRef as any).current = node;
    }
  };

  useEffect(() => {
    const v = localRef.current;
    if (v) {
      v.muted = muted;
      v.defaultMuted = muted;
      if (!muted) {
        void v.play().catch(() => {});
      }
    }
  }, [muted]);

  // Handle 3-second preview loop
  useEffect(() => {
    const v = localRef.current;
    if (!v || !maxDuration) return;

    const onTimeUpdate = () => {
      const isFs = document.fullscreenElement === v;
      if (!isFs && v.currentTime >= maxDuration) {
        v.currentTime = 0;
        void v.play().catch(() => {});
      }
    };

    v.addEventListener('timeupdate', onTimeUpdate);
    return () => {
      v.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, [maxDuration]);

  // Handle fullscreen state change
  useEffect(() => {
    const v = localRef.current;
    if (!v) return;

    const onFsChange = () => {
      const isFs = document.fullscreenElement === v;
      setIsFullscreen(isFs);
      if (isFs) {
        v.controls = true;
      } else {
        v.controls = controls;
        if (maxDuration && v.currentTime >= maxDuration) {
          v.currentTime = 0;
        }
      }
    };

    document.addEventListener('fullscreenchange', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
    };
  }, [controls, maxDuration]);

  useEffect(() => {
    const v = localRef.current;
    if (!v) return;
    // The error event can fire before hydration attaches onError, so check the settled state too.
    if (v.error) {
      setFailed(true);
      return;
    }

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
      ref={setRefs}
      src={videoSrc(src)}
      loop={!maxDuration}
      muted={muted}
      playsInline
      preload={preload}
      controls={isFullscreen ? true : controls}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
