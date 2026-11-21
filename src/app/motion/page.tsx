'use client';

import Link from 'next/link';
import { ArrowLeft, Play, RefreshCw, Maximize2, ShoppingCart } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';

export default function MotionPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [videoEnded, setVideoEnded] = useState(false);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'VIDEO_ENDED') {
        setVideoEnded(true);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const restartVideo = () => {
    setVideoEnded(false);
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        // @ts-expect-error custom contract
        iframeRef.current.contentWindow.OPENER?.seek(0);
      } catch {
        iframeRef.current.src = '/motion/index.html?clean=1';
      }
    }
  };

  const openFullscreen = () => {
    if (iframeRef.current) {
      if (iframeRef.current.requestFullscreen) {
        iframeRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-slate-200 bg-white/90 backdrop-blur-md px-6 flex items-center justify-between z-20 sticky top-0">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-teal-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Micro Q-Bank Cinematic Motion Graphic (Bang-Motion)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/store"
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-extrabold text-white transition-all shadow-md hover:scale-105 ${
              videoEnded
                ? 'bg-gradient-to-r from-teal-600 to-cyan-600 ring-2 ring-teal-400 ring-offset-2 animate-pulse'
                : 'bg-teal-600 hover:bg-teal-500'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Buy Now</span>
          </Link>

          <button
            onClick={restartVideo}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Replay (R)</span>
          </button>

          <button
            onClick={openFullscreen}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-2xs"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Fullscreen</span>
          </button>
        </div>
      </header>

      {/* Main Video Viewport */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 bg-slate-100/50">
        <div className="w-full max-w-6xl aspect-[16/9] bg-white rounded-2xl border border-slate-200/90 shadow-2xl overflow-hidden relative">
          <iframe
            ref={iframeRef}
            src="/motion/index.html?clean=1"
            className="w-full h-full border-none"
            title="Micro Q-Bank Bang-Motion Video"
            allow="autoplay"
          />
        </div>

        <div className="mt-4 flex items-center gap-6 text-xs text-slate-500 font-medium">
          <span>Shortcuts: <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono">Space</kbd> Pause/Play</span>
          <span><kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono">R</kbd> Restart</span>
          <span><kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono">L</kbd> Toggle Loading Mode</span>
          <span><kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono">D</kbd> Toggle Scrubber</span>
        </div>
      </main>
    </div>
  );
}
