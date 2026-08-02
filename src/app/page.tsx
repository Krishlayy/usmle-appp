'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ArrowRight, BookOpen, BarChart2, ShieldCheck, Play, Layers, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-[#0a0d14] text-white font-sans overflow-hidden relative">
      {/* Background Gradients */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[10%] w-[500px] h-[500px] rounded-full bg-purple-900/10 blur-[120px] animate-pulse duration-[8000ms]"></div>
        <div className="absolute bottom-[-10%] left-[10%] w-[450px] h-[450px] rounded-full bg-cyan-950/15 blur-[120px] animate-pulse duration-[6000ms]"></div>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-6 z-10">
        
        {/* HERO SECTION */}
        <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 py-24 md:py-32 items-center">
          
          <div className="lg:col-span-6 space-y-6 text-left flex flex-col items-start">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-gray-300 text-sm font-medium animate-fade-slide-up">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
              </span>
              The New Standard in USMLE Prep
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.1] font-serif tracking-tight">
              Master USMLE Concepts <br />
              <span className="bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] bg-clip-text text-transparent italic">
                One Topic at a Time
              </span>
            </h1>
            
            <p className="max-w-xl text-lg text-gray-400 leading-relaxed mt-4">
              Experience the exact cognitive environment of the board exams. Build custom sessions from high-yield, peer-reviewed question banks tailored to your targets.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-6 w-full sm:w-auto">
              <Link href="/store" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-lg shadow-purple-500/20 gap-2 bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] border-none text-white hover:scale-[1.02] transition-transform">
                  Explore Q-Banks <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              
              <Link href="/signup" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto bg-white/5 border-white/10 hover:bg-white/10 text-white">
                  Create Free Account
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-10 border-t border-white/5 w-full mt-8">
              <div>
                <div className="text-2xl font-bold text-white">99.4%</div>
                <div className="text-xs text-gray-500 mt-1">Interface Match</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">4,200+</div>
                <div className="text-xs text-gray-500 mt-1">High-Yield Qs</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">+24</div>
                <div className="text-xs text-gray-500 mt-1">Avg Score Boost</div>
              </div>
            </div>
          </div>

          {/* SIMULATOR PREVIEW HERO IMAGE */}
          <div className="lg:col-span-6 flex justify-center w-full">
            <div className="relative group w-full max-w-lg">
              {/* Outer Glow */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] rounded-2xl blur-lg opacity-30 group-hover:opacity-40 transition-opacity"></div>
              
              {/* Card Container */}
              <div className="relative bg-[#111524]/90 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                {/* Header Window Buttons */}
                <div className="flex items-center justify-between px-4 py-3 bg-[#0a0d14]/80 border-b border-white/5">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
                    <span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
                    <span className="w-3 h-3 rounded-full bg-green-500/80"></span>
                  </div>
                  <span className="text-xs text-gray-500 font-mono">block_1_cardiology.exe</span>
                  <div className="w-12"></div>
                </div>

                {/* Simulator Content Preview */}
                <div className="flex min-h-[220px]">
                  {/* Miniature Sidebar */}
                  <div className="w-20 border-r border-white/5 bg-[#0e111d] p-2 flex flex-col gap-1.5">
                    <div className="text-[10px] text-gray-600 font-bold tracking-wider mb-1">NAVIGATOR</div>
                    <div className="flex items-center gap-1 bg-[#1c223a] text-xs text-cyan-400 p-1.5 rounded border border-cyan-400/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                      <span>1</span>
                      <span className="text-red-500 ml-auto">🚩</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 p-1.5 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
                      <span>2</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 p-1.5 rounded">
                      <span>3</span>
                      <span className="text-red-500 ml-auto">🚩</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 p-1.5 rounded">
                      <span>4</span>
                    </div>
                  </div>

                  {/* Miniature Main Area */}
                  <div className="flex-1 p-4 space-y-3.5 text-left">
                    <span className="inline-block text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      CARDIOLOGY
                    </span>
                    <p className="text-xs text-gray-300 leading-relaxed font-sans">
                      A 62-year-old man presents to the emergency department with severe, crushing substernal chest pain radiating to his left arm for the past 45 minutes...
                    </p>
                    
                    <div className="space-y-1.5 pt-2">
                      <div className="text-xs p-2 rounded bg-cyan-500/10 border border-cyan-500/30 text-white font-medium flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-cyan-500 text-black text-[10px] font-bold flex items-center justify-center">A</span>
                        <span>Acute myocardial infarction</span>
                      </div>
                      <div className="text-xs p-2 rounded bg-white/5 border border-white/5 text-gray-500 line-through flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-white/5 text-gray-500 text-[10px] font-bold flex items-center justify-center">B</span>
                        <span>Acute pulmonary embolism</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FEATURES GRID */}
        <div className="max-w-6xl w-full mx-auto py-24 border-t border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
            <div className="flex flex-col hover:-translate-y-1 transition-transform duration-300 group">
              <div className="text-purple-400 mb-6 border-b border-white/5 pb-4 inline-flex items-center gap-3">
                <BookOpen className="w-5 h-5 stroke-[1.5px] group-hover:text-purple-300 transition-colors" />
                <h3 className="text-lg text-white font-serif m-0 p-0 font-bold">Realistic Simulator</h3>
              </div>
              <p className="text-gray-400 leading-relaxed text-sm">
                Strike through incorrect options, flag items to review, and manage time using exact replicates of the official board examination interface.
              </p>
            </div>

            <div className="flex flex-col hover:-translate-y-1 transition-transform duration-300 group" style={{ animationDelay: '100ms' }}>
              <div className="text-cyan-400 mb-6 border-b border-white/5 pb-4 inline-flex items-center gap-3">
                <BarChart2 className="w-5 h-5 stroke-[1.5px] group-hover:text-cyan-300 transition-colors" />
                <h3 className="text-lg text-white font-serif m-0 p-0 font-bold">Smart Analytics</h3>
              </div>
              <p className="text-gray-400 leading-relaxed text-sm">
                Trace accuracy details by organ system, track average answer speed, and identify precise topics needing review before test day.
              </p>
            </div>

            <div className="flex flex-col hover:-translate-y-1 transition-transform duration-300 group" style={{ animationDelay: '200ms' }}>
              <div className="text-purple-400 mb-6 border-b border-white/5 pb-4 inline-flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 stroke-[1.5px] group-hover:text-purple-300 transition-colors" />
                <h3 className="text-lg text-white font-serif m-0 p-0 font-bold">Pay Per Module</h3>
              </div>
              <p className="text-gray-400 leading-relaxed text-sm">
                Eliminate bloated subscriptions. Purchase only the specific systems or modules you need and retain lifetime access for your prep.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/5 py-12 text-center text-gray-500 z-10 bg-[#0a0d14]">
        <p className="mb-2 font-medium">© {new Date().getFullYear()} Micro Q-Bank.</p>
        <p className="text-xs text-gray-600">Micro Q-Bank is an independent clinical educational platform. USMLE® is a registered trademark of the NBME.</p>
      </footer>
    </div>
  );
}
