'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { RotateCw, Brain, Video, ChevronRight, ChevronLeft, X, Play } from 'lucide-react';

interface Flashcard {
  id: string;
  category: string;
  front: string;
  backHeading: string;
  backText: string;
  mnemonicTitle: string;
  mnemonicDuration: string;
  videoUrl?: string;
}

const CARDS_DECK: Flashcard[] = [
  {
    id: 'fc-1',
    category: 'Pathology & Immunology',
    front: 'What histological glomerular lesion is pathognomonic for severe Lupus Nephritis (Class IV), and what autoantibody titer correlates with its clinical activity?',
    backHeading: 'Diffuse Proliferative Lupus Nephritis (Class IV)',
    backText: "Characterized by diffuse subendothelial immune complex deposits producing distinctive 'wire-loop' capillary thickening on light microscopy. Anti-dsDNA titers closely mirror active renal flare severity and complement consumption (low C3/C4).",
    mnemonicTitle: 'Wire-Looping SLE in the Nephron Court',
    mnemonicDuration: '2:45',
    videoUrl: '/videos/mnemonics/autoimmune/boardroom.mp4'
  },
  {
    id: 'fc-2',
    category: 'Genetics & Pediatric Immunology',
    front: 'A 6-month-old boy presents with recurrent bacterial otitis media and pneumonia. Flow cytometry shows absent CD19+ B-cells with normal CD3+ T-cells. What is the molecular defect and inheritance pattern?',
    backHeading: 'X-Linked (Bruton) Agammaglobulinemia',
    backText: 'Defect in Bruton Tyrosine Kinase (BTK) gene on the X-chromosome leading to arrest of B-cell maturation at the pre-B stage. Lymph nodes lack germinal centers; serum immunoglobulins of all classes (IgG, IgA, IgM) are markedly reduced.',
    mnemonicTitle: 'Bruton the Broken Key on X-Street',
    mnemonicDuration: '2:15',
    videoUrl: '/videos/mnemonics/autoimmune/boardroom.mp4'
  },
  {
    id: 'fc-3',
    category: 'Pharmacology & Oncology',
    front: 'Which targeted monoclonal antibody binds CD20 on pre-B and mature B-cells to induce antibody-dependent cellular cytotoxicity, and what life-threatening viral reactivation must be screened for prior to therapy?',
    backHeading: 'Rituximab (Chimeric Anti-CD20)',
    backText: 'Rituximab binds the transmembrane protein CD20. Prior to initiation, all patients must be screened for Hepatitis B virus (HBV) surface antigen and core antibody due to fatal fulminant hepatitis reactivation risk, and monitored for PML (JC virus).',
    mnemonicTitle: 'Rituxan the 20-Gun Salute',
    mnemonicDuration: '3:10',
    videoUrl: '/videos/mnemonics/autoimmune/boardroom.mp4'
  },
  {
    id: 'fc-4',
    category: 'Rheumatology & Vasculitis',
    front: 'An 8-year-old boy presents with fever for 6 days, strawberry tongue, bilateral conjunctival injection without exudate, and desquamation of hands. What critical cardiovascular complication warrants IVIG and high-dose aspirin?',
    backHeading: 'Kawasaki Disease (Mucocutaneous Lymph Node Syndrome)',
    backText: 'Medium-vessel vasculitis targeting coronary arteries. Untreated patients carry a 20-25% risk of coronary artery aneurysms and thrombosis. High-dose aspirin is prescribed despite Reye syndrome risk due to immediate cardiac benefit.',
    mnemonicTitle: 'Kawasaki CRASH and Burn on Coronary Lane',
    mnemonicDuration: '3:05',
    videoUrl: '/videos/mnemonics/autoimmune/boardroom.mp4'
  }
];

