'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { LandingQBanksSection } from '@/components/LandingQBanksSection';
import { 
  ArrowRight, 
  Play, 
  BookOpen, 
  ShieldCheck, 
  GraduationCap, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  FileText 
} from 'lucide-react';

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] text-slate-900 font-sans antialiased overflow-x-hidden">
      
      {/* ======================================================== */}
      {/* 1. CINEMATIC VIDEO HERO SECTION                          */}
      {/* ======================================================== */}
      <section className="relative min-h-[85vh] sm:min-h-[88vh] flex items-center justify-center overflow-hidden bg-slate-950 text-white">
        
        {/* Full-Bleed Video Background */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover opacity-35 filter brightness-90 contrast-105 scale-105 transform-gpu"
            src="/videos/hero-simulator.mp4"
          />
          {/* Clinical Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/85" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,118,110,0.12)_0%,transparent_70%)]" />
        </div>

        {/* Hero Foreground Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex flex-col items-center">
          
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-teal-500/30 bg-teal-950/60 backdrop-blur-md text-teal-300 text-xs font-semibold mb-6 shadow-lg shadow-teal-950/40">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-400" />
            </span>
            <span>Clinical-Grade USMLE® Question Banks</span>
          </div>

          {/* Authority Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight font-serif text-white max-w-4xl leading-[1.1] mb-6">
            Master Medical Concepts with{' '}
            <span className="bg-gradient-to-r from-teal-300 via-cyan-200 to-white bg-clip-text text-transparent">
              Clinical Authority
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl leading-relaxed font-sans mb-10 font-normal">
            Eliminate exam surprise. Practice full 50-question blocks in authentic board conditions with instant distractor rationales, selectable comparison tables, and cinematic video mnemonics.
          </p>

          {/* Action CTA: Single Focused Path */}
          <div className="flex items-center justify-center w-full sm:w-auto mb-14">
            <a
              href="#qbanks"
              className="inline-flex items-center justify-center gap-2.5 px-10 py-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-base shadow-xl shadow-teal-500/30 transition-all hover:scale-105 cursor-pointer"
            >
              <BookOpen className="w-5 h-5" />
              <span>Explore Question Banks</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* High-Impact Stat Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 w-full max-w-4xl pt-8 border-t border-white/10">
            <div className="flex flex-col items-center p-3 rounded-xl bg-white/5 backdrop-blur-xs border border-white/10">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-teal-300">200</span>
              <span className="text-xs text-slate-300 font-medium mt-1">Curated Questions</span>
            </div>

            <div className="flex flex-col items-center p-3 rounded-xl bg-white/5 backdrop-blur-xs border border-white/10">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-cyan-300">165</span>
              <span className="text-xs text-slate-300 font-medium mt-1">Video Mnemonics</span>
            </div>

            <div className="flex flex-col items-center p-3 rounded-xl bg-white/5 backdrop-blur-xs border border-white/10">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-teal-300">94</span>
              <span className="text-xs text-slate-300 font-medium mt-1">Medical Exhibits</span>
            </div>

            <div className="flex flex-col items-center p-3 rounded-xl bg-white/5 backdrop-blur-xs border border-white/10">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-cyan-300">2</span>
              <span className="text-xs text-slate-300 font-medium mt-1">Tutor &amp; Timed Modes</span>
            </div>
          </div>

        </div>

      </section>

      {/* ======================================================== */}
      {/* 2. THE 4 QUESTION BANKS (ALL IN ONE PLACE)               */}
      {/* ======================================================== */}
      <main className="flex-1 bg-[#F8FAF9]">
        <LandingQBanksSection />

        {/* ======================================================== */}
        {/* 3. CLINICAL RIGOR & METHODOLOGY                          */}
        {/* ======================================================== */}
        <section className="w-full max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-200">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-extrabold font-serif text-slate-900 tracking-tight mb-3">
              Designed for Medical Student Cognition
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-sans">
              Every question stem, distractor breakdown, and comparison table is optimized to maximize retention per minute of active recall.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold text-sm border border-teal-200">
                01
              </div>
              <h3 className="text-lg font-bold text-slate-900">Authentic Board Simulation</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Matches the exact visual layout, strikethrough, lab value lookups, and reverse-color contrast of official NBME FRED v2 and UWorld exam software.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-800 flex items-center justify-center font-bold text-sm border border-cyan-200">
                02
              </div>
              <h3 className="text-lg font-bold text-slate-900">Selectable Comparison Tables</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                No flattened images or uncopyable text. High-yield differential diagnosis tables are rendered in clean, highlightable HTML with clear column borders.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold text-sm border border-teal-200">
                03
              </div>
              <h3 className="text-lg font-bold text-slate-900">HD Visual Memory Anchors</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Complex molecular mechanisms and histopathology slides are reinforced by dedicated video mnemonics mapped directly to every question item.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* ======================================================== */}
      {/* 4. FOOTER                                                */}
      {/* ======================================================== */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">MicroQBank USMLE®</span>
            <span>• © {new Date().getFullYear()} All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-slate-800 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-800 transition-colors">Terms of Service</Link>
            <Link href="/simulator" className="hover:text-slate-800 transition-colors">Board Simulator</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
