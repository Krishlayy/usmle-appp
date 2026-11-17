'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { HeroSimulatorMotion } from '@/components/HeroSimulatorMotion';
import { 
  ArrowRight, 
  Video, 
  Layers, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  Laptop,
  CheckCircle2,
  Stethoscope
} from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-[#f8fafc] text-[#0f172a] font-sans overflow-hidden relative">
      {/* Background Gradients */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[10%] w-[500px] h-[500px] rounded-full bg-cyan-500/5 blur-[120px] animate-pulse duration-[8000ms]" />
        <div className="absolute bottom-[-10%] left-[10%] w-[450px] h-[450px] rounded-full bg-blue-500/5 blur-[120px] animate-pulse duration-[6000ms]" />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-6 z-10">
        
        {/* HERO SECTION */}
        <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 py-16 md:py-24 items-center">
          
          {/* Left Column: Value Proposition & Copy */}
          <div className="lg:col-span-6 space-y-6 text-left flex flex-col items-start">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-200 bg-white text-slate-700 text-xs font-semibold shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-600" />
              </span>
              Clinical-Grade USMLE Preparation
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.12] font-serif tracking-tight text-slate-900">
              Master USMLE Concepts <br />
              <span className="bg-gradient-to-r from-slate-950 via-teal-800 to-cyan-700 bg-clip-text text-transparent italic">
                One Topic at a Time
              </span>
            </h1>
            
            <p className="max-w-xl text-base md:text-lg text-slate-600 leading-relaxed font-sans">
              Train in the exact cognitive conditions of board exams with real-time distractor rationales, authentic examination modes, and high-yield video mnemonics built for long-term clinical recall.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 w-full sm:w-auto">
              <Link href="/store" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-lg shadow-teal-700/10 gap-2 bg-slate-900 hover:bg-slate-800 border-none text-white transition-all text-sm font-semibold">
                  Explore Q-Banks <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              
              <Link href="/signup" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto bg-white border-slate-200 hover:bg-slate-50 text-slate-800 shadow-2xs text-sm font-semibold">
                  Create Free Account
                </Button>
              </Link>
            </div>

            {/* Qualitative Value Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-slate-200/80 w-full mt-4">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 mt-0.5 border border-teal-200/60">
                  <Laptop className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Dual Themes</div>
                  <div className="text-[11px] text-slate-500 leading-tight">UWorld Simulator & Modern Minimalist</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-cyan-50 text-cyan-700 flex items-center justify-center shrink-0 mt-0.5 border border-cyan-200/60">
                  <Video className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Video Mnemonics</div>
                  <div className="text-[11px] text-slate-500 leading-tight">Visual memory aids for complex mechanisms</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 border border-blue-200/60">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Modular Access</div>
                  <div className="text-[11px] text-slate-500 leading-tight">System-by-system Q-Banks on demand</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Motion Graphic Simulator */}
          <div className="lg:col-span-6 flex justify-center w-full">
            <HeroSimulatorMotion />
          </div>

        </div>

        {/* CORE PLATFORM CAPABILITIES */}
        <div className="max-w-6xl w-full mx-auto py-20 border-t border-slate-200/80">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold tracking-widest text-teal-700 uppercase mb-2">Designed for Board Mastery</h2>
            <p className="text-2xl md:text-3xl font-bold font-serif text-slate-900">A Focused Clinical Testing Environment</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {/* Capability 1: Timed & Active Tutor Mode */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-5 border border-teal-100">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Timed & Active Tutor Modes</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Train under authentic exam time constraints to sharpen your pacing, or switch to Tutor mode for immediate distractor breakdowns and clinical insights after every answer.
              </p>
            </div>

            {/* Capability 2: Embedded Video Mnemonics */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center mb-5 border border-cyan-100">
                <Video className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Clinical Video Mnemonics</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Every high-yield concept is paired with a visual mnemonic video to anchor pharmacology, microbiology pathways, and disease differentials in your long-term memory.
              </p>
            </div>

            {/* Capability 3: Modular Organ-System Banks */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center mb-5 border border-slate-200">
                <Stethoscope className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Modular System Modules</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Target exactly the clinical disciplines you need for your current rotation or clerkship — cardiology, neurology, renal, and more — without paying for bloated bundles.
              </p>
            </div>
          </div>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 py-10 text-center text-slate-500 z-10 bg-white">
        <p className="mb-2 text-xs font-semibold text-slate-700">© {new Date().getFullYear()} Micro Q-Bank. All rights reserved.</p>
        <p className="text-[11px] text-slate-400 max-w-xl mx-auto px-4">
          Micro Q-Bank is an independent educational platform. USMLE® is a joint program of the Federation of State Medical Boards (FSMB) and National Board of Medical Examiners (NBME).
        </p>
      </footer>
    </div>
  );
}
