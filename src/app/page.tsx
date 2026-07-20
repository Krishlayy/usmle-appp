'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ArrowRight, BookOpen, BarChart2, ShieldCheck } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-[var(--background)] text-primary font-sans animate-page-enter">
      <main className="flex-1 flex flex-col items-center justify-center px-6">
        
        {/* HERO SECTION */}
        <div className="max-w-5xl w-full mx-auto text-center space-y-8 py-32 flex flex-col items-center">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] text-sm font-medium mb-6 animate-fade-slide-up" style={{ animationDelay: '100ms' }}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-accent)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-accent)]"></span>
            </span>
            The New Standard in Clinical Education
          </div>

          <h1 className="text-scale-3xl md:text-[72px] leading-[1.05] animate-fade-slide-up text-primary" style={{ animationDelay: '200ms' }}>
            Master Medical Concepts,<br/>
            <span className="text-accent italic">One Topic at a Time.</span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-scale-lg text-secondary leading-relaxed animate-fade-slide-up mt-8" style={{ animationDelay: '300ms' }}>
            Stop paying for bloated subscriptions. Build your own curriculum with premium, high-yield question banks tailored precisely for your clinical weak spots.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-10 animate-fade-slide-up w-full sm:w-auto" style={{ animationDelay: '400ms' }}>
            <Link href="/store" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-md gap-2">
                Explore Question Banks <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            
            <Link href="/signup" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>

        {/* FEATURES GRID */}
        <div className="max-w-6xl w-full mx-auto py-24 border-t border-[var(--color-border-subtle)]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
            <div className="flex flex-col hover:-translate-y-1 transition-transform duration-300">
              <div className="text-[var(--color-primary)] mb-6 border-b border-[var(--color-border-subtle)] pb-4 inline-flex items-center gap-3">
                <BookOpen className="w-5 h-5 stroke-[1.5px]" />
                <h3 className="text-scale-lg text-primary m-0 p-0">High-Yield Content</h3>
              </div>
              <p className="text-secondary leading-relaxed text-scale-base">Questions crafted by top scorers, focusing on the concepts most frequently tested on the boards. No low-yield fluff.</p>
            </div>

            <div className="flex flex-col hover:-translate-y-1 transition-transform duration-300" style={{ animationDelay: '100ms' }}>
              <div className="text-[var(--color-primary)] mb-6 border-b border-[var(--color-border-subtle)] pb-4 inline-flex items-center gap-3">
                <BarChart2 className="w-5 h-5 stroke-[1.5px]" />
                <h3 className="text-scale-lg text-primary m-0 p-0">Advanced Analytics</h3>
              </div>
              <p className="text-secondary leading-relaxed text-scale-base">Track your performance across micro-topics to identify weaknesses and optimize your study time efficiently.</p>
            </div>

            <div className="flex flex-col hover:-translate-y-1 transition-transform duration-300" style={{ animationDelay: '200ms' }}>
              <div className="text-[var(--color-primary)] mb-6 border-b border-[var(--color-border-subtle)] pb-4 inline-flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 stroke-[1.5px]" />
                <h3 className="text-scale-lg text-primary m-0 p-0">Pay Per Module</h3>
              </div>
              <p className="text-secondary leading-relaxed text-scale-base">Zero subscriptions. Lifetime access to the modules you buy. A fair marketplace built for medical students.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-[var(--color-border-subtle)] py-12 text-center text-secondary">
        <p className="mb-2 font-medium">© {new Date().getFullYear()} Micro Q-Bank.</p>
        <p className="text-scale-xs text-muted">Micro Q-Bank is an independent clinical educational platform.</p>
      </footer>
    </div>
  );
}