export default function FlashcardsReviewPage() {
  const [deck, setDeck] = useState<Flashcard[]>(CARDS_DECK);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

  const currentCard = deck[currentIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleRate = (interval: string) => {
    setIsFlipped(false);
    setCompletedCount(prev => prev + 1);

    if (currentIndex + 1 < deck.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Loop or restart deck
      setCurrentIndex(0);
    }
  };

  const focusRing = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300';

  return (
    <div className="min-h-screen bg-[#070a0f] px-5 py-12 text-slate-100 md:px-10 md:py-16">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">

        {/* Header Bar */}
        <div className="flex w-full items-center justify-between border-b border-white/10 pb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-400">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-teal-300" aria-hidden />
              <span>Due Today: <strong className="font-medium tabular-nums text-white">18</strong></span>
            </span>
            <span>Reviewed: <strong className="font-medium tabular-nums text-white">{completedCount}</strong></span>
          </div>
          <span className="tabular-nums text-slate-300">
            Card {currentIndex + 1} of {deck.length}
          </span>
        </div>

        {/* Flip Card (mouse convenience; keyboard users use the Flip button below) */}
        <div
          onClick={handleFlip}
          className="group h-96 w-full cursor-pointer [perspective:1000px]"
        >
          <div
            className={`relative h-full w-full rounded-lg transition-transform duration-500 [transform-style:preserve-3d] motion-reduce:transition-none ${
              isFlipped ? '[transform:rotateY(180deg)]' : ''
            }`}
          >
            {/* Front of Card */}
            <div
              inert={isFlipped}
              className="absolute inset-0 flex flex-col justify-between rounded-lg border border-white/10 bg-[#0d1219] p-8 [backface-visibility:hidden]"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-teal-300/80">
                    {currentCard.category}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <RotateCw className="h-3.5 w-3.5" aria-hidden />
                    Flip to see answer
                  </span>
                </div>

                <h2 className="pt-2 font-serif text-lg font-medium leading-relaxed text-white md:text-xl">
                  {currentCard.front}
                </h2>
              </div>

              <div className="border-t border-white/10 pt-3 text-center text-xs text-slate-500">
                Tap or click card to reveal answer &amp; mnemonic pearl &rarr;
              </div>
            </div>

            {/* Back of Card */}
            <div
              inert={!isFlipped}
              className="absolute inset-0 flex flex-col justify-between rounded-lg border border-white/15 bg-[#0d1219] p-8 [backface-visibility:hidden] [transform:rotateY(180deg)]"
            >
              <div className="space-y-3">
                <span className="inline-block font-mono text-[11px] uppercase tracking-[0.18em] text-teal-300/80">
                  High-Yield Recall Pearl &amp; Synthesis
                </span>

                <h3 className="font-serif text-lg font-medium leading-snug text-white">
                  {currentCard.backHeading}
                </h3>

                <div className="max-h-40 overflow-y-auto pr-1 text-sm leading-relaxed text-slate-300">
                  {currentCard.backText}
                </div>
              </div>

              {/* Video Mnemonic Trigger inside Card */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowVideoModal(true);
                }}
                className={`flex w-full items-center justify-between rounded-md border border-white/15 p-3 text-left transition-colors hover:border-white/40 ${focusRing}`}
              >
                <span className="flex items-center gap-3">
                  <Play className="h-4 w-4 text-teal-300" aria-hidden />
                  <span>
                    <span className="block text-xs text-white">Mnemonic: {currentCard.mnemonicTitle}</span>
                    <span className="block text-[11px] text-slate-500">Duration {currentCard.mnemonicDuration} &bull; Clinical memory anchor</span>
                  </span>
                </span>
                <span className="text-xs text-teal-300">Play &rarr;</span>
              </button>
            </div>

          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleFlip}
            aria-pressed={isFlipped}
            className={`rounded-md border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-white/40 hover:text-white ${focusRing}`}
          >
            {isFlipped ? 'Show question' : 'Show answer'}
          </button>
        </div>

        {/* SM-2 Interval Rating Controls */}
        <div className="grid w-full grid-cols-4 gap-2">
          {[
            { id: 'again', label: 'Again', interval: '< 1 min' },
            { id: 'hard', label: 'Hard', interval: '1 day' },
            { id: 'good', label: 'Good', interval: '3 days' },
            { id: 'easy', label: 'Easy', interval: '7 days' },
          ].map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => handleRate(r.id)}
              className={`flex flex-col items-center rounded-md border border-white/15 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:border-white/40 hover:text-white ${focusRing}`}
            >
              <span>{r.label}</span>
              <span className="font-mono text-[11px] font-normal text-slate-500">{r.interval}</span>
            </button>
          ))}
        </div>

        {/* Card Navigation Footer */}
        <div className="flex w-full items-center justify-between border-t border-white/10 pt-4 text-sm text-slate-400">
          <button
            type="button"
            onClick={() => {
              setIsFlipped(false);
              setCurrentIndex(prev => (prev > 0 ? prev - 1 : deck.length - 1));
            }}
            className={`flex items-center gap-1 transition-colors hover:text-white ${focusRing}`}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            <span>Previous Card</span>
          </button>

          <Link
            href="/dashboard"
            className={`text-teal-300 transition-colors hover:text-teal-200 ${focusRing}`}
          >
            Return to Dashboard &rarr;
          </Link>

          <button
            type="button"
            onClick={() => {
              setIsFlipped(false);
              setCurrentIndex(prev => (prev + 1 < deck.length ? prev + 1 : 0));
            }}
            className={`flex items-center gap-1 transition-colors hover:text-white ${focusRing}`}
          >
            <span>Next Card</span>
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>

      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070a0f]/85 p-4 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" aria-label={currentCard.mnemonicTitle} className="w-full max-w-2xl space-y-4 rounded-lg border border-white/15 bg-[#0d1219] p-6">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-teal-300" aria-hidden />
                <h3 className="font-serif text-base font-medium">{currentCard.mnemonicTitle}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowVideoModal(false)}
                aria-label="Close video"
                className={`rounded-md p-1.5 text-slate-400 transition-colors hover:text-white ${focusRing}`}
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-md border border-white/10 bg-black">
              <video
                src="/videos/mnemonics/autoimmune/boardroom.mp4"
                controls
                autoPlay
                className="h-full w-full object-contain"
              />
            </div>

            <p className="text-xs text-slate-400">
              High-yield visual memory anchor for long-term retention. Correlates clinical findings with pathognomonic board clues.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}