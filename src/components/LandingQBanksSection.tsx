'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Volume2, VolumeX, Sparkles, Maximize2, ArrowUpRight, CheckCircle2, MessageSquare } from 'lucide-react';
import { QuickPracticeModal, QBankData } from './QuickPracticeModal';
import { QBankDetailModal, QBankDetailData } from './QBankDetailModal';
import { SupportModal } from './SupportModal';
import { Reveal } from '@/components/ui/Reveal';
import { AutoPlayVideo } from '@/components/ui/AutoPlayVideo';

export interface LandingQBankItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  totalQuestions: number;
  specialtyTag: string;
  topics: string[];
  exhibitCount: number;
  mnemonicCount: number;
  previewVideoUrl?: string;
}

const DEFAULT_QBANKS: LandingQBankItem[] = [
  {
    id: 'approach-to-histology',
    title: 'Approach to Histology',
    slug: 'approach-to-histology',
    description: 'High-yield USMLE Step 1 histology concepts, tissue preparation artifacts, organ-level microarchitecture, and diagnostic features with integrated video mnemonics.',
    totalQuestions: 50,
    specialtyTag: 'PATHOLOGY & HISTOLOGY',
    topics: ['Epithelial & Glandular Tissues', 'Connective & Cartilage', 'Cardiovascular & Lymphoid', 'Renal & Respiratory', 'GI & Hepatic'],
    exhibitCount: 27,
    mnemonicCount: 31,
    previewVideoUrl: '/videos/mnemonics/histology/colour-room.mp4',
  },
  {
    id: 'autoimmune-diseases',
    title: 'Autoimmune Diseases Q-Bank',
    slug: 'autoimmune-diseases',
    description: 'Master SLE, Rheumatoid Arthritis, Scleroderma, Vasculitides, and HLA associations with high-yield distractor analysis and clinical recall mnemonics.',
    totalQuestions: 50,
    specialtyTag: 'IMMUNOLOGY / RHEUMATOLOGY',
    topics: ['Systemic Lupus (SLE)', 'Rheumatoid Arthritis', 'Sjögren Syndrome', 'Systemic Sclerosis', 'Vasculitides'],
    exhibitCount: 31,
    mnemonicCount: 50,
    previewVideoUrl: '/videos/mnemonics/autoimmune/bamboo-stairwell.mp4',
  },
  {
    id: 'biologics-and-their-targets',
    title: 'Biologics & Targeted Therapeutics',
    slug: 'biologics-and-their-targets',
    description: 'Monoclonal antibodies, TNF inhibitors, checkpoint inhibitors, and receptor antagonists with precise clinical indication mechanisms.',
    totalQuestions: 50,
    specialtyTag: 'PHARMACOLOGY / ONCOLOGY',
    topics: ['TNF-α Inhibitors', 'CD20 Blockers', 'Immune Checkpoints (PD-1/CTLA-4)', 'IL-6 & IL-17', 'VEGF & EGFR'],
    exhibitCount: 16,
    mnemonicCount: 34,
    previewVideoUrl: '/videos/mnemonics/biologics/badge-scanner.mp4',
  },
  {
    id: 'immunodeficiency-disorders',
    title: 'Immunodeficiency Disorders Q-Bank',
    slug: 'immunodeficiency-disorders',
    description: 'SCID, Bruton Agammaglobulinemia, CVID, DiGeorge Syndrome, and complement deficiencies thoroughly mapped to visual memory anchors.',
    totalQuestions: 50,
    specialtyTag: 'IMMUNOLOGY / GENETRICS',
    topics: ['B-Cell Deficiencies', 'T-Cell Disorders (DiGeorge)', 'Phagocytic Defects', 'Complement System', 'SCID & Hyper-IgM'],
    exhibitCount: 20,
    mnemonicCount: 50,
    previewVideoUrl: '/videos/mnemonics/immunodeficiency/eczema-clinic.mp4',
  },
];

interface LandingQBanksSectionProps {
  customQBanks?: LandingQBankItem[];
}

