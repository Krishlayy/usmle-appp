'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

type Option = {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string | null;
};

type Question = {
  id: string;
  qid: string;
  explanation: string | null;
  acceptableAnswers: string[];
  tags: string[];
  media?: any[];
  options: Option[];
};

type SessionQuestion = {
  id: string;
  order: number;
  question: Question;
  isFlagged: boolean;
  selectedOptionId: string | null;
  isCorrect: boolean | null;
  timeTakenSec: number;
};

type TestSession = {
  id: string;
  mode: string;
  durationSec: number | null;
  questions: SessionQuestion[];
};
import { Calculator } from '@/components/Calculator';
import { LabValuesModal } from '@/components/LabValuesModal';
import { MediaRenderer } from '@/components/MediaRenderer';

export function TestPlayer({ session }: { session: TestSession }) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questions, setQuestions] = useState<SessionQuestion[]>(session.questions.sort((a, b) => a.order - b.order));
  const [timeLeft, setTimeLeft] = useState<number | null>(session.durationSec);
  const [submitting, setSubmitting] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [isObscured, setIsObscured] = useState(false);
  
  // Tools state
  const [showCalculator, setShowCalculator] = useState(false);
  const [showLabValues, setShowLabValues] = useState(false);
  const [strikethroughOptions, setStrikethroughOptions] = useState<Record<string, Set<string>>>({});
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const currentQ = questions[currentIndex];
  const isTimed = session.mode === 'timed';

  const finishSession = useCallback(async (finalQuestions: SessionQuestion[]) => {
    setSubmitting(true);
    try {
      await fetch(`/api/test-sessions/${session.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: finalQuestions }),
      });
      router.push(`/dashboard/session/${session.id}/results`);
    } catch (error) {
      console.error('Failed to submit session', error);
      alert('Failed to submit session. Please try again.');
      setSubmitting(false);
    }
  }, [session.id, router]);

  useEffect(() => {
    if (!isTimed || timeLeft === null) return;
    
    if (timeLeft <= 0) {
      finishSession(questions);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => (prev && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isTimed, timeLeft, finishSession, questions]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsObscured(true);
      }
    };

    const handleBlur = () => {
      // Don't obscure if focus moved to an embedded video (iframe)
      if (document.activeElement?.tagName.toLowerCase() === 'iframe') {
        return;
      }
      setIsObscured(true);
    };

    const handleFocus = () => {
      setIsObscured(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'Escape' ||
        e.key === 'PrintScreen' ||
        (e.ctrlKey && e.key === 'p') ||
        (e.metaKey && e.key === 'p') ||
        (e.ctrlKey && e.key === 's') ||
        (e.metaKey && e.key === 's')
      ) {
        e.preventDefault();
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);

    // Lightbox event delegation for images in explanations
    const handleImageClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG' && target.closest('.prose')) {
        const src = target.getAttribute('src');
        if (src) setZoomImage(src);
      }
    };
    document.addEventListener('click', handleImageClick);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('click', handleImageClick);
    };
  }, []);

  const updateCurrentQuestionState = (updates: Partial<SessionQuestion>) => {
    setQuestions(prev => prev.map((q, i) => 
      i === currentIndex ? { ...q, ...updates } : q
    ));
  };

  const handleOptionSelect = (optionId: string) => {
    if (session.mode === 'tutor' && currentQ.selectedOptionId) return;

    const selectedOption = currentQ.question.options.find(o => o.id === optionId);
    const isCorrect = selectedOption?.isCorrect ?? false;
    
    updateCurrentQuestionState({ 
      selectedOptionId: optionId,
      isCorrect
    });
  };

  const handleNext = () => {
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    updateCurrentQuestionState({ timeTakenSec: currentQ.timeTakenSec + timeSpent });
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setQuestionStartTime(Date.now());
    } else {
      finishSession(questions);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
      updateCurrentQuestionState({ timeTakenSec: currentQ.timeTakenSec + timeSpent });
      setCurrentIndex(prev => prev - 1);
      setQuestionStartTime(Date.now());
    }
  };

  const toggleFlag = () => {
    updateCurrentQuestionState({ isFlagged: !currentQ.isFlagged });
  };

  const toggleStrikethrough = (e: React.MouseEvent, optionId: string) => {
    e.stopPropagation();
    setStrikethroughOptions(prev => {
      const qState = new Set(prev[currentQ.id] || []);
      if (qState.has(optionId)) {
        qState.delete(optionId);
      } else {
        qState.add(optionId);
      }
      return { ...prev, [currentQ.id]: qState };
    });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans">
      {/* Clinical Header */}
      <header className="bg-slate-900 text-white h-14 flex items-center justify-between px-6 shrink-0 shadow-md z-10">
        <div className="flex items-center gap-6">
          <div className="font-bold text-lg tracking-tight text-white border-r border-slate-700 pr-6">
            U-Micro <span className="text-blue-400 font-medium text-sm ml-2">Block</span>
          </div>
          <span className="font-medium text-slate-300 text-sm tracking-wide">Item: {currentIndex + 1} of {questions.length}</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex gap-1 border-r border-slate-700 pr-4 mr-2">
            <button 
              onClick={() => setShowCalculator(!showCalculator)}
              className={`px-3 py-1.5 rounded-sm text-sm font-medium transition-colors flex items-center gap-2 ${showCalculator ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
            >
              Calculator
            </button>
            <button 
              onClick={() => setShowLabValues(true)}
              className="px-3 py-1.5 rounded-sm text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              Lab Values
            </button>
            <button 
              onClick={() => router.push('/dashboard')}
              className="px-3 py-1.5 rounded-sm text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              Suspend
            </button>
          </div>

          <button 
            onClick={toggleFlag}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-sm text-sm font-bold uppercase tracking-wider transition-all ${currentQ.isFlagged ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            <svg className="w-4 h-4" fill={currentQ.isFlagged ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"></path></svg>
            {currentQ.isFlagged ? 'Flagged' : 'Flag'}
          </button>

          {isTimed && timeLeft !== null && (
            <div className="flex items-center gap-3 bg-slate-800 px-4 py-1.5 rounded-sm border border-slate-700">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Time</span>
              <span className={`font-mono text-lg font-bold ${timeLeft < 60 ? 'text-red-400' : 'text-white'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Main content - Clinical White Background */}
      <div className="flex-1 overflow-auto flex bg-slate-200 p-4 md:p-6">
        <div className="flex-1 max-w-5xl mx-auto flex flex-col h-full bg-white shadow-lg border border-slate-300">
          
          <div className="flex-1 overflow-auto p-8 md:p-12 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none select-none text-9xl font-extrabold text-slate-900 tracking-tighter">
              UMICRO
            </div>

            <div className="selection:bg-yellow-300 selection:text-slate-900">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-mono text-slate-400">QID: {currentQ.question.qid}</span>
                {currentQ.question.tags && currentQ.question.tags.length > 0 && (
                  <div className="flex gap-2">
                    {currentQ.question.tags.map(tag => (
                      <span key={tag} className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded-full uppercase tracking-wide font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div 
                className="text-[17px] font-normal text-slate-900 mb-10 whitespace-pre-wrap leading-relaxed prose prose-slate max-w-none"
                dangerouslySetInnerHTML={{ __html: currentQ.question.questionText }}
              />
            </div>

            <div className="space-y-4 max-w-3xl">
              {currentQ.question.options.map((opt, i) => {
                const isSelected = currentQ.selectedOptionId === opt.id;
                const isStriked = strikethroughOptions[currentQ.id]?.has(opt.id);
                let optionStyle = "border-slate-300 hover:border-blue-500 bg-white";
                let textStyle = "text-slate-800";
                let indicator = null;

                if (session.mode === 'tutor' && currentQ.selectedOptionId) {
                  if (opt.isCorrect) {
                    optionStyle = "border-emerald-500 bg-emerald-50/50";
                    textStyle = "text-emerald-900 font-medium";
                    indicator = <div className="ml-auto w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></div>;
                  } else if (isSelected) {
                    if (currentQ.question.acceptableAnswers?.includes(opt.id)) {
                      optionStyle = "border-yellow-500 bg-yellow-50/50";
                      textStyle = "text-yellow-900 font-medium";
                      indicator = <div className="ml-auto px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500 text-white shadow-sm uppercase tracking-wider">Close</div>;
                    } else {
                      optionStyle = "border-red-500 bg-red-50/50";
                      textStyle = "text-red-900";
                      indicator = <div className="ml-auto w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-sm"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg></div>;
                    }
                  } else {
                    optionStyle = "border-slate-200 opacity-60 bg-slate-50";
                  }
                } else if (isSelected) {
                  optionStyle = "border-blue-600 bg-blue-50";
                  textStyle = "text-blue-900 font-medium";
                } else if (isStriked) {
                  optionStyle = "border-slate-200 bg-slate-50 opacity-60";
                  textStyle = "text-slate-400 line-through";
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleOptionSelect(opt.id)}
                    className={`w-full text-left p-4 rounded-sm border-l-4 transition-all flex items-center shadow-sm group ${optionStyle}`}
                  >
                    <div className="relative mr-4 shrink-0">
                      <span className={`w-7 h-7 rounded-full border flex items-center justify-center font-bold text-sm shadow-inner transition-colors ${isSelected ? 'border-transparent bg-transparent text-blue-600' : 'border-slate-300 text-slate-500 bg-white'}`}>
                        {String.fromCharCode(65 + i)}
                      </span>
                    </div>
                    <span className={`text-[16px] leading-snug flex-1 ${textStyle}`}>{opt.text}</span>
                    
                    {/* Strikethrough Toggle Button */}
                    {!(session.mode === 'tutor' && currentQ.selectedOptionId) && (
                      <div 
                        onClick={(e) => toggleStrikethrough(e, opt.id)}
                        className={`ml-2 p-1.5 rounded text-xs font-medium border transition-opacity ${isStriked ? 'opacity-100 bg-slate-200 border-slate-300 text-slate-600' : 'opacity-0 group-hover:opacity-100 bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                      >
                        S
                      </div>
                    )}
                    {indicator}
                  </button>
                );
              })}
            </div>
            
            {/* Educational Objective / Explanation */}
            {session.mode === 'tutor' && currentQ.selectedOptionId && (
              <div className="mt-12 pt-8 border-t-2 border-slate-200">
                
                {/* TOP MEDIA */}
                {currentQ.question.media && currentQ.question.media.filter(m => m.placement === 'TOP').length > 0 && (
                  <div className="mb-8 flex flex-col gap-6 items-center">
                    {currentQ.question.media.filter(m => m.placement === 'TOP').map(m => (
                      <MediaRenderer key={m.id} media={m} setZoomImage={setZoomImage} />
                    ))}
                  </div>
                )}
                
                <div className="bg-blue-50 border border-blue-200 p-6 rounded-sm mb-6 w-full">
                  <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-3">Educational Objective</h3>
                  <div 
                    className="prose prose-blue prose-sm sm:prose-base max-w-none text-slate-800 leading-relaxed font-medium"
                    dangerouslySetInnerHTML={{ __html: currentQ.question.explanation || '' }}
                  />
                </div>
                
                {/* BOTTOM MEDIA */}
                {currentQ.question.media && currentQ.question.media.filter(m => m.placement === 'BOTTOM').length > 0 && (
                  <div className="mt-8 mb-8 flex flex-col gap-6 items-center">
                    {currentQ.question.media.filter(m => m.placement === 'BOTTOM').map(m => (
                      <MediaRenderer key={m.id} media={m} setZoomImage={setZoomImage} />
                    ))}
                  </div>
                )}
                
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-900 mb-2 border-b pb-2">Choice Details</h4>
                  {currentQ.question.options.map((opt, idx) => (
                    opt.explanation ? (
                      <div key={opt.id} className="text-[15px] p-4 bg-white border border-slate-200 shadow-sm rounded-sm text-slate-700 leading-relaxed">
                        <span className="font-extrabold text-slate-900 mr-2 bg-slate-100 px-2 py-1 rounded text-sm">
                          Choice {String.fromCharCode(65 + idx)}
                        </span>
                        {opt.explanation}
                      </div>
                    ) : null
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <footer className="bg-slate-900 border-t border-slate-700 h-16 shrink-0 flex justify-between items-center px-6 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0 || submitting}
          className="px-6 py-2 bg-slate-800 text-slate-300 font-bold text-sm uppercase tracking-wider rounded-sm hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
          Previous
        </button>
        
        <div className="flex gap-6 items-center">
          {session.mode === 'timed' && (
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-800 px-4 py-2 rounded-sm border border-slate-700">
              Answered: <span className="text-white">{questions.filter(q => q.selectedOptionId).length} / {questions.length}</span>
            </div>
          )}
          <button
            onClick={handleNext}
            disabled={submitting}
            className={`px-8 py-2 font-bold text-sm uppercase tracking-wider rounded-sm transition-colors flex items-center gap-2 ${currentIndex === questions.length - 1 ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
          >
            {currentIndex === questions.length - 1 ? 'End Block' : 'Next'}
            {currentIndex !== questions.length - 1 && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>}
          </button>
        </div>
      </footer>

      {/* Anti-Cheat Overlay */}
      {isObscured && (
        <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md border border-slate-200">
            <svg className="w-16 h-16 text-amber-500 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Focus Lost</h2>
            <p className="text-slate-600 mb-8">Test content is hidden while this window is inactive or when attempting to screenshot/switch tabs. This ensures test integrity.</p>
            <button 
              onClick={() => setIsObscured(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-sm"
            >
              Resume Test
            </button>
          </div>
        </div>
      )}

      {/* Tools */}
      {showCalculator && <Calculator onClose={() => setShowCalculator(false)} />}
      {showLabValues && <LabValuesModal onClose={() => setShowLabValues(false)} />}
      {/* Lightbox for zooming images */}
      <Lightbox
        open={!!zoomImage}
        close={() => setZoomImage(null)}
        slides={zoomImage ? [{ src: zoomImage }] : []}
      />
    </div>
  );
}
