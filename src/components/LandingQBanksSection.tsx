'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Volume2, VolumeX } from 'lucide-react';
import { QuickPracticeModal, QBankData } from './QuickPracticeModal';
import { Reveal } from '@/components/ui/Reveal';

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
    <section id="qbanks" className="mx-auto w-full max-w-6xl scroll-mt-20 px-5 py-24 md:px-10">
      <Reveal>
        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-teal-300/80">
          Curated system question banks
        </p>
        <h2 className="max-w-2xl font-serif text-3xl font-medium tracking-tight text-white md:text-4xl">
          All 4 High-Yield Question Banks
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-400">
          Select any system to drill all 50 board-curated questions. Choose between self-paced <strong className="font-medium text-slate-200">Tutor Mode</strong> for instant rationales and visual mnemonics, or <strong className="font-medium text-slate-200">Timed Mode</strong> for authentic exam pacing.
        </p>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {qbanks.map((qbank, i) => {
          const isMuted = mutedStates[qbank.slug] ?? true;

          return (
            <Reveal key={qbank.id} delay={Math.min(i, 5) * 0.05}>
              <article className="group flex h-full flex-col justify-between rounded-lg border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl transition-colors hover:border-white/25">
                <div>
                  {qbank.previewVideoUrl && (
                    <div className="relative mb-6 h-48 w-full overflow-hidden rounded-md border border-white/10 bg-black sm:h-52">
                      <video
                        src={qbank.previewVideoUrl}
                        autoPlay
                        loop
                        muted={isMuted}
                        playsInline
                        aria-label={`${qbank.title} mnemonic preview`}
                        className="h-full w-full object-cover opacity-80 transition-opacity duration-300 group-hover:opacity-100"
                      />
                      <span className="pointer-events-none absolute left-3 top-3 rounded-sm border border-white/15 bg-[#070a0f]/80 px-2 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-teal-300">
                        Mnemonic preview
                      </span>
                      <button
                        type="button"
                        onClick={(e) => toggleMute(qbank.slug, e)}
                        className="absolute bottom-3 right-3 z-10 rounded-md border border-white/15 bg-[#070a0f]/80 p-2 text-slate-200 transition-colors hover:border-white/40 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300"
                        title={isMuted ? "Unmute preview" : "Mute preview"}
                        aria-label={isMuted ? "Unmute preview" : "Mute preview"}
                      >
                        {isMuted ? <VolumeX className="h-4 w-4" aria-hidden /> : <Volume2 className="h-4 w-4" aria-hidden />}
                      </button>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-teal-300/80">
                      {qbank.specialtyTag}
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-wider tabular-nums text-slate-500">
                      {qbank.totalQuestions} Questions &middot; {qbank.mnemonicCount} Mnemonics
                    </span>
                  </div>

                  <h3 className="mt-3 font-serif text-2xl font-medium leading-snug tracking-tight text-white">
                    {qbank.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-400">
                    {qbank.description}
                  </p>

                  <div className="mt-6">
                    <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">
                      High-Yield Concepts Included
                    </p>
                    <ul className="flex flex-wrap gap-2">
                      {qbank.topics.map((t, idx) => (
                        <li
                          key={idx}
                          className="rounded-md border border-white/10 px-2.5 py-1 text-xs text-slate-300"
                        >
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 border-t border-white/10 pt-6">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => handleStart(qbank, 'tutor')}
                      className="rounded-md border border-white/15 px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:border-white/40 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300"
                    >
                      Tutor Mode (50 Qs)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStart(qbank, 'timed')}
                      className="rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-teal-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300"
                    >
                      Timed Mode (50 Qs)
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                    <span><span className="font-mono tabular-nums text-slate-300">{qbank.exhibitCount}</span> Interactive Exhibits</span>
                    <span>Selectable Tables &amp; Full Distractors</span>
                  </div>
                </div>
              </article>
            </Reveal>
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