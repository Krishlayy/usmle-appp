'use client';

import React, { useRef, useState, useEffect } from 'react';
import { AutoPlayVideo } from '@/components/ui/AutoPlayVideo';
import { Reveal } from '@/components/ui/Reveal';
import {
  ArrowRight,
  Volume2,
  VolumeX,
  Sparkles,
  FastForward,
  Play,
  Pause,
  Lock,
  ShieldCheck,
} from 'lucide-react';

interface DashboardHeroSectionProps {
  displayName?: string;
}

export function DashboardHeroSection({ displayName }: DashboardHeroSectionProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.25);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        void videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const cycleSpeed = () => {
    const nextSpeed = playbackSpeed === 1 ? 1.25 : playbackSpeed === 1.25 ? 1.5 : 1;
    setPlaybackSpeed(nextSpeed);
  };

  const scrollToQBanks = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('qbanks');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="relative flex flex-col gap-6">
      {/* Top Welcome Title & Trust Strip */}
      <Reveal>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200/90 bg-teal-50 px-3 py-0.5 font-mono text-[10px] uppercase tracking-wider text-teal-800 font-semibold shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-600 animate-pulse" />
            Clinical Candidate Portal
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-slate-600">
            <ShieldCheck className="h-3 w-3 text-teal-600" />
            FRED v2 Exam Simulator Active
          </span>
        </div>
        <h1 className="max-w-3xl font-serif text-3xl font-medium leading-[1.1] tracking-tight text-slate-900 md:text-5xl">
          Welcome back, {displayName || 'Doctor'}.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
          Full 50-question clinical vignettes in authentic board conditions. Instant distractor rationales, selectable comparison tables, and HD video mnemonics.
        </p>
      </Reveal>

      {/* Enterprise Framed Hero Simulator Display */}
      <Reveal delay={0.08}>
        <div className="relative mx-auto w-full overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-950 shadow-xl transition-all duration-300 hover:border-slate-300">
          {/* Browser Window Header Chrome Bar */}
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/95 px-4 py-2.5 backdrop-blur-md">
            {/* Window Dots */}
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-500/80" />
              <span className="h-3 w-3 rounded-full bg-amber-500/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
            </div>

            {/* Session Location Pill */}
            <div className="flex items-center gap-1.5 rounded-md border border-slate-800 bg-slate-950/70 px-3 py-0.5 font-mono text-[11px] text-slate-400">
              <Lock className="h-3 w-3 text-teal-400" />
              <span>fred.nbme.org / exam-session #2026-STEP1</span>
            </div>

            {/* Live Status Badge */}
            <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-teal-400 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-ping" />
              <span>Live FRED v2 Engine</span>
            </div>
          </div>

          {/* The Continuous Boomerang Simulation Video Player (18-second HD loop) */}
          <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
            <AutoPlayVideo
              src="/videos/hero-simulator.mp4"
              muted={isMuted}
              preload="auto"
              videoRef={(el) => {
                videoRef.current = el;
              }}
              className="h-full w-full object-cover scale-[1.01] opacity-90 transition-opacity duration-300"
            />

            {/* Subtle vignette gradient for clinical contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-slate-950/30 pointer-events-none" />

            {/* Centered Enterprise CTA Button */}
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4">
              <a
                href="#qbanks"
                onClick={scrollToQBanks}
                className="group relative inline-flex items-center gap-3 rounded-xl bg-teal-700 px-7 py-3.5 text-sm md:text-base font-semibold text-white shadow-2xl backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-400 cursor-pointer"
              >
                <span>Explore Question Banks</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
              </a>
              <p className="mt-3 text-[11px] font-mono uppercase tracking-widest text-slate-200/90 drop-shadow-sm font-semibold">
                Instant Access &bull; Full 50-Question Blocks &bull; No Video Waiting Required
              </p>
            </div>

            {/* Top Video Preview Badge */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-white/20 bg-black/60 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-teal-300 font-semibold backdrop-blur-md shadow-xs">
                <Sparkles className="h-3 w-3 text-teal-400" />
                18s FRED v2 Board Simulator Demonstration
              </span>
            </div>

            {/* Bottom Video Controls Toolbar */}
            <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between text-white/90">
              {/* Left Controls: Play/Pause and Playback Speed */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="flex items-center gap-1.5 rounded-lg border border-white/20 bg-black/60 px-3 py-1.5 text-xs font-semibold backdrop-blur-md hover:bg-black/80 transition-colors cursor-pointer"
                  title={isPlaying ? 'Pause Simulator Video' : 'Play Simulator Video'}
                >
                  {isPlaying ? <Pause className="h-3.5 w-3.5 text-teal-400" /> : <Play className="h-3.5 w-3.5 text-teal-400" />}
                  <span className="font-mono text-[11px]">{isPlaying ? 'Pause' : 'Play'}</span>
                </button>

                <button
                  type="button"
                  onClick={cycleSpeed}
                  className="flex items-center gap-1.5 rounded-lg border border-white/20 bg-black/60 px-3 py-1.5 text-xs font-semibold backdrop-blur-md hover:bg-black/80 transition-colors cursor-pointer"
                  title="Adjust Video Playback Speed"
                >
                  <FastForward className="h-3.5 w-3.5 text-teal-400" />
                  <span className="font-mono text-[11px]">{playbackSpeed}x Speed</span>
                </button>
              </div>

              {/* Right Audio Control */}
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className="flex items-center gap-1.5 rounded-lg border border-white/20 bg-black/60 px-3 py-1.5 text-xs font-semibold backdrop-blur-md hover:bg-black/80 transition-colors cursor-pointer"
                title={isMuted ? 'Turn Sound On' : 'Mute Video'}
              >
                {isMuted ? <VolumeX className="h-3.5 w-3.5 text-slate-300" /> : <Volume2 className="h-3.5 w-3.5 text-teal-400" />}
                <span className="font-mono text-[11px]">{isMuted ? 'Muted' : 'Sound On'}</span>
              </button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
