'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Volume2, VolumeX, Sparkles, Maximize2 } from 'lucide-react';
import { QuickPracticeModal, QBankData } from './QuickPracticeModal';
import { Reveal } from '@/components/ui/Reveal';
import { AutoPlayVideo } from '@/components/ui/AutoPlayVideo';

const QBANK_PREVIEWS: Record<string, { videoUrl: string; label: string }> = {
  'autoimmune-diseases': {
    videoUrl: '/videos/mnemonics/autoimmune/bamboo-stairwell.mp4',
    label: 'Autoimmune Diseases Mnemonic Video',
  },
  'biologics-and-their-targets': {
    videoUrl: '/videos/mnemonics/biologics/badge-scanner.mp4',
    label: 'Biologics & Targets Mnemonic Video',
  },
  'immunodeficiency-disorders': {
    videoUrl: '/videos/mnemonics/immunodeficiency/eczema-clinic.mp4',
    label: 'Immunodeficiency Mnemonic Video',
  },
  'approach-to-histology': {
    videoUrl: '/videos/mnemonics/histology/colour-room.mp4',
    label: 'Histology Mnemonic Video',
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
  const [selectedMode, setSelectedMode] = useState<'tutor' | 'timed'>('tutor');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mutedStates, setMutedStates] = useState<Record<string, boolean>>({});
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  const toggleMute = (slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setMutedStates((prev) => {
      const current = prev[slug] ?? true;
      return {
        ...prev,
        [slug]: !current,
      };
    });
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

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        {purchases.map(({ qbank }, i) => {
          const attemptedCount = analyticsMap[qbank.id]?.attempted?.length || 0;
          const correctCount = analyticsMap[qbank.id]?.correct?.length || 0;
          const totalCount = qbank.totalQuestions || 50;
          const displayPercentage = Math.min(Math.round((attemptedCount / totalCount) * 100), 100);
          const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;
          const preview = QBANK_PREVIEWS[qbank.slug];
          const isMuted = mutedStates[qbank.slug] ?? true;

          return (
            <Reveal key={qbank.id} delay={Math.min(i, 5) * 0.05}>
              <article className="group flex h-full flex-col justify-between gap-6 rounded-lg border border-slate-200 bg-white shadow-sm p-6 transition-colors hover:border-slate-300">
                <div>
                  {/* Video Mnemonic Card Thumbnail: Clean 3-second preview */}
                  {preview && (
                    <div className="relative mb-5 h-44 w-full overflow-hidden rounded-md border border-slate-200 bg-slate-100 sm:h-48 group/video">
                      <AutoPlayVideo
                        src={preview.videoUrl}
                        muted={isMuted}
                        label={preview.label}
                        maxDuration={3}
                        controls={false}
                        videoRef={(el) => {
                          videoRefs.current[qbank.slug] = el;
                        }}
                        className="h-full w-full object-cover"
                      />
                      
                      {/* Top Badge */}
                      <span className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-sm border border-slate-200/90 bg-white/95 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-teal-700 font-semibold shadow-2xs backdrop-blur-xs">
                        <Sparkles className="h-3 w-3 text-teal-600" />
                        3s Mnemonic Preview
                      </span>

                      {/* Video Options: Mute and Fullscreen Controls */}
                      <div className="absolute bottom-2.5 right-2.5 z-10 flex items-center gap-1 rounded-md border border-slate-200/90 bg-white/95 p-1 text-slate-700 shadow-xs backdrop-blur-xs">
                        <button
                          type="button"
                          onClick={(e) => toggleMute(qbank.slug, e)}
                          className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-semibold hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                          title={isMuted ? "Unmute preview audio" : "Mute preview audio"}
                          aria-label={isMuted ? "Unmute preview audio" : "Mute preview audio"}
                        >
                          {isMuted ? (
                            <VolumeX className="h-3.5 w-3.5 text-slate-500" />
                          ) : (
                            <Volume2 className="h-3.5 w-3.5 text-teal-700" />
                          )}
                          <span className="text-[11px] font-mono">{isMuted ? "Muted" : "Sound"}</span>
                        </button>
                        
                        <div className="h-3.5 w-px bg-slate-200" />
                        
                        <button
                          type="button"
                          onClick={(e) => handleFullscreen(qbank.slug, e)}
                          className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-semibold hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="View video mnemonic in full screen"
                          aria-label="View video mnemonic in full screen"
                        >
                          <Maximize2 className="h-3.5 w-3.5 text-slate-600" />
                          <span className="text-[11px] font-mono">Full</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-teal-700">
                      {qbank.specialtyTag}
                    </span>
                    <Link
                      href={`/dashboard/${qbank.slug}`}
                      className="inline-flex items-center gap-1 text-xs text-slate-500 transition-colors hover:text-slate-900"
                    >
                      Overview <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </div>
                  <h3 className="mt-3 font-serif text-xl leading-snug text-slate-900">{qbank.title}</h3>
                  {qbank.description && (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">{qbank.description}</p>
                  )}
                </div>

                <div className="flex flex-col gap-5">
                  <div>
                    <div className="mb-2 flex items-baseline justify-between text-xs text-slate-500">
                      <span>
                        <span className="font-mono text-sm text-slate-900 tabular-nums">{attemptedCount}</span> / {totalCount} done
                      </span>
                      <span>
                        Accuracy <span className="font-mono text-sm text-slate-900 tabular-nums">{accuracy}%</span>
                      </span>
                    </div>
                    <div
                      className="h-px w-full bg-slate-100"
                      role="progressbar"
                      aria-valuenow={displayPercentage}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${qbank.title} completion`}
                    >
                      <div
                        className="h-px bg-teal-600 transition-[width] duration-700 ease-out"
                        style={{ width: `${displayPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenModal(qbank, 'tutor')}
                      className="rounded-md border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-800 transition-colors hover:border-slate-300 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600"
                    >
                      Tutor
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenModal(qbank, 'timed')}
                      className="rounded-md bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600"
                    >
                      Timed
                    </button>
                  </div>
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>

      <QuickPracticeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        qbank={selectedQBank}
        defaultMode={selectedMode}
      />
    </>
  );
}
