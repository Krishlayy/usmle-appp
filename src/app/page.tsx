'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { LandingQBanksSection } from '@/components/LandingQBanksSection';
import { Reveal } from '@/components/ui/Reveal';
import { AutoPlayVideo } from '@/components/ui/AutoPlayVideo';
import {
  ArrowRight,
  Volume2,
  VolumeX,
  Sparkles,
  FastForward,
  Play,
  Pause,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Layers,
  GraduationCap,
  Award,
  BookOpen,
} from 'lucide-react';

const STATS = [
  { value: '200', label: 'Curated Questions', sub: 'Peer-reviewed clinical stems' },
  { value: '38', label: 'HD Video Mnemonics', sub: 'Dedicated visual anchors' },
  { value: '4', label: 'Core Curriculum Banks', sub: 'Full USMLE Step 1 coverage' },
  { value: '100%', label: 'FRED v2 Exam Fidelity', sub: 'NBME official testing environment' },
];

const PILLARS = [
  {
    n: '01',
    title: 'Authentic Board Simulation (FRED v2)',
    body: 'Replicates the exact testing interface of official NBME FRED v2 and UWorld examinations: strikethrough, item flagging, lab reference intervals, and reverse-contrast night mode.',
    icon: ShieldCheck,
  },
  {
    n: '02',
    title: 'Selectable Differential Comparison Tables',
    body: 'No flattened low-res images or uncopyable text. High-yield comparative differential tables are rendered in semantic HTML with searchable, copyable diagnostic criteria.',
    icon: Layers,
  },
  {
    n: '03',
    title: 'Cinematic Visual Memory Anchors',
    body: 'Complex multi-step immunological pathways and histopathologic criteria are permanently anchored via high-definition 3D video mnemonics mapped to every item.',
    icon: Sparkles,
  },
  {
    n: '04',
    title: 'Distractor Deconstruction & Diagnostic Traps',
    body: 'Every single incorrect option is systematically explained with the exact clinical reason why a candidate might mistake it, transforming mistakes into high-yield memory retention.',
    icon: BookOpen,
  },
];

