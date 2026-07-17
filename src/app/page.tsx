'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ArrowRight, BookOpen, BarChart2, ShieldCheck } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-[#F8FAFC] text-primary font-sans animate-page-enter">
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        
        {/* HERO SECTION */}
        <div className="max-w-[1280px] w-full mx-auto text-center space-y-8 py-32 flex flex-col items-center">
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-semibold mb-4 animate-fade-slide-up" style={{ animationDelay: '100ms' }}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Now Available: System-Based Micro QBanks
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] animate-fade-slide-up text-slate-900" style={{ animationDelay: '200ms' }}>
            Master Medical Concepts,<br/>
            <span className="text-[#2563EB]">One Topic at a Time.</span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-lg md:text-xl text-secondary font-medium leading-relaxed animate-fade-slide-up" style={{ animationDelay: '300ms' }}>
            Stop paying for bloated subscriptions. Build your own curriculum with premium, high-yield question banks tailored precisely for your weak spots.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 animate-fade-slide-up w-full sm:w-auto" style={{ animationDelay: '400ms' }}>
            <Link href="/store" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto h-14 px-8 text-[16px] shadow-lg shadow-blue-500/20 gap-2">
                Explore Question Banks <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            
            <Link href="/signup" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto h-14 px-8 text-[16px] bg-white border-2">
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>

        {/* FEATURES GRID */}
        <div className="max-w-[1280px] w-full mx-auto py-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <Card elevation="elevated" className="p-8 hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-scale-lg text-primary mb-3">High-Yield Content</h3>
              <p className="text-secondary leading-relaxed font-medium">Questions crafted by top scorers, focusing on the concepts most frequently tested on the boards. No low-yield fluff.</p>
            </Card>

            <Card elevation="elevated" className="p-8 hover:-translate-y-1 transition-transform duration-300" style={{ animationDelay: '100ms' }}>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
                <BarChart2 className="w-6 h-6" />
              </div>
              <h3 className="text-scale-lg text-primary mb-3">Advanced Analytics</h3>
              <p className="text-secondary leading-relaxed font-medium">Track your performance across micro-topics to identify weaknesses and optimize your study time efficiently.</p>
            </Card>

            <Card elevation="elevated" className="p-8 hover:-translate-y-1 transition-transform duration-300" style={{ animationDelay: '200ms' }}>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-scale-lg text-primary mb-3">Pay Per Module</h3>
              <p className="text-secondary leading-relaxed font-medium">Zero subscriptions. Lifetime access to the modules you buy. A fair marketplace built for medical students.</p>
            </Card>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-[#E5E7EB] py-12 text-center text-secondary">
        <p className="mb-2 font-medium">© 2026 Micro Q Bank.</p>
        <p className="text-[13px] text-muted">Micro Q Bank is an independent educational platform.</p>
      </footer>
    </div>
  );
}
