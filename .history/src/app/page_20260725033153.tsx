'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ArrowRight, BookOpen, BarChart2, ShieldCheck, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-white text-primary font-sans animate-page-enter">
      <main className="flex-1 flex flex-col items-center justify-center">
        
        {/* HERO SECTION */}
        <div className="relative w-full overflow-hidden bg-gradient-to-b from-slate-50 to-white px-6">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-50"></div>
          <div className="max-w-5xl w-full mx-auto text-center space-y-10 py-32 flex flex-col items-center relative z-10">
            
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-sm font-semibold mb-6 animate-fade-slide-up shadow-sm" style={{ animationDelay: '100ms' }}>
              <Sparkles className="w-4 h-4 text-blue-500" />
              The New Standard in Clinical Education
            </div>

            <h1 className="text-scale-3xl md:text-[80px] leading-[1.1] animate-fade-slide-up text-primary tracking-tight font-extrabold" style={{ animationDelay: '200ms' }}>
              Master Medical Concepts,<br/>
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">One Topic at a Time.</span>
            </h1>
            
            <p className="mx-auto max-w-2xl text-scale-lg text-secondary leading-relaxed animate-fade-slide-up mt-8 font-medium" style={{ animationDelay: '300ms' }}>
              Stop paying for bloated subscriptions. Build your own curriculum with premium, high-yield question banks tailored precisely for your clinical weak spots.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-12 animate-fade-slide-up w-full sm:w-auto" style={{ animationDelay: '400ms' }}>
              <Link href="/store" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-[0_4px_14px_0_rgb(59,130,246,0.39)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.23)] hover:bg-blue-600 gap-2 px-10 h-14 text-base">
                  Explore Question Banks <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              
              <Link href="/signup" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto h-14 px-10 text-base shadow-sm hover:shadow">
                  Create Free Account
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* FEATURES GRID */}
        <div className="max-w-7xl w-full mx-auto py-32 px-6 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
            <Card elevation="subtle" className="p-10 flex flex-col hover:-translate-y-2 transition-transform duration-300 border-none bg-slate-50">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 mb-8 flex items-center justify-center">
                <BookOpen className="w-7 h-7 stroke-[2px]" />
              </div>
              <h3 className="text-[22px] font-bold text-primary mb-4">High-Yield Content</h3>
              <p className="text-secondary leading-relaxed text-scale-base font-medium">Questions crafted by top scorers, focusing on the concepts most frequently tested on the boards. No low-yield fluff.</p>
            </Card>

            <Card elevation="subtle" className="p-10 flex flex-col hover:-translate-y-2 transition-transform duration-300 border-none bg-slate-50" style={{ animationDelay: '100ms' }}>
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 mb-8 flex items-center justify-center">
                <BarChart2 className="w-7 h-7 stroke-[2px]" />
              </div>
              <h3 className="text-[22px] font-bold text-primary mb-4">Advanced Analytics</h3>
              <p className="text-secondary leading-relaxed text-scale-base font-medium">Track your performance across micro-topics to identify weaknesses and optimize your study time efficiently.</p>
            </Card>

            <Card elevation="subtle" className="p-10 flex flex-col hover:-translate-y-2 transition-transform duration-300 border-none bg-slate-50" style={{ animationDelay: '200ms' }}>
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 mb-8 flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 stroke-[2px]" />
              </div>
              <h3 className="text-[22px] font-bold text-primary mb-4">Pay Per Module</h3>
              <p className="text-secondary leading-relaxed text-scale-base font-medium">Zero subscriptions. Lifetime access to the modules you buy. A fair marketplace built for medical students.</p>
            </Card>
          </div>
        </div>
      </main>

      <footer className="bg-slate-50 border-t border-[var(--color-border-subtle)] py-16 text-center text-secondary">
        <div className="max-w-7xl mx-auto px-6">
          <p className="mb-3 font-semibold text-primary">© {new Date().getFullYear()} Micro - Q bank.</p>
          <p className="text-sm text-muted font-medium">An independent clinical educational platform built for excellence.</p>
        </div>
      </footer>
    </div>
  );
}
