'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, RotateCcw, Sparkles, Brain, Clock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface CardData {
  id: string;
  front: string;
  back: string;
  interval: number;
  easeFactor: number;
  question?: {
    qid: string;
    subtopic?: string;
  };
}

export default function FlashcardReviewPage(props: { params: Promise<{ qbankSlug: string }> }) {
  const params = use(props.params);
  const searchParams = useSearchParams();
  const deckId = searchParams.get('deckId');
  const router = useRouter();

  const [cards, setCards] = useState<CardData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sessionReviewed, setSessionReviewed] = useState(0);

  useEffect(() => {
    async function loadCards() {
      setLoading(true);
      try {
        const url = deckId 
          ? `/api/readydecks/review?deckId=${encodeURIComponent(deckId)}`
          : `/api/readydecks/review`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setCards(data);
        }
      } catch (e) {
        console.error('Failed to load review cards:', e);
      } finally {
        setLoading(false);
      }
    }
    loadCards();
  }, [deckId]);

  // Keyboard accessibility: Space to flip, 1/2/3 for ratings
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (isFlipped && !submitting) {
        if (e.key === '1') handleRate('AGAIN');
        else if (e.key === '2') handleRate('GOOD');
        else if (e.key === '3') handleRate('EASY');
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, submitting, currentIndex, cards]);

  const handleRate = async (rating: 'AGAIN' | 'GOOD' | 'EASY') => {
    if (!cards[currentIndex] || submitting) return;

    setSubmitting(true);
    const cardId = cards[currentIndex].id;

    try {
      await fetch('/api/readydecks/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flashcardId: cardId,
          rating,
          deckId: deckId || undefined,
        }),
      });

      setSessionReviewed(prev => prev + 1);
      setIsFlipped(false);
      setCurrentIndex(prev => prev + 1);
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const currentCard = cards[currentIndex];
  const isFinished = !loading && (cards.length === 0 || currentIndex >= cards.length);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <Link 
          href={`/dashboard/${params.qbankSlug}/flashcards`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Exit Review
        </Link>
        <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
          <span>Reviewed this session: <strong className="text-slate-900">{sessionReviewed}</strong></span>
          {!isFinished && (
            <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-xs font-bold">
              {currentIndex + 1} / {cards.length}
            </span>
          )}
        </div>
      </header>

      {/* Main Review Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-6 flex flex-col justify-center items-center">
        {loading ? (
          <div className="text-center py-20 text-slate-500 font-medium animate-pulse">
            Loading review session...
          </div>
        ) : isFinished ? (
          <Card elevation="elevated" className="p-10 text-center max-w-md w-full bg-white border border-slate-200 shadow-sm rounded-2xl">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Review Complete!</h2>
            <p className="text-slate-500 text-sm mb-6">
              You reviewed {sessionReviewed} cards today. Spaced repetition schedules have been updated.
            </p>
            <div className="flex flex-col gap-3">
              <Link href={`/dashboard/${params.qbankSlug}/flashcards`}>
                <Button variant="primary" className="w-full">
                  Return to Flashcards
                </Button>
              </Link>
              <Link href={`/dashboard/${params.qbankSlug}`}>
                <Button variant="secondary" className="w-full">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="w-full flex flex-col items-center gap-6">
            {/* Flashcard Card */}
            <div 
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full min-h-[340px] bg-white rounded-2xl border-2 border-slate-200 shadow-md p-8 flex flex-col justify-between cursor-pointer hover:border-cyan-500 transition-all select-none relative group"
            >
              <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                <span className="font-bold tracking-wider uppercase text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded">
                  {isFlipped ? 'Answer (Back)' : 'Question (Front)'}
                </span>
                {currentCard?.question?.qid && (
                  <span>QID: {currentCard.question.qid}</span>
                )}
              </div>

              <div className="py-8 text-center flex-1 flex items-center justify-center">
                <div className="text-lg md:text-xl font-medium text-slate-800 leading-relaxed max-w-xl">
                  {isFlipped ? currentCard.back : currentCard.front}
                </div>
              </div>

              <div className="text-center text-xs text-slate-400 font-medium">
                {isFlipped ? 'Rate difficulty below (1, 2, or 3)' : 'Click card or press Space to reveal answer'}
              </div>
            </div>

            {/* Response Buttons */}
            {isFlipped ? (
              <div className="grid grid-cols-3 gap-4 w-full">
                <button
                  disabled={submitting}
                  onClick={() => handleRate('AGAIN')}
                  className="flex flex-col items-center justify-center py-4 px-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl font-bold transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <span className="text-sm">Again (1)</span>
                  <span className="text-xs text-red-500 font-normal mt-0.5">&lt; 1 day</span>
                </button>
                <button
                  disabled={submitting}
                  onClick={() => handleRate('GOOD')}
                  className="flex flex-col items-center justify-center py-4 px-3 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 rounded-xl font-bold transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <span className="text-sm">Good (2)</span>
                  <span className="text-xs text-cyan-600 font-normal mt-0.5">3 days</span>
                </button>
                <button
                  disabled={submitting}
                  onClick={() => handleRate('EASY')}
                  className="flex flex-col items-center justify-center py-4 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl font-bold transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <span className="text-sm">Easy (3)</span>
                  <span className="text-xs text-emerald-600 font-normal mt-0.5">4+ days</span>
                </button>
              </div>
            ) : (
              <Button 
                onClick={() => setIsFlipped(true)}
                variant="primary"
                className="w-full max-w-md py-3 font-bold"
              >
                Reveal Answer (Space)
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}