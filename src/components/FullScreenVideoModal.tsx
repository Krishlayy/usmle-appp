'use client';

import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { X, RefreshCw, ShoppingCart } from 'lucide-react';

interface FullScreenVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FullScreenVideoModal({ isOpen, onClose }: FullScreenVideoModalProps) {
  const [mounted, setMounted] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    // Reset ended state when modal opens
    setVideoEnded(false);

    // Prevent background scrolling while fullscreen video is open
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'r' || e.key === 'R') {
        restart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'VIDEO_ENDED') {
        setVideoEnded(true);
      }
    };
    window.addEventListener('message', handleMessage);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('message', handleMessage);
    };
  }, [isOpen, onClose]);

  const restart = () => {
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

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999999] bg-[#f8fafc] flex flex-col items-center justify-center overflow-hidden select-none animate-page-enter">
      {/* Top Floating Action Bar */}
      <div className="fixed top-6 right-8 flex items-center gap-3 z-[1000000]">
        {/* Buy Now Button in Header when Video Ends or anytime */}
        <Link
          href="/store"
          onClick={onClose}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold text-white transition-all shadow-lg hover:scale-105 ${
            videoEnded 
              ? 'bg-gradient-to-r from-teal-600 to-cyan-600 ring-2 ring-teal-400 ring-offset-2 animate-pulse'
              : 'bg-teal-600 hover:bg-teal-500'
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>Buy Now</span>
        </Link>

        <button
          onClick={restart}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-md transition-all hover:scale-105"
          title="Restart Video to 0s (R)"
        >
          <RefreshCw className="w-3.5 h-3.5 text-teal-600" />
          <span>Replay [R]</span>
        </button>

        <button
          onClick={onClose}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-lg hover:scale-105"
          title="Exit Fullscreen (Esc)"
        >
          <X className="w-4 h-4" />
          <span>Exit Fullscreen [Esc]</span>
        </button>
      </div>

      {/* 100% Fullscreen Viewport */}
      <div className="w-full h-full relative">
        <iframe
          ref={iframeRef}
          src="/motion/index.html?clean=1"
          className="w-full h-full border-none"
          title="Micro Q-Bank Fullscreen Cinematic Video"
          allow="autoplay; fullscreen"
        />
      </div>

      {/* Bottom Floating Keyboard Hint */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-slate-200 shadow-xs text-slate-500 text-xs font-medium z-[1000000] pointer-events-none">
        Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[11px]">Space</kbd> to Pause/Play • <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[11px]">Esc</kbd> to Exit
      </div>
    </div>,
    document.body
  );
}
