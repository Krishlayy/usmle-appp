'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  GraduationCap, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Layers,
  BookOpen,
  CheckCircle2,
  Lock,
  Play,
  Volume2,
  VolumeX
} from 'lucide-react';
import { QuickPracticeModal, QBankData } from './QuickPracticeModal';

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
    id: 'autoimmune-diseases',
    title: 'Autoimmune Diseases Q-Bank',
    slug: 'autoimmune-diseases',
    description: 'High-yield systemic lupus erythematosus, rheumatoid arthritis, scleroderma, myasthenia gravis, and HLA associations with verified clinical rationales.',
    totalQuestions: 50,
    specialtyTag: 'RHEUMATOLOGY & IMMUNOLOGY',
    topics: ['Systemic Lupus (SLE)', 'Rheumatoid Arthritis', 'Sjögren Syndrome', 'Systemic Sclerosis', 'Vasculitides'],
    exhibitCount: 31,
    mnemonicCount: 50,
    previewVideoUrl: '/videos/mnemonics/autoimmune/bamboo-stairwell.mp4',
  },
  {
    id: 'biologics-and-their-targets',
    title: 'Biologics & Targeted Therapeutics',
    slug: 'biologics-and-their-targets',
    description: 'Master monoclonal antibodies, receptor antagonists, tyrosine kinase inhibitors, and cytokine modulators with complete mechanism diagrams.',
    totalQuestions: 50,
    specialtyTag: 'PHARMACOLOGY & ONCOLOGY',
    topics: ['TNF-α Inhibitors', 'CD20 Blockers', 'Immune Checkpoints (PD-1/CTLA-4)', 'IL-6 & IL-17', 'VEGF & EGFR'],
    exhibitCount: 16,
    mnemonicCount: 34,
    previewVideoUrl: '/videos/mnemonics/biologics/badge-scanner.mp4',
  },
  {
    id: 'immunodeficiency-disorders',
    title: 'Immunodeficiency Disorders Q-Bank',
    slug: 'immunodeficiency-disorders',
    description: 'Severe combined immunodeficiency (SCID), X-linked agammaglobulinemia (XLA), chronic granulomatous disease, and complement cascade deficiencies.',
    totalQuestions: 50,
    specialtyTag: 'IMMUNOLOGY & PEDIATRICS',
    topics: ['B-Cell Deficiencies', 'T-Cell Disorders (DiGeorge)', 'Phagocytic Defects', 'Complement System', 'SCID & Hyper-IgM'],
    exhibitCount: 20,
    mnemonicCount: 50,
    previewVideoUrl: '/videos/mnemonics/immunodeficiency/eczema-clinic.mp4',
  },
  {
    id: 'approach-to-histology',
    title: 'Approach to Histology Q-Bank',
    slug: 'approach-to-histology',
    description: 'High-resolution microscopic pathology slides, tissue staining principles, cellular architecture, and organ-specific board histology identification.',
    totalQuestions: 50,
    specialtyTag: 'PATHOLOGY & HISTOLOGY',
    topics: ['Epithelial & Glandular Tissues', 'Connective & Cartilage', 'Cardiovascular & Lymphoid', 'Renal & Respiratory', 'GI & Hepatic'],
    exhibitCount: 27,
    mnemonicCount: 31,
    previewVideoUrl: '/videos/hero-simulator.mp4',
  },
];

interface LandingQBanksSectionProps {
  customQBanks?: LandingQBankItem[];
}

