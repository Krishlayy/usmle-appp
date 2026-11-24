'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Volume2, VolumeX, Sparkles, Maximize2 } from 'lucide-react';
import { QuickPracticeModal, QBankData } from './QuickPracticeModal';
import { QBankDetailModal, QBankDetailData } from './QBankDetailModal';
import { SupportModal } from './SupportModal';
import { Reveal } from '@/components/ui/Reveal';
import { AutoPlayVideo } from '@/components/ui/AutoPlayVideo';

const QBANK_PREVIEWS: Record<string, { videoUrl: string; label: string; topics: string[] }> = {
  'autoimmune-diseases': {
    videoUrl: '/videos/mnemonics/autoimmune/bamboo-stairwell.mp4',
    label: 'Autoimmune Diseases Mnemonic Video',
    topics: ['Systemic Lupus (SLE)', 'Rheumatoid Arthritis', 'Sjögren Syndrome', 'Systemic Sclerosis', 'Vasculitides'],
  },
  'biologics-and-their-targets': {
    videoUrl: '/videos/mnemonics/biologics/badge-scanner.mp4',
    label: 'Biologics & Targets Mnemonic Video',
    topics: ['TNF-α Inhibitors', 'CD20 Blockers', 'Immune Checkpoints (PD-1/CTLA-4)', 'IL-6 & IL-17', 'VEGF & EGFR'],
  },
  'immunodeficiency-disorders': {
    videoUrl: '/videos/mnemonics/immunodeficiency/eczema-clinic.mp4',
    label: 'Immunodeficiency Mnemonic Video',
    topics: ['B-Cell Deficiencies', 'T-Cell Disorders (DiGeorge)', 'Phagocytic Defects', 'Complement System', 'SCID & Hyper-IgM'],
  },
  'approach-to-histology': {
    videoUrl: '/videos/mnemonics/histology/colour-room.mp4',
    label: 'Histology Mnemonic Video',
    topics: ['Epithelial & Glandular Tissues', 'Connective & Cartilage', 'Cardiovascular & Lymphoid', 'Renal & Respiratory', 'GI & Hepatic'],
  },
};

interface DashboardQBanksGridProps {
  purchases: Array<{
    qbankId: string;
    qbank: {
      id: string;
      title: string;
      slug: string;
      description?: string | null;
      totalQuestions: number;
      specialtyTag: string;
    };
  }>;
  analyticsMap: Record<string, { attempted: string[]; correct: string[] }>;
}

