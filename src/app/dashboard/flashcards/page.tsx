'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  RotateCw, 
  CheckCircle2, 
  Brain, 
  Video, 
  ChevronRight, 
  ChevronLeft,
  X,
  Play
} from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] py-10 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto flex flex-col items-center justify-center space-y-6 animate-page-enter">
      
      {/* Header Bar */}
      <div className="w-full flex items-center justify-between text-xs font-mono text-slate-500 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Brain className="w-4 h-4 text-teal-600" />
            <span>Due Today: <strong className="text-teal-700">18</strong></span>
          </span>
          <span>Reviewed: <strong className="text-cyan-700">{completedCount}</strong></span>
        </div>
        <span className="font-semibold text-slate-700">
          Card {currentIndex + 1} of {deck.length}
        </span>
      </div>

      {/* 3D Flip Card Container */}
      <div 
        onClick={handleFlip}
        className="w-full h-96 [perspective:1000px] cursor-pointer group"
      >
        <div 
          className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] shadow-xl rounded-2xl ${
            isFlipped ? '[transform:rotateY(180deg)]' : ''
          }`}
        >
          {/* Front of Card */}
          <div className="absolute inset-0 bg-white rounded-2xl border border-slate-200/90 p-8 flex flex-col justify-between [backface-visibility:hidden]">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 font-mono">
                  {currentCard.category}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <RotateCw className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-180 transition-transform duration-500" />
                  Flip to see answer
                </span>
              </div>

              <h2 className="text-lg md:text-xl font-bold font-serif text-slate-900 leading-relaxed pt-2">
                {currentCard.front}
              </h2>
            </div>

            <div className="text-center text-xs text-slate-400 font-sans border-t border-slate-100 pt-3">
              Tap or click card to reveal answer & mnemonic pearl &rarr;
            </div>
          </div>

          {/* Back of Card */}
          <div className="absolute inset-0 bg-slate-900 text-white rounded-2xl border border-slate-800 p-8 flex flex-col justify-between [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-teal-900/60 text-teal-300 border border-teal-700 font-mono inline-block">
                High-Yield Recall Pearl & Synthesis
              </span>
              
              <h3 className="font-serif font-bold text-lg text-teal-300 leading-snug">
                {currentCard.backHeading}
              </h3>

              <div className="text-xs md:text-sm text-slate-200 leading-relaxed font-sans max-h-40 overflow-y-auto pr-1">
                {currentCard.backText}
              </div>
            </div>

            {/* Video Mnemonic Trigger inside Card */}
            <div 
              onClick={(e) => {
                e.stopPropagation();
                setShowVideoModal(true);
              }}
              className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 flex items-center justify-between transition-colors cursor-pointer group/vid"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-teal-500 text-slate-900 flex items-center justify-center">
                  <Play className="w-3.5 h-3.5 fill-slate-900 ml-0.5" />
                </div>
                <div>
                  <div className="text-xs text-teal-300 font-semibold font-mono flex items-center gap-1.5">
                    <span>Mnemonic: {currentCard.mnemonicTitle}</span>
                  </div>
                  <div className="text-[10px] text-slate-400">Duration {currentCard.mnemonicDuration} &bull; Clinical memory anchor</div>
                </div>
              </div>
              <span className="text-xs text-teal-400 font-bold group-hover/vid:translate-x-0.5 transition-transform">
                Play &rarr;
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* SM-2 Interval Rating Controls */}
      <div className="w-full grid grid-cols-4 gap-3 pt-2">
        <button 
          onClick={() => handleRate('again')}
          className="py-2.5 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 font-bold text-xs shadow-sm transition-all flex flex-col items-center hover:scale-[1.02]"
        >
          <span>Again</span>
          <span className="text-[10px] font-mono text-rose-500 font-normal">&lt; 1 min</span>
        </button>

        <button 
          onClick={() => handleRate('hard')}
          className="py-2.5 rounded-xl border border-amber-200 bg-white hover:bg-amber-50 text-amber-700 font-bold text-xs shadow-sm transition-all flex flex-col items-center hover:scale-[1.02]"
        >
          <span>Hard</span>
          <span className="text-[10px] font-mono text-amber-500 font-normal">1 day</span>
        </button>

        <button 
          onClick={() => handleRate('good')}
          className="py-2.5 rounded-xl border border-teal-200 bg-white hover:bg-teal-50 text-teal-800 font-bold text-xs shadow-sm transition-all flex flex-col items-center hover:scale-[1.02]"
        >
          <span>Good</span>
          <span className="text-[10px] font-mono text-teal-600 font-normal">3 days</span>
        </button>

        <button 
          onClick={() => handleRate('easy')}
          className="py-2.5 rounded-xl border border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-800 font-bold text-xs shadow-sm transition-all flex flex-col items-center hover:scale-[1.02]"
        >
          <span>Easy</span>
          <span className="text-[10px] font-mono text-emerald-600 font-normal">7 days</span>
        </button>
      </div>

      {/* Card Navigation Footer */}
      <div className="w-full flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-200">
        <button
          onClick={() => {
            setIsFlipped(false);
            setCurrentIndex(prev => (prev > 0 ? prev - 1 : deck.length - 1));
          }}
          className="flex items-center gap-1 hover:text-slate-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous Card</span>
        </button>

        <Link 
          href="/dashboard"
          className="text-teal-700 font-semibold hover:underline"
        >
          Return to Dashboard &rarr;
        </Link>

        <button
          onClick={() => {
            setIsFlipped(false);
            setCurrentIndex(prev => (prev + 1 < deck.length ? prev + 1 : 0));
          }}
          className="flex items-center gap-1 hover:text-slate-800 transition-colors"
        >
          <span>Next Card</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-4 p-6">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-teal-400" />
                <h3 className="font-serif font-bold text-base">{currentCard.mnemonicTitle}</h3>
              </div>
              <button 
                onClick={() => setShowVideoModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
              <video 
                src="/videos/mnemonics/autoimmune/boardroom.mp4" 
                controls 
                autoPlay 
                className="w-full h-full object-contain"
              />
            </div>

            <div className="text-xs text-slate-400">
              High-yield visual memory anchor for long-term retention. Correlates clinical findings with pathognomonic board clues.
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
