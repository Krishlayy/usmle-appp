'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { LandingQBanksSection } from '@/components/LandingQBanksSection';
import { Reveal } from '@/components/ui/Reveal';
import { AutoPlayVideo } from '@/components/ui/AutoPlayVideo';
import { ArrowRight, Volume2, VolumeX, Sparkles, FastForward, Play, Pause, ChevronRight } from 'lucide-react';

const STATS = [
  { value: '200', label: 'Curated Questions' },
  { value: '38', label: 'Video Mnemonics' },
  { value: '4', label: 'Clinical Question Banks' },
  { value: '2', label: 'Tutor & Timed Modes' },
];

const PILLARS = [
  {
    n: '01',
    title: 'Authentic Board Simulation',
    body: 'Matches the exact visual layout, strikethrough, lab value lookups, and reverse-color contrast of official NBME FRED v2 and UWorld exam software.',
  },
  {
    n: '02',
    title: 'Selectable Comparison Tables',
    body: 'No flattened images or uncopyable text. High-yield differential diagnosis tables are rendered in clean, highlightable HTML with clear column borders.',
  },
  {
    n: '03',
    title: 'HD Visual Memory Anchors',
    body: 'Complex molecular mechanisms and histopathology slides are reinforced by dedicated video mnemonics mapped directly to every question item.',
  },
];

