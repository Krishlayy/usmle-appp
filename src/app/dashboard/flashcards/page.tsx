'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  ChevronLeft, 
  RotateCw, 
  CheckCircle2, 
  Layers, 
  Brain,
  Video,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { VideoMnemonicPlayer } from '@/components/VideoMnemonicPlayer';

interface FlashcardItem {
  id: string;
  front: string;
  back: string;
  interval: number;
  easeFactor: number;
  nextReview: string;
  question?: {
    qid: string;
    subtopic: string | null;
    videoUrl: string | null;
  };
}

export default function FlashcardsReviewPage() {
  const [cards, setCards] = useState<FlashcardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    fetch('/api/flashcards')
      .then(res => res.json())
      .then(data => {
        if (data.flashcards) {
          setCards(data.flashcards);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleRate = async (rating: number) => {
    if (cards.length === 0 || reviewing) return;
    const currentCard = cards[currentIndex];
    setReviewing(true);

    try {
      await fetch('/api/flashcards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flashcardId: currentCard.id, rating })
      });

      if (currentIndex + 1 < cards.length) {
        setCurrentIndex(currentIndex + 1);
        setIsFlipped(false);
        setShowVideo(false);
      } else {
        setCompleted(true);
      }
    } catch (e) {
      console.error('Failed to rate flashcard:', e);
    } finally {
      setReviewing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-16 px-4 max-w-4xl flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Loading Spaced Repetition Deck...</p>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="container mx-auto py-10 px-4 md:px-8 max-w-4xl animate-page-enter font-sans">
      
      {/* Header */}
      <div className="mb-8 flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-2">
            <ChevronLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 font-serif tracking-tight flex items-center gap-2.5">
            <Brain className="w-6 h-6 text-teal-600" />
            Spaced Repetition Flashcards
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold px-3 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-full">
            {cards.length > 0 ? `${currentIndex + 1} / ${cards.length} Cards` : '0 Cards'}
          </span>
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-xl mx-auto shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-4 border border-teal-100">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">No Flashcards Yet</h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">
            While solving questions in the Test Player, click the <strong>&ldquo;Create Flashcard&rdquo;</strong> button on any question or video mnemonic to save concepts directly into your spaced repetition queue.
          </p>
          <Link href="/dashboard/create-test">
            <Button variant="primary" className="bg-teal-600 hover:bg-teal-500 text-white font-bold gap-2">
              Start Practice Session <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      ) : completed ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-xl mx-auto shadow-2xs">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Review Complete!</h2>
          <p className="text-sm text-slate-600 mb-6">
            You have reviewed all cards in your current spaced repetition queue. Great work reinforcing high-yield recall today!
          </p>
          <div className="flex justify-center gap-3">
            <Button 
              variant="secondary"
              onClick={() => { setCompleted(false); setCurrentIndex(0); setIsFlipped(false); }}
              className="gap-2"
            >
              <RotateCw className="w-4 h-4" /> Review Again
            </Button>
            <Link href="/dashboard">
              <Button variant="primary" className="bg-slate-900 text-white hover:bg-slate-800">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6 max-w-2xl mx-auto">
          
          {/* Card Meta */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              {currentCard?.question?.qid || 'High-Yield Pearl'}
            </span>
            <span>{currentCard?.question?.subtopic || 'Clinical Medicine'}</span>
          </div>

          {/* Flashcard Body */}
          <div 
            onClick={() => setIsFlipped(!isFlipped)}
            className="bg-white rounded-2xl border-2 border-slate-200 hover:border-teal-400/80 p-8 min-h-[300px] flex flex-col justify-between cursor-pointer transition-all shadow-sm select-none"
          >
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-4">
                {isFlipped ? 'Answer & Clinical Rationale' : 'Question / High-Yield Prompt'}
              </div>
              <div className="text-slate-900 text-lg md:text-xl font-medium leading-relaxed">
                {isFlipped ? currentCard.back : currentCard.front}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>Click card or press space to flip</span>
              <span className="font-semibold text-teal-700">
                {isFlipped ? 'Back' : 'Front'}
              </span>
            </div>
          </div>

          {/* Linked Video Mnemonic if available */}
          {isFlipped && currentCard?.question?.videoUrl && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setShowVideo(!showVideo)}
                className="w-full py-2.5 px-4 rounded-xl border border-teal-200 bg-teal-50/70 text-teal-900 font-bold text-xs flex items-center justify-center gap-2 hover:bg-teal-100 transition-colors"
              >
                <Video className="w-4 h-4 text-teal-700" />
                {showVideo ? 'Hide Linked Video Mnemonic' : '🎬 Watch Linked Video Mnemonic'}
              </button>

              {showVideo && (
                <div className="rounded-xl overflow-hidden shadow-md">
                  <VideoMnemonicPlayer 
                    videoUrl={currentCard.question.videoUrl}
                    title={currentCard.question.subtopic || 'Concept Retention Video'}
                  />
                </div>
              )}
            </div>
          )}

          {/* Spaced Repetition Rating Buttons (Only shown when flipped) */}
          {isFlipped ? (
            <div className="pt-2">
              <div className="text-center text-xs font-semibold text-slate-500 mb-3">
                Rate your recall difficulty (SM-2 Interval Calculation):
              </div>
              <div className="grid grid-cols-4 gap-3">
                <button
                  type="button"
                  disabled={reviewing}
                  onClick={() => handleRate(1)}
                  className="py-3 px-2 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-800 font-bold text-xs transition-colors flex flex-col items-center gap-1 cursor-pointer"
                >
                  <span>Again</span>
                  <span className="text-[10px] text-rose-600 font-normal">&lt; 1 day</span>
                </button>

                <button
                  type="button"
                  disabled={reviewing}
                  onClick={() => handleRate(2)}
                  className="py-3 px-2 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-800 font-bold text-xs transition-colors flex flex-col items-center gap-1 cursor-pointer"
                >
                  <span>Hard</span>
                  <span className="text-[10px] text-amber-600 font-normal">1 day</span>
                </button>

                <button
                  type="button"
                  disabled={reviewing}
                  onClick={() => handleRate(3)}
                  className="py-3 px-2 rounded-xl bg-teal-50 border border-teal-200 hover:bg-teal-100 text-teal-800 font-bold text-xs transition-colors flex flex-col items-center gap-1 cursor-pointer"
                >
                  <span>Good</span>
                  <span className="text-[10px] text-teal-600 font-normal">3 days</span>
                </button>

                <button
                  type="button"
                  disabled={reviewing}
                  onClick={() => handleRate(4)}
                  className="py-3 px-2 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition-colors flex flex-col items-center gap-1 cursor-pointer"
                >
                  <span>Easy</span>
                  <span className="text-[10px] text-emerald-600 font-normal">4 days</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsFlipped(true)}
                className="py-3 px-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-sm transition-colors cursor-pointer"
              >
                Reveal Answer
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
