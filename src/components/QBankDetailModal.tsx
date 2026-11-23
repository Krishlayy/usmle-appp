'use client';

import React, { useState } from 'react';
import { X, Play, Clock, Sparkles, BookOpen, Layers, CheckCircle2, MessageSquare, ArrowRight } from 'lucide-react';
import { AutoPlayVideo } from './ui/AutoPlayVideo';

export interface QBankDetailData {
  id: string;
  title: string;
  slug: string;
  description: string;
  totalQuestions: number;
  specialtyTag: string;
  previewVideoUrl?: string;
  topics?: string[];
  exhibitCount?: number;
  mnemonicCount?: number;
}

interface QBankDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  qbank: QBankDetailData | null;
  onLaunchMode?: (mode: 'tutor' | 'timed') => void;
  onOpenSupport?: (qbankTitle: string) => void;
}

export function QBankDetailModal({
  isOpen,
  onClose,
  qbank,
  onLaunchMode,
  onOpenSupport,
}: QBankDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'video' | 'syllabus'>('video');

  if (!isOpen || !qbank) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 p-5 md:p-6 bg-slate-50/50">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-wider text-teal-700 font-semibold">
              {qbank.specialtyTag}
            </span>
            <h2 className="mt-1 font-serif text-2xl font-medium text-slate-900 leading-snug">
              {qbank.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6">
          {/* Video Preview Container */}
          {qbank.previewVideoUrl && (
            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-900 shadow-md border border-slate-200">
              <AutoPlayVideo
                src={qbank.previewVideoUrl}
                muted={false}
                controls={true}
                preload="auto"
                className="h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-sm border border-slate-200/90 bg-white/95 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-teal-700 font-bold shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-teal-600" />
                Featured Video Mnemonic
              </div>
            </div>
          )}

          {/* Core Curriculum Highlights */}
          <div className="grid grid-cols-3 gap-3 border-y border-slate-100 py-3 text-center">
            <div className="p-2">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-mono">Questions</span>
              <p className="mt-1 font-mono text-lg font-semibold text-slate-900">{qbank.totalQuestions || 50} Vignettes</p>
            </div>
            <div className="p-2 border-x border-slate-100">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-mono">Mnemonics</span>
              <p className="mt-1 font-mono text-lg font-semibold text-teal-700">{qbank.mnemonicCount || 'Full'} Videos</p>
            </div>
            <div className="p-2">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-mono">Simulation</span>
              <p className="mt-1 font-mono text-lg font-semibold text-slate-900">NBME / UWorld</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 font-mono">
              What This Question Bank Teaches
            </h3>
            <p className="text-sm leading-relaxed text-slate-700">
              {qbank.description}
            </p>
          </div>

          {/* High-Yield Topics Covered */}
          {qbank.topics && qbank.topics.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2.5 font-mono">
                Key Exam Diseases & Mechanisms
              </h3>
              <div className="flex flex-wrap gap-2">
                {qbank.topics.map((t, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 rounded-md bg-teal-50 border border-teal-100 px-2.5 py-1 text-xs text-teal-800 font-medium"
                  >
                    <CheckCircle2 className="h-3 w-3 text-teal-600" />
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Need help inquiry strip */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-white border border-slate-200 text-teal-700">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800">Questions about this curriculum?</p>
                <p className="text-[11px] text-slate-500">Contact our faculty regarding rationales or study plans.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSupport?.(qbank.title);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer"
            >
              Contact Team
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-100 p-4 md:px-6 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
          
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                onClose();
                onLaunchMode?.('tutor');
              }}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              Start Tutor Mode
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onLaunchMode?.('timed');
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-5 py-2 text-xs font-semibold text-white hover:bg-teal-800 transition-colors shadow-xs cursor-pointer"
            >
              Start Timed Exam <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
