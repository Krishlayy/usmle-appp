'use client';

import React from 'react';
import { X, Award, CheckCircle2, Clock, BarChart3, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface ResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAnswered?: number;
  accuracy?: number;
}

export function ResultsModal({ isOpen, onClose, totalAnswered = 0, accuracy = 0 }: ResultsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl md:p-8">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          aria-label="Close results modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-teal-50 border border-teal-200 text-teal-700">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-medium text-slate-900">Your Exam Analytics & Time</h2>
            <p className="text-xs text-slate-500">Cumulative performance across active question banks</p>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="my-6 space-y-4">
          <div className="grid grid-cols-3 gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4 text-center">
            <div>
              <span className="text-[11px] font-medium text-slate-500 font-mono">ACCURACY</span>
              <p className="mt-1 font-mono text-2xl font-bold text-teal-700">{accuracy}%</p>
            </div>
            <div className="border-x border-slate-200">
              <span className="text-[11px] font-medium text-slate-500 font-mono">ANSWERED</span>
              <p className="mt-1 font-mono text-2xl font-bold text-slate-900">{totalAnswered}</p>
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-500 font-mono">TIME SPENT</span>
              <p className="mt-1 font-mono text-2xl font-bold text-slate-900">14.2h</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4 space-y-3">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider font-mono">
              Curriculum Mastery
            </h4>
            
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Autoimmune Diseases</span>
                  <span className="font-mono font-semibold">40% Accuracy</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-teal-600 rounded-full" style={{ width: '40%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Biologics & Targeted Therapeutics</span>
                  <span className="font-mono font-semibold">33% Accuracy</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-teal-600 rounded-full" style={{ width: '33%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Approach to Histology</span>
                  <span className="font-mono font-semibold">Ready to start</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-teal-600 rounded-full" style={{ width: '0%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
          <Link
            href="/dashboard"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-5 py-2 text-xs font-semibold text-white hover:bg-teal-800 transition-colors shadow-xs"
          >
            Resume Practice <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