export function DashboardQBanksGrid({ purchases, analyticsMap }: DashboardQBanksGridProps) {
  const [selectedQBank, setSelectedQBank] = useState<QBankData | null>(null);
  const [selectedDetailQBank, setSelectedDetailQBank] = useState<QBankDetailData | null>(null);
  const [selectedMode, setSelectedMode] = useState<'tutor' | 'timed'>('tutor');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [supportSubject, setSupportSubject] = useState('');
  const [mutedStates, setMutedStates] = useState<Record<string, boolean>>({});
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  const toggleMute = (slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setMutedStates((prev) => ({
      ...prev,
      [slug]: !(prev[slug] ?? true),
    }));
  };

  const handleFullscreen = (slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const video = videoRefs.current[slug];
    if (video) {
      if (document.fullscreenElement) {
        void document.exitFullscreen();
      } else if (video.requestFullscreen) {
        void video.requestFullscreen();
      } else if ((video as any).webkitRequestFullscreen) {
        void (video as any).webkitRequestFullscreen();
      }
    }
  };

  const handleOpenModal = (qbank: DashboardQBanksGridProps['purchases'][0]['qbank'], mode: 'tutor' | 'timed' = 'tutor') => {
    const attempted = analyticsMap[qbank.id]?.attempted?.length || 0;
    const correct = analyticsMap[qbank.id]?.correct?.length || 0;
    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
    const totalCount = qbank.totalQuestions || 50;
    const completionPercentage = Math.min(100, Math.round((attempted / totalCount) * 100));

    setSelectedQBank({
      id: qbank.id,
      title: qbank.title,
      slug: qbank.slug,
      description: qbank.description || undefined,
      totalQuestions: totalCount,
      specialtyTag: qbank.specialtyTag,
      completionPercentage,
      accuracy,
      attemptedCount: attempted,
    });
    setSelectedMode(mode);
    setIsModalOpen(true);
  };

  const handleOpenDetail = (qbank: DashboardQBanksGridProps['purchases'][0]['qbank']) => {
    const preview = QBANK_PREVIEWS[qbank.slug];
    setSelectedDetailQBank({
      id: qbank.id,
      title: qbank.title,
      slug: qbank.slug,
      description: qbank.description || 'Comprehensive board simulation question bank with instant distractor rationales.',
      totalQuestions: qbank.totalQuestions || 50,
      specialtyTag: qbank.specialtyTag,
      previewVideoUrl: preview?.videoUrl,
      topics: preview?.topics || ['Clinical Vignettes', 'Diagnostic Stems', 'High-Yield Board Criteria'],
      mnemonicCount: qbank.totalQuestions || 50,
    });
    setIsDetailModalOpen(true);
  };

  return (
    <div id="qbanks" className="scroll-mt-20 flex flex-col gap-8">
      <Reveal>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-teal-700 font-semibold">
              High-Yield Curriculum
            </p>
            <h2 className="font-serif text-3xl font-medium tracking-tight text-slate-900 md:text-4xl">
              Authentic USMLE&reg; Question Banks
            </h2>
          </div>
          <p className="max-w-md text-sm text-slate-600 leading-relaxed">
            Select a mode to launch instant board practice, preview video mnemonics, or inspect full curriculum topics.
          </p>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {purchases.map(({ qbank }, index) => {
          const attempted = analyticsMap[qbank.id]?.attempted?.length || 0;
          const correct = analyticsMap[qbank.id]?.correct?.length || 0;
          const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
          const totalCount = qbank.totalQuestions || 50;
          const pct = Math.min(100, Math.round((attempted / totalCount) * 100));
          const preview = QBANK_PREVIEWS[qbank.slug];
          const isMuted = mutedStates[qbank.slug] ?? true;

          return (
            <Reveal key={qbank.id} delay={index * 0.05}>
              <div
                onClick={() => handleOpenDetail(qbank)}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all duration-300 hover:border-slate-300 hover:shadow-lg cursor-pointer"
              >
                <div>
                  {preview && (
                    <div className="relative mb-5 aspect-video w-full overflow-hidden rounded-xl bg-slate-900 border border-slate-200 shadow-2xs">
                      <AutoPlayVideo
                        src={preview.videoUrl}
                        label={preview.label}
                        muted={isMuted}
                        maxDuration={3}
                        preload="auto"
                        videoRef={(el) => {
                          videoRefs.current[qbank.slug] = el;
                        }}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      
                      {/* Top Badge */}
                      <span className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-sm border border-slate-200/90 bg-white/95 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-teal-700 font-bold shadow-2xs">
                        <Sparkles className="h-3 w-3 text-teal-600" />
                        3s Mnemonic Preview
                      </span>

                      {/* Video Controls overlay */}
                      <div className="absolute bottom-2.5 right-2.5 z-10 flex items-center gap-1 rounded-md border border-slate-200/90 bg-white/95 p-1 text-slate-700 shadow-xs">
                        <button
                          type="button"
                          onClick={(e) => toggleMute(qbank.slug, e)}
                          className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-semibold hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                          title={isMuted ? 'Unmute preview audio' : 'Mute preview audio'}
                        >
                          {isMuted ? <VolumeX className="h-3.5 w-3.5 text-slate-500" /> : <Volume2 className="h-3.5 w-3.5 text-teal-700" />}
                          <span className="text-[11px] font-mono">{isMuted ? 'Muted' : 'Sound'}</span>
                        </button>
                        
                        <div className="h-3.5 w-px bg-slate-200" />
                        
                        <button
                          type="button"
                          onClick={(e) => handleFullscreen(qbank.slug, e)}
                          className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-semibold hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="View video mnemonic in full screen"
                        >
                          <Maximize2 className="h-3.5 w-3.5 text-slate-600" />
                          <span className="text-[11px] font-mono">Full</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-teal-700 font-semibold">
                      {qbank.specialtyTag}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDetail(qbank);
                      }}
                      className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-teal-700 transition-colors font-medium"
                    >
                      Overview <ArrowUpRight className="h-3 w-3" />
                    </button>
                  </div>
                  <h3 className="mt-2.5 font-serif text-2xl leading-snug text-slate-900 group-hover:text-teal-800 transition-colors">
                    {qbank.title}
                  </h3>
                  {qbank.description && (
                    <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-slate-600">{qbank.description}</p>
                  )}

                  {preview?.topics && preview.topics.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {preview.topics.slice(0, 3).map((topic, tIdx) => (
                        <span
                          key={tIdx}
                          className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[10px] text-slate-600"
                        >
                          {topic}
                        </span>
                      ))}
                      {preview.topics.length > 3 && (
                        <span className="inline-flex items-center rounded-md border border-slate-100 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
                          +{preview.topics.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-6 border-t border-slate-100 pt-5">
                  <div className="mb-3 flex items-baseline justify-between text-xs text-slate-500 font-mono">
                    <span>{attempted} / {totalCount} done</span>
                    <span>Accuracy {accuracy}%</span>
                  </div>
                  
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 mb-5">
                    <div
                      className="h-full bg-teal-700 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => handleOpenModal(qbank, 'tutor')}
                      className="rounded-lg border border-slate-200 bg-white py-2.5 text-center text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
                    >
                      Tutor
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenModal(qbank, 'timed')}
                      className="rounded-lg bg-teal-700 py-2.5 text-center text-xs font-semibold text-white shadow-xs transition-all hover:bg-teal-800 cursor-pointer"
                    >
                      Timed
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>

      {selectedQBank && (
        <QuickPracticeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          qbank={selectedQBank}
          defaultMode={selectedMode}
        />
      )}

      <QBankDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        qbank={selectedDetailQBank}
        onLaunchMode={(mode) => {
          if (selectedDetailQBank) {
            const matched = purchases.find((p) => p.qbank.id === selectedDetailQBank.id)?.qbank;
            if (matched) {
              handleOpenModal(matched, mode);
            }
          }
        }}
        onOpenSupport={(title) => {
          setSupportSubject(title);
          setIsSupportModalOpen(true);
        }}
      />

      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
        qbankTitle={supportSubject}
      />
    </div>
  );
}