export default function Home() {
  const { data: session } = useSession();
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

  return (
    <div className="relative flex min-h-screen flex-col bg-white text-slate-900">
      {/* Subtle medical ambient glow & micro-grid */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-50/50 via-white to-white" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px] opacity-40" />

      {/* Hero Section */}
      <section className="relative px-5 pt-16 pb-20 md:px-10 md:pt-20">
        <div className="mx-auto w-full max-w-6xl">
          <Reveal>
            <div className="text-center max-w-3xl mx-auto mb-10">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200/80 bg-teal-50/80 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-teal-800 font-semibold mb-4 shadow-2xs">
                <Sparkles className="h-3 w-3 text-teal-600" />
                Live Authentic FRED v2 &amp; UWorld Simulation
              </span>
              <h1 className="font-serif text-4xl font-medium leading-[1.1] tracking-tight text-slate-900 md:text-6xl">
                Master Medical Concepts with <span className="text-teal-700">Clinical Authority</span>
              </h1>
              <p className="mt-4 text-base leading-relaxed text-slate-600 md:text-lg">
                Practice full-length vignettes in exact board conditions with distractor rationales, selectable comparison tables, and HD video mnemonics.
              </p>
            </div>
          </Reveal>

          {/* Interactive Boomerang Hero Video with Centered Explore CTA */}
          <Reveal delay={0.1}>
            <div className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-2xl transition-all duration-300 hover:border-slate-300">
              {/* The Continuous Video Player */}
              <div className="relative aspect-video w-full overflow-hidden">
                <AutoPlayVideo
                  src="/videos/hero-simulator.mp4"
                  muted={isMuted}
                  preload="auto"
                  videoRef={(el) => {
                    videoRef.current = el;
                  }}
                  className="h-full w-full object-cover scale-[1.02] opacity-90 transition-opacity duration-300"
                />

                {/* Subtle vignette shade for contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/30 to-slate-950/40 pointer-events-none" />

                {/* Centered High-Visibility CTA Button */}
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4">
                  <a
                    href="#qbanks"
                    className="group relative inline-flex items-center gap-2.5 rounded-xl bg-teal-700/95 px-8 py-4 text-sm md:text-base font-semibold text-white shadow-2xl backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-400"
                  >
                    <span>Explore Question Banks</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                  </a>
                  <p className="mt-3 text-[11px] font-mono uppercase tracking-widest text-slate-200/90 drop-shadow-sm font-semibold">
                    Instant Access &bull; No Video Waiting Required
                  </p>
                </div>

                {/* Top Video Tag */}
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-white/20 bg-black/60 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-teal-300 font-semibold backdrop-blur-md shadow-xs">
                    <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
                    Board Simulator Preview
                  </span>
                </div>

                {/* Bottom Video Controls Toolbar */}
                <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between text-white/90">
                  {/* Left Playback Speed Control */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="flex items-center gap-1.5 rounded-lg border border-white/20 bg-black/60 px-3 py-1.5 text-xs font-semibold backdrop-blur-md hover:bg-black/80 transition-colors"
                      title={isPlaying ? 'Pause Simulator Video' : 'Play Simulator Video'}
                    >
                      {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                      <span className="font-mono text-[11px]">{isPlaying ? 'Pause' : 'Play'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={cycleSpeed}
                      className="flex items-center gap-1 rounded-lg border border-white/20 bg-black/60 px-3 py-1.5 text-xs font-semibold backdrop-blur-md hover:bg-black/80 transition-colors"
                      title="Adjust Video Playback Speed"
                    >
                      <FastForward className="h-3.5 w-3.5 text-teal-300" />
                      <span className="font-mono text-[11px]">{playbackSpeed}x Fast</span>
                    </button>
                  </div>

                  {/* Right Audio Control */}
                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    className="flex items-center gap-1.5 rounded-lg border border-white/20 bg-black/60 px-3 py-1.5 text-xs font-semibold backdrop-blur-md hover:bg-black/80 transition-colors"
                    title={isMuted ? 'Turn Sound On' : 'Mute Video'}
                  >
                    {isMuted ? <VolumeX className="h-3.5 w-3.5 text-slate-300" /> : <Volume2 className="h-3.5 w-3.5 text-teal-300" />}
                    <span className="font-mono text-[11px]">{isMuted ? 'Muted' : 'Sound On'}</span>
                  </button>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Quick Metrics Bar */}
          <Reveal delay={0.15} className="mt-16">
            <dl className="grid grid-cols-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs md:grid-cols-4 md:divide-x md:divide-slate-200">
              {STATS.map((s) => (
                <div key={s.label} className="px-4 py-3 first:pl-0 md:px-8">
                  <dt className="text-xs uppercase tracking-widest text-slate-500 font-mono">{s.label}</dt>
                  <dd className="mt-1 font-mono text-3xl font-semibold tabular-nums text-slate-900 md:text-4xl">{s.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* Question Banks Showcase */}
      <div className="flex-1">
        <LandingQBanksSection />

        <section className="mx-auto w-full max-w-6xl border-t border-slate-200 px-5 py-24 md:px-10">
          <Reveal>
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-teal-700 font-semibold">Cognitive Framework</p>
            <h2 className="max-w-2xl font-serif text-3xl font-medium tracking-tight text-slate-900 md:text-4xl">
              Engineered for Medical Recall &amp; Board Precision
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
              Every question stem, distractor breakdown, and comparison table is optimized to maximize retention per minute of active recall.
            </p>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {PILLARS.map((p, i) => (
              <Reveal key={p.n} delay={i * 0.05}>
                <div className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs transition-all duration-300 hover:border-slate-300 hover:shadow-md">
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-teal-700 font-semibold">{p.n}</span>
                  <h3 className="mt-4 font-serif text-xl font-medium tracking-tight text-slate-900">{p.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{p.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      </div>

      {/* Minimal Footer */}
      <footer className="border-t border-slate-200 bg-slate-50/50">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 text-xs text-slate-500 md:flex-row md:items-center md:justify-between md:px-10">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">MicroQBank USMLE&reg;</span>
            <span>&copy; {new Date().getFullYear()} Clinical Precision Education. All rights reserved.</span>
          </div>
          <nav aria-label="Footer links" className="flex items-center gap-6">
            <Link href="/privacy" className="transition-colors hover:text-slate-900">Privacy Policy</Link>
            <Link href="/terms" className="transition-colors hover:text-slate-900">Terms of Service</Link>
            <Link href="/simulator" className="transition-colors hover:text-slate-900">FRED Simulator</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