export function LandingQBanksSection({ customQBanks }: LandingQBanksSectionProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [selectedQBank, setSelectedQBank] = useState<QBankData | null>(null);
  const [selectedMode, setSelectedMode] = useState<'tutor' | 'timed'>('tutor');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mutedStates, setMutedStates] = useState<Record<string, boolean>>({
    'autoimmune-diseases': true,
    'biologics-and-their-targets': true,
    'immunodeficiency-disorders': true,
    'approach-to-histology': true,
  });

  const qbanks = customQBanks && customQBanks.length > 0 ? customQBanks : DEFAULT_QBANKS;

  const handleStart = (qbank: LandingQBankItem, mode: 'tutor' | 'timed') => {
    if (!session) {
      router.push(`/login?callbackUrl=/dashboard`);
      return;
    }

    setSelectedQBank({
      id: qbank.id,
      title: qbank.title,
      slug: qbank.slug,
      description: qbank.description,
      totalQuestions: qbank.totalQuestions,
      specialtyTag: qbank.specialtyTag,
    });
    setSelectedMode(mode);
    setIsModalOpen(true);
  };

  const toggleMute = (slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMutedStates(prev => ({
      ...prev,
      [slug]: !prev[slug]
    }));
  };

  return (
    <section id="qbanks" className="w-full max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-bold mb-4 font-mono uppercase tracking-wider">
          <Layers className="w-3.5 h-3.5 text-teal-600" />
          <span>Curated System Question Banks</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-slate-900 tracking-tight mb-4">
          All 4 High-Yield Question Banks
        </h2>
        <p className="text-base text-slate-600 leading-relaxed font-sans">
          Select any system to drill all 50 board-curated questions. Choose between self-paced <strong>Tutor Mode</strong> for instant rationales and visual mnemonics, or <strong>Timed Mode</strong> for authentic exam pacing.
        </p>
      </div>

      {/* 2x2 Clean Clinical Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {qbanks.map((qbank) => {
          const isMuted = mutedStates[qbank.slug] ?? true;

          return (
            <div
              key={qbank.id}
              className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm hover:shadow-2xl hover:border-teal-500/50 transition-all duration-300 relative group overflow-hidden"
            >
              {/* Top Accent Strip */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-teal-500 to-cyan-600" />

              <div>
                {/* PIP Video Mnemonic Preview Window */}
                {qbank.previewVideoUrl && (
                  <div className="relative w-full h-48 sm:h-52 rounded-2xl overflow-hidden bg-slate-950 mb-6 border border-slate-200 group-hover:border-teal-500/40 shadow-inner group/video">
                    <video
                      src={qbank.previewVideoUrl}
                      autoPlay
                      loop
                      muted={isMuted}
                      playsInline
                      className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40 pointer-events-none" />
                    
                    {/* Top Overlay Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 border border-teal-500/40 backdrop-blur-md text-[10px] font-mono font-bold text-teal-300">
                        <Sparkles className="w-3 h-3 text-teal-400" />
                        <span>Mnemonic Preview</span>
                      </span>
                    </div>

                    {/* Sound Toggle Button */}
                    <button
                      type="button"
                      onClick={(e) => toggleMute(qbank.slug, e)}
                      className="absolute bottom-3 right-3 p-2 rounded-xl bg-slate-950/80 border border-white/20 text-white hover:bg-teal-600 transition-colors shadow-md cursor-pointer z-10"
                      title={isMuted ? "Unmute preview" : "Mute preview"}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  </div>
                )}

                {/* Header Badges */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-teal-50 border border-teal-200/80 text-[11px] font-bold text-teal-800 font-mono">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                    {qbank.specialtyTag}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded border border-slate-200 font-mono">
                      {qbank.totalQuestions} Questions
                    </span>
                    <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded border border-teal-200 font-mono">
                      {qbank.mnemonicCount} Mnemonics
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className="text-2xl font-bold font-serif text-slate-900 group-hover:text-teal-700 transition-colors mb-3">
                  {qbank.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-sans mb-6">
                  {qbank.description}
                </p>

                {/* Topic Tags */}
                <div className="mb-6">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono">
                    High-Yield Concepts Included
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {qbank.topics.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Actions: Strictly Tutor Mode & Timed Mode */}
              <div className="pt-6 border-t border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleStart(qbank, 'tutor')}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-teal-200 bg-teal-50/70 hover:bg-teal-100/90 text-teal-900 text-sm font-bold shadow-2xs transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <GraduationCap className="w-4 h-4 text-teal-700" />
                    <span>Tutor Mode (50 Qs)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStart(qbank, 'timed')}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-sm font-bold shadow-md shadow-teal-700/20 transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <Clock className="w-4 h-4" />
                    <span>Timed Mode (50 Qs)</span>
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-sans">
                  <span>{qbank.exhibitCount} Interactive Exhibits</span>
                  <span>Selectable Tables &amp; Full Distractors</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Practice Modal */}
      <QuickPracticeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        qbank={selectedQBank}
        defaultMode={selectedMode}
      />
    </section>
  );
}