const TRUST_TAGS = [
  'USMLE® Step 1 & Step 2 CK Aligned',
  'NBME FRED v2 Exam Software Replicated',
  'Peer-Reviewed by Board Certified MDs',
  'Cloudflare R2 Global Edge CDN',
  'Instant Distractor Rationales',
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
    <div className="relative flex min-h-screen flex-col bg-white text-slate-900 selection:bg-teal-100 selection:text-teal-900">
      {/* Subtle medical ambient glow & micro-grid */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-50/60 via-white to-white" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px] opacity-40" />

      {/* Hero Section */}
      <section className="relative px-5 pt-12 pb-20 md:px-10 md:pt-16">
        <div className="mx-auto w-full max-w-6xl">
          {/* Institutional Top Trust Strip */}
          <Reveal>
            <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200/90 bg-teal-50/90 px-3.5 py-1 font-mono text-[10.5px] uppercase tracking-wider text-teal-800 font-semibold shadow-2xs">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-600 animate-pulse" />
                Institutional Medical Examination Suite
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/90 px-3 py-1 font-mono text-[10.5px] uppercase tracking-wider text-slate-600 shadow-2xs">
                <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
                Verified 2026 Board Specifications
              </span>
            </div>
          </Reveal>

          {/* Hero Titles */}
          <Reveal delay={0.05}>
            <div className="text-center max-w-4xl mx-auto mb-12">
              <h1 className="font-serif text-4xl font-medium leading-[1.08] tracking-tight text-slate-950 md:text-6xl lg:text-7xl">
                Master Medical Concepts with{' '}
                <span className="text-teal-700 underline decoration-teal-300/60 decoration-wavy decoration-1 underline-offset-8">
                  Clinical Authority
                </span>
              </h1>
              <p className="mt-6 text-base leading-relaxed text-slate-600 md:text-xl max-w-2xl mx-auto">
                Practice full-length vignettes in exact board conditions with distractor rationales, selectable comparison tables, and HD video mnemonics.
              </p>
            </div>
          </Reveal>

          {/* Enterprise Framed Hero Simulator Display */}
          <Reveal delay={0.1}>
            <div className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-950 shadow-2xl transition-all duration-300 hover:border-slate-300 hover:shadow-3xl">
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

              {/* The Continuous Boomerang Simulation Video Player */}
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
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/25 to-slate-950/30 pointer-events-none" />

                {/* Centered Enterprise CTA Button */}
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4">
                  <a
                    href="#qbanks"
                    className="group relative inline-flex items-center gap-3 rounded-xl bg-teal-700 px-8 py-4 text-sm md:text-base font-semibold text-white shadow-2xl backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-400"
                  >
                    <span>Explore Question Banks</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                  </a>
                  <p className="mt-3.5 text-[11px] font-mono uppercase tracking-widest text-slate-200/90 drop-shadow-sm font-semibold">
                    Instant Access &bull; Full 50-Question Blocks &bull; No Video Waiting Required
                  </p>
                </div>

                {/* Top Video Preview Badge */}
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-white/20 bg-black/60 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-teal-300 font-semibold backdrop-blur-md shadow-xs">
                    <Sparkles className="h-3 w-3 text-teal-400" />
                    FRED v2 Board Simulator Simulation
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

          {/* Enterprise Metrics Bar */}
          <Reveal delay={0.15} className="mt-14">
            <dl className="grid grid-cols-2 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs md:grid-cols-4 md:divide-x md:divide-slate-200">
              {STATS.map((s) => (
                <div key={s.label} className="px-4 py-3 first:pl-0 md:px-8">
                  <dd className="font-mono text-3xl font-semibold tabular-nums text-slate-900 md:text-4xl">{s.value}</dd>
                  <dt className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-700 font-mono">{s.label}</dt>
                  <p className="mt-0.5 text-[11px] text-slate-400">{s.sub}</p>
                </div>
              ))}
            </dl>
          </Reveal>

          {/* Institutional Trust Highlights Strip */}
          <Reveal delay={0.2} className="mt-8">
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500 border-t border-slate-100 pt-6">
              {TRUST_TAGS.map((tag, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                  <span>{tag}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Question Banks Showcase Section */}
      <div className="flex-1">
        <LandingQBanksSection />

        {/* Enterprise Methodology Section */}
        <section className="mx-auto w-full max-w-6xl border-t border-slate-200/90 px-5 py-24 md:px-10">
          <Reveal>
            <div className="max-w-2xl mb-12">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-teal-700 font-semibold">
                Cognitive Recall Framework
              </span>
              <h2 className="mt-2 font-serif text-3xl font-medium tracking-tight text-slate-900 md:text-4xl">
                Engineered for Medical Recall &amp; Board Precision
              </h2>
              <p className="mt-3 text-base leading-relaxed text-slate-600">
                Every vignette stem, distractor breakdown, and comparison table is optimized to maximize retention per minute of active recall.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map((p, i) => {
              const Icon = p.icon;
              return (
                <Reveal key={p.n} delay={i * 0.05}>
                  <div className="h-full rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs transition-all duration-300 hover:border-slate-300 hover:shadow-md flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-mono text-xs uppercase tracking-wider text-teal-700 font-bold bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-md">
                          {p.n}
                        </span>
                        <Icon className="h-5 w-5 text-teal-600 opacity-80" />
                      </div>
                      <h3 className="font-serif text-lg font-medium tracking-tight text-slate-900 leading-snug">
                        {p.title}
                      </h3>
                      <p className="mt-2.5 text-xs leading-relaxed text-slate-600">
                        {p.body}
                      </p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>
      </div>

      {/* Enterprise Minimal Footer */}
      <footer className="border-t border-slate-200 bg-slate-50/70">
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