export function LandingQBanksSection({ customQBanks }: LandingQBanksSectionProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [selectedQBank, setSelectedQBank] = useState<QBankData | null>(null);
  const [selectedDetailQBank, setSelectedDetailQBank] = useState<QBankDetailData | null>(null);
  const [selectedMode, setSelectedMode] = useState<'tutor' | 'timed'>('tutor');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [supportSubject, setSupportSubject] = useState('');
  const [mutedStates, setMutedStates] = useState<Record<string, boolean>>({});

  const qbanks = customQBanks && customQBanks.length > 0 ? customQBanks : DEFAULT_QBANKS;

  const toggleMute = (slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setMutedStates((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  };

  const handleLaunchMode = (qbank: LandingQBankItem, mode: 'tutor' | 'timed') => {
    if (!session) {
      router.push(`/signup?redirect=/dashboard/${qbank.slug}?mode=${mode}`);
      return;
    }

    setSelectedQBank({
      id: qbank.id,
      title: qbank.title,
      slug: qbank.slug,
      description: qbank.description,
      totalQuestions: qbank.totalQuestions,
      specialtyTag: qbank.specialtyTag,
      completionPercentage: 0,
      accuracy: 0,
      attemptedCount: 0,
    });
    setSelectedMode(mode);
    setIsModalOpen(true);
  };

  const handleOpenDetail = (qbank: LandingQBankItem) => {
    setSelectedDetailQBank(qbank);
    setIsDetailModalOpen(true);
  };

  return (
    <section id="qbanks" className="mx-auto w-full max-w-6xl px-5 py-20 md:px-10">
      <Reveal>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-teal-700 font-semibold">
              High-Yield Curriculum
            </p>
            <h2 className="font-serif text-3xl font-medium tracking-tight text-slate-900 md:text-5xl">
              Authentic USMLE&reg; Question Banks
            </h2>
          </div>
          <p className="max-w-md text-sm text-slate-600 leading-relaxed">
            Click any question bank to preview video mnemonics, examine syllabus topics, and start instant board practice.
          </p>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {qbanks.map((qbank, index) => {
          const isMuted = mutedStates[qbank.slug] ?? true;

          return (
            <Reveal key={qbank.id} delay={index * 0.08}>
              <div
                onClick={() => handleOpenDetail(qbank)}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all duration-300 hover:border-slate-300 hover:shadow-lg cursor-pointer"
              >
                <div>
                  {/* Video Mnemonic Preview Thumbnail */}
                  {qbank.previewVideoUrl && (
                    <div className="relative mb-5 aspect-video w-full overflow-hidden rounded-xl bg-slate-900 border border-slate-200 shadow-2xs">
                      <AutoPlayVideo
                        src={qbank.previewVideoUrl}
                        muted={isMuted}
                        maxDuration={3}
                        preload="auto"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      
                      <span className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-sm border border-slate-200/90 bg-white/95 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-teal-700 font-bold shadow-2xs">
                        <Sparkles className="h-3 w-3 text-teal-600" />
                        3s Video Mnemonic Preview
                      </span>

                      {/* Video Controls overlay */}
                      <div className="absolute bottom-2.5 right-2.5 z-10 flex items-center gap-1 rounded-md border border-slate-200/90 bg-white/95 p-1 text-slate-700 shadow-xs">
                        <button
                          type="button"
                          onClick={(e) => toggleMute(qbank.slug, e)}
                          className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-semibold hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        >
                          {isMuted ? <VolumeX className="h-3.5 w-3.5 text-slate-500" /> : <Volume2 className="h-3.5 w-3.5 text-teal-700" />}
                          <span className="text-[11px] font-mono">{isMuted ? 'Muted' : 'Sound'}</span>
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

                  <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-slate-600">
                    {qbank.description}
                  </p>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-5">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-4 font-mono">
                    <span>{qbank.totalQuestions} Questions</span>
                    <span className="text-teal-700 font-semibold">Full Board Simulator</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => handleLaunchMode(qbank, 'tutor')}
                      className="rounded-lg border border-slate-200 bg-white py-2.5 text-center text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
                    >
                      Tutor Mode
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLaunchMode(qbank, 'timed')}
                      className="rounded-lg bg-teal-700 py-2.5 text-center text-xs font-semibold text-white shadow-xs transition-all hover:bg-teal-800 cursor-pointer"
                    >
                      Timed Mode
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>

      {/* Quick Launch Modal */}
      {selectedQBank && (
        <QuickPracticeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          qbank={selectedQBank}
          defaultMode={selectedMode}
        />
      )}

      {/* Detail & Learning Modal */}
      <QBankDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        qbank={selectedDetailQBank}
        onLaunchMode={(mode) => {
          if (selectedDetailQBank) {
            const matched = qbanks.find((q) => q.id === selectedDetailQBank.id);
            if (matched) {
              handleLaunchMode(matched, mode);
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
    </section>
  );
}
