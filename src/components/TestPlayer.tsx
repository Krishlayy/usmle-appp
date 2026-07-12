'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { HelpCircle, TestTubes, FileText, Calculator as CalcIcon, Settings as SettingsIcon, ChevronLeft, ChevronRight, Bookmark } from 'lucide-react';

import { Calculator } from '@/components/Calculator';
import { LabValuesModal } from '@/components/LabValuesModal';
import { MediaRenderer } from '@/components/MediaRenderer';
import { TestSettingsProvider, useTestSettings } from '@/components/TestSettingsProvider';
import { SettingsSidebar } from '@/components/SettingsSidebar';
import { NotesModal } from '@/components/NotesModal';

type Option = {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string | null;
};

type Question = {
  id: string;
  qid: string;
  questionText: string;
  explanation: string | null;
  acceptableAnswers: string[];
  tags: string[];
  media?: { id: string; type: string; url: string; caption?: string | null; displaySize?: string; placement?: string; [key: string]: unknown }[];
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
  notes?: string | null;
};

export interface TestSession {
  id: string;
  qbankSlug?: string;
  mode: 'timed' | 'tutor' | 'review';
  durationSec: number | null;
  questions: SessionQuestion[];
};

// Deterministic mock stats generator based on question ID
const generateMockStats = (questionId: string, options: Option[]) => {
  let hash = 0;
  for (let i = 0; i < questionId.length; i++) {
    hash = questionId.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const correctOptIndex = options.findIndex(o => o.isCorrect);
  let remainingPct = 100;
  const stats: Record<string, number> = {};
  
  // Assign a high percentage (40-80%) to the correct answer
  const correctPct = 40 + (Math.abs(hash) % 41); 
  if (correctOptIndex !== -1) {
    stats[options[correctOptIndex].id] = correctPct;
    remainingPct -= correctPct;
  }
  
  // Distribute remaining evenlyish with some noise
  const incorrectOpts = options.filter(o => !o.isCorrect);
  incorrectOpts.forEach((opt, idx) => {
    if (idx === incorrectOpts.length - 1) {
      stats[opt.id] = remainingPct;
    } else {
      const share = Math.floor(remainingPct / (incorrectOpts.length - idx));
      const noise = (Math.abs(hash + idx) % 10) - 5; // -5 to +5
      let val = Math.max(0, share + noise);
      if (val > remainingPct) val = remainingPct;
      stats[opt.id] = val;
      remainingPct -= val;
    }
  });
  
  return stats;
};

export function TestPlayer({ session }: { session: TestSession }) {
  return (
    <TestSettingsProvider>
      <TestPlayerInner session={session} />
    </TestSettingsProvider>
  );
}

function TestPlayerInner({ session }: { session: TestSession }) {
  const router = useRouter();
  const { settings } = useTestSettings();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questions, setQuestions] = useState<SessionQuestion[]>(session.questions.sort((a, b) => a.order - b.order));
  const [timeLeft, setTimeLeft] = useState<number | null>(session.durationSec);
  
  const initialElapsed = useMemo(() => {
    return session.questions.reduce((acc, q) => acc + (q.timeTakenSec || 0), 0);
  }, [session.questions]);
  const [timeElapsed, setTimeElapsed] = useState(initialElapsed);
  const [submitting, setSubmitting] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [isObscured, setIsObscured] = useState(false);
  
  // Tools state
  const [showCalculator, setShowCalculator] = useState(false);
  const [showLabValues, setShowLabValues] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [omissionWarning, setOmissionWarning] = useState<(() => void) | null>(null);
  
  const [strikethroughOptions, setStrikethroughOptions] = useState<Record<string, Set<string>>>({});
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const currentQ = questions[currentIndex];
  const isTimed = session.mode === 'timed';
  
  const mockStats = useMemo(() => {
    return generateMockStats(currentQ.question.id, currentQ.question.options);
  }, [currentQ.question.id, currentQ.question.options]);

  const finishSession = useCallback(async (finalQuestions: SessionQuestion[]) => {
    setSubmitting(true);
    fetch(`/api/test-sessions/${session.id}/submit`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questions: finalQuestions })
    }).finally(() => {
      setSubmitting(false);
      router.push(`/dashboard/${session.qbankSlug}/session/${session.id}/results`);
      router.refresh();
    });
  }, [session.id, session.qbankSlug, router]);

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
    const elapsedTimer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(elapsedTimer);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsObscured(true);
      }
    };

    const handleBlur = () => {
      if (document.activeElement?.tagName.toLowerCase() === 'iframe') return;
      setIsObscured(true);
    };

    const handleFocus = () => setIsObscured(false);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in inputs/textareas
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (showSettings || omissionWarning || showCalculator) return;
      
      const key = e.key.toLowerCase();
      
      if (key === 'arrowright') {
        handleNext();
      } else if (key === 'arrowleft') {
        handlePrev();
      } else if (key === ' ') {
        e.preventDefault();
        updateCurrentQuestionState({ isFlagged: !currentQ.isFlagged });
      } else if (['a', 'b', 'c', 'd', 'e', 'f', 'g'].includes(key)) {
        const optionIndex = key.charCodeAt(0) - 97;
        const option = currentQ.question.options[optionIndex];
        if (option) {
          handleOptionSelect(option.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, currentQ, questions, showSettings, omissionWarning, showCalculator]);

  const updateCurrentQuestionState = (updates: Partial<SessionQuestion>) => {
    setQuestions(prev => prev.map((q, i) => 
      i === currentIndex ? { ...q, ...updates } : q
    ));
  };

  const handleOptionSelect = (optionId: string) => {
    if (session.mode === 'tutor' && currentQ.selectedOptionId) return;

    const selectedOption = currentQ.question.options.find(o => o.id === optionId);
    const isCorrect = selectedOption?.isCorrect ?? false;
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    
    updateCurrentQuestionState({ 
      selectedOptionId: optionId,
      isCorrect,
      timeTakenSec: currentQ.timeTakenSec + timeSpent
    });

    fetch(`/api/test-sessions/${session.id}/autosave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionProgressId: currentQ.id,
        selectedOptionId: optionId,
        isCorrect,
        timeTakenSec: currentQ.timeTakenSec + timeSpent
      }),
    }).catch(console.error);
  };
  
  const handleSaveNotes = (notes: string) => {
    updateCurrentQuestionState({ notes });
    fetch(`/api/test-sessions/${session.id}/autosave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionProgressId: currentQ.id,
        notes: notes
      }),
    }).catch(console.error);
  };

  const handleNext = () => {
    if (settings.confirmOmission && !currentQ.selectedOptionId) {
      setOmissionWarning(() => () => proceedNext());
      return;
    }
    proceedNext();
  };

  const proceedNext = () => {
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    updateCurrentQuestionState({ timeTakenSec: currentQ.timeTakenSec + timeSpent });
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setQuestionStartTime(Date.now());
    } else {
      finishSession(questions);
    }
  };

  const handleEndBlock = () => {
    if (settings.confirmOmission) {
      const hasUnanswered = questions.some(q => !q.selectedOptionId);
      if (hasUnanswered) {
        setOmissionWarning(() => () => finishSession(questions));
        return;
      }
    }
    finishSession(questions);
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
      updateCurrentQuestionState({ timeTakenSec: currentQ.timeTakenSec + timeSpent });
      setCurrentIndex(prev => prev - 1);
      setQuestionStartTime(Date.now());
    }
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
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getThemeClasses = () => {
    if (settings.colorTheme === 'dark') return 'bg-slate-900 text-slate-200';
    if (settings.colorTheme === 'sepia') return 'bg-[#fdf6e3] text-[#657b83]';
    return 'bg-white text-slate-900';
  };

  return (
    <div className={`flex flex-col h-screen font-sans ${settings.colorTheme === 'dark' ? 'bg-slate-950' : 'bg-slate-100'}`}>
      
      {/* Top Header */}
      <header className="bg-[#003b5c] text-white h-14 flex items-center justify-between px-4 shrink-0 shadow-md z-10 select-none">
        <div className="flex items-center gap-6">
          <div className="flex items-center bg-[#002b44] px-4 py-1.5 rounded text-sm font-bold tracking-wide">
            <span className="text-slate-300 mr-2">Item:</span>
            <span>{currentIndex + 1} of {questions.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePrev} disabled={currentIndex === 0} className="p-1 hover:bg-[#004f7a] rounded disabled:opacity-50">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-slate-300">Previous</span>
            <span className="text-slate-500 mx-2">|</span>
            <span className="text-sm font-medium text-slate-300">Next</span>
            <button onClick={handleNext} className="p-1 hover:bg-[#004f7a] rounded">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button className="flex flex-col items-center justify-center w-14 h-12 hover:bg-[#004f7a] rounded text-slate-300 hover:text-white transition-colors">
            <HelpCircle className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium">Tutorial</span>
          </button>
          <button onClick={() => setShowLabValues(true)} className="flex flex-col items-center justify-center w-16 h-12 hover:bg-[#004f7a] rounded text-slate-300 hover:text-white transition-colors">
            <TestTubes className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium">Lab Values</span>
          </button>
          <button onClick={() => setShowNotes(true)} className="flex flex-col items-center justify-center w-14 h-12 hover:bg-[#004f7a] rounded text-slate-300 hover:text-white transition-colors">
            <FileText className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium">Notes</span>
          </button>
          <button onClick={() => setShowCalculator(true)} className="flex flex-col items-center justify-center w-16 h-12 hover:bg-[#004f7a] rounded text-slate-300 hover:text-white transition-colors">
            <CalcIcon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium">Calculator</span>
          </button>
          <button onClick={() => setShowSettings(true)} className="flex flex-col items-center justify-center w-14 h-12 hover:bg-[#004f7a] rounded text-slate-300 hover:text-white transition-colors ml-4 border-l border-[#004f7a]">
            <SettingsIcon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium">Settings</span>
          </button>
        </div>
      </header>

      {/* Main 3-Pane Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar (Question Grid) */}
        <aside className={`w-16 md:w-48 shrink-0 flex flex-col border-r shadow-sm z-0 overflow-y-auto ${settings.colorTheme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <div className={`p-2 text-xs font-bold uppercase tracking-wider text-center border-b ${settings.colorTheme === 'dark' ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-500'}`}>
            Questions
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {questions.map((q, idx) => {
              const isActive = idx === currentIndex;
              const isAnswered = !!q.selectedOptionId;
              let bg = '';
              let text = '';
              if (isActive) {
                bg = 'bg-blue-600'; text = 'text-white font-bold';
              } else if (isAnswered) {
                bg = settings.colorTheme === 'dark' ? 'bg-slate-800' : 'bg-slate-200';
                text = settings.colorTheme === 'dark' ? 'text-slate-300' : 'text-slate-700';
              } else {
                bg = 'transparent';
                text = settings.colorTheme === 'dark' ? 'text-slate-400' : 'text-slate-600';
              }
              
              return (
                <button
                  key={q.id}
                  onClick={() => {
                    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
                    updateCurrentQuestionState({ timeTakenSec: currentQ.timeTakenSec + timeSpent });
                    setCurrentIndex(idx);
                    setQuestionStartTime(Date.now());
                  }}
                  className={`w-full flex items-center p-1.5 rounded text-sm transition-colors ${bg} ${text} hover:opacity-80`}
                >
                  <div className="w-6 text-center shrink-0 font-medium">{idx + 1}</div>
                  <div className="flex-1 flex justify-center gap-1 hidden md:flex">
                    {q.isFlagged && <Bookmark className="w-3.5 h-3.5 text-red-500" fill="currentColor" />}
                    {isAnswered && !q.isFlagged && <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1"></div>}
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Center Content Area */}
        <main className={`flex-1 flex flex-col p-4 md:p-8 ${getThemeClasses()} ${settings.splitScreen ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          <div className={`max-w-4xl mx-auto w-full flex flex-col ${settings.splitScreen && (session.mode === 'tutor' || session.mode === 'review') && currentQ.selectedOptionId ? 'md:max-w-none md:grid md:grid-cols-2 md:gap-8 h-full' : ''}`} style={{ fontSize: `${settings.fontSize}px` }}>
            
            <div className={`flex flex-col ${settings.splitScreen && (session.mode === 'tutor' || session.mode === 'review') && currentQ.selectedOptionId ? 'col-span-1 overflow-y-auto pr-4' : ''}`}>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200/20">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={currentQ.isFlagged}
                    onChange={() => updateCurrentQuestionState({ isFlagged: !currentQ.isFlagged })}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className={`font-semibold text-sm ${currentQ.isFlagged ? 'text-red-600' : 'group-hover:text-blue-600 text-slate-500'}`}>
                    Mark Question
                  </span>
                </label>
                
                <span className="text-sm font-mono text-slate-400 ml-auto">Question Id: {currentQ.question.qid}</span>
              </div>

            {/* TOP MEDIA */}
            {currentQ.question.media && currentQ.question.media.filter(m => m.placement === 'TOP').length > 0 && (
              <div className="mb-6 flex flex-col gap-4 items-center">
                {currentQ.question.media.filter(m => m.placement === 'TOP').map(m => (
                  <MediaRenderer key={m.id} media={m} setZoomImage={setZoomImage} />
                ))}
              </div>
            )}

            <div 
              className="leading-relaxed mb-8 font-medium"
              dangerouslySetInnerHTML={{ __html: currentQ.question.questionText }}
            />

            <div className="space-y-1 mb-8 max-w-2xl border-l-2 border-slate-300 pl-4 py-2">
              {currentQ.question.options.map((opt, i) => {
                const isSelected = currentQ.selectedOptionId === opt.id;
                const isStriked = settings.showStrikeout && strikethroughOptions[currentQ.id]?.has(opt.id);
                
                let optionClasses = "flex items-start group w-full text-left rounded px-2 py-1.5 transition-colors ";
                if (isSelected) {
                  optionClasses += "bg-blue-500/10 text-blue-700";
                } else if (isStriked) {
                  optionClasses += "opacity-50 line-through text-slate-500";
                } else {
                  optionClasses += "hover:bg-slate-500/5";
                }

                const showTutorFeedback = (session.mode === 'tutor' && currentQ.selectedOptionId) || session.mode === 'review';

                return (
                  <div key={opt.id} className="flex items-center w-full relative">
                    <button
                      onClick={() => handleOptionSelect(opt.id)}
                      className={optionClasses}
                      disabled={showTutorFeedback ? true : false}
                    >
                      <div className="mt-1 mr-3 shrink-0 flex items-center justify-center w-5 h-5">
                        {showTutorFeedback && opt.isCorrect ? (
                          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                        ) : showTutorFeedback && isSelected && !opt.isCorrect ? (
                          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                        ) : (
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-blue-600' : 'border-slate-400'}`}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-blue-600"></div>}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 flex gap-2">
                        <span className="font-bold">{String.fromCharCode(65 + i)}.</span>
                        <span>{opt.text}</span>
                        {/* Mocked Statistics */}
                        {showTutorFeedback && !settings.hidePercentage && (
                          <span className="text-slate-500 font-medium ml-1">({mockStats[opt.id] || 0}%)</span>
                        )}
                      </div>
                    </button>

                    {/* Strikeout Tool */}
                    {!showTutorFeedback && settings.showStrikeout && (
                      <button 
                        onClick={(e) => toggleStrikethrough(e, opt.id)}
                        className={`ml-4 px-2 py-0.5 rounded border text-xs font-bold transition-opacity flex items-center justify-center shrink-0 ${isStriked ? 'opacity-100 bg-slate-300 border-slate-400 text-slate-700 line-through' : 'opacity-0 group-hover:opacity-100 bg-white border-slate-300 text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                        title="Strikeout"
                      >
                        <span className="line-through">ab</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

            {/* Post-submission Explanation Area */}
            {((session.mode === 'tutor' && currentQ.selectedOptionId) || session.mode === 'review') && (
              <div className={`mt-8 pt-8 ${settings.splitScreen ? 'col-span-1 mt-0 pt-0 md:border-l md:border-slate-200 md:pl-8 overflow-y-auto pb-8' : 'border-t border-slate-200/50 pb-8'}`}>
                
                {/* Stats Bar */}
                <div className="flex items-center gap-6 mb-8 bg-slate-50 border border-slate-200 p-4 rounded-md shadow-sm">
                  <div className="flex flex-col min-w-[120px]">
                    <span className={`text-[15px] font-bold ${currentQ.isCorrect ? 'text-emerald-600' : 'text-[#c62828]'}`}>
                      {currentQ.isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                    <span className="text-[13px] text-slate-600 mt-1">
                      Correct answer: {String.fromCharCode(65 + currentQ.question.options.findIndex(o => o.isCorrect))}
                    </span>
                  </div>
                  
                  <div className="w-px h-10 bg-slate-200"></div>
                  
                  {!settings.hidePercentage && (
                    <div className="flex items-center gap-4 flex-1">
                      <svg className="w-6 h-6 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                      <div className="flex flex-col">
                        <span className="text-[15px] font-bold text-slate-800">{mockStats[currentQ.question.options.find(o => o.isCorrect)?.id || '']} %</span>
                        <span className="text-[13px] text-slate-600">Answered correctly</span>
                      </div>
                    </div>
                  )}

                  <div className="w-px h-10 bg-slate-200"></div>
                  
                  <div className="flex items-center gap-4 flex-1">
                    <svg className="w-6 h-6 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <div className="flex flex-col">
                      <span className="text-[15px] font-bold text-slate-800">{formatTime(currentQ.timeTakenSec)}</span>
                      <span className="text-[13px] text-slate-600">Time Spent</span>
                    </div>
                  </div>
                </div>

                <div className="mb-6 border border-slate-300 bg-white rounded shadow-sm text-[15px] text-slate-800">
                  <div className="px-4 py-2 border-b border-slate-200 bg-slate-50 font-bold text-slate-700">
                    Explanation
                  </div>
                  <div className="p-6">
                    <div 
                      className="prose max-w-none text-slate-800 leading-relaxed font-medium"
                      dangerouslySetInnerHTML={{ __html: currentQ.question.explanation || '' }}
                    />
                    
                    {/* Render Option Explanations */}
                    <div className="mt-8 space-y-4">
                      {currentQ.question.options.map((opt, idx) => {
                        if (!opt.explanation || opt.explanation.trim() === '') return null;
                        const letter = String.fromCharCode(65 + idx);
                        const isCorrectOpt = opt.isCorrect;
                        return (
                          <div key={opt.id} className={`p-4 rounded-md border ${isCorrectOpt ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                            <div className={`font-bold mb-1 ${isCorrectOpt ? 'text-emerald-800' : 'text-red-800'}`}>
                              Option {letter} {isCorrectOpt ? '(Correct)' : '(Incorrect)'}
                            </div>
                            <div 
                              className="prose max-w-none text-sm text-slate-700" 
                              dangerouslySetInnerHTML={{ __html: opt.explanation }}
                            />
                          </div>
                        );
                      })}
                    </div>
                    
                  </div>
                </div>

                {/* BOTTOM MEDIA */}
                {currentQ.question.media && currentQ.question.media.filter(m => m.placement === 'BOTTOM').length > 0 && (
                  <div className="mb-6 flex flex-col gap-4 items-center">
                    {currentQ.question.media.filter(m => m.placement === 'BOTTOM').map(m => (
                      <MediaRenderer key={m.id} media={m} setZoomImage={setZoomImage} />
                    ))}
                  </div>
                )}
              </div>
            )}
            
            <div className="h-32"></div> {/* Bottom padding */}
          </div>
        </main>
      </div>

      {/* Footer Navigation bar */}
      <footer className="bg-[#003b5c] h-12 shrink-0 flex justify-between items-center px-4 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.2)] select-none border-t border-[#002b44]">
        <div className="flex items-center h-full">
           {(session.mode === 'timed' || (session.mode === 'tutor' && settings.showTimer)) && (
             <div className="flex flex-col justify-center px-4 border-r border-[#004f7a] h-full text-white font-bold text-xs">
               <span className="text-slate-400 text-[10px] uppercase tracking-wider">
                 {session.mode === 'timed' ? 'Block Time Remaining' : 'Block Time Elapsed'}
               </span>
               {session.mode === 'timed' 
                 ? (timeLeft !== null ? formatTime(timeLeft) : '--:--:--') 
                 : formatTime(timeElapsed)}
             </div>
           )}
        </div>

        <div className="flex gap-2">
          {session.mode === 'timed' && (
             <button
             onClick={() => finishSession(questions)}
             disabled={submitting}
             className="px-6 h-8 text-xs font-bold text-white bg-[#c62828] hover:bg-red-700 rounded transition-colors mr-4 flex items-center"
           >
             Suspend Block
           </button>
          )}
          {session.mode === 'review' && (
             <button
             onClick={() => window.location.href = `/dashboard/${session.qbankSlug}/session/${session.id}/results`}
             className="px-6 h-8 text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 rounded transition-colors mr-4 flex items-center"
           >
             Back to Results
           </button>
          )}
          <button
            onClick={currentIndex === questions.length - 1 ? handleEndBlock : handleNext}
            disabled={submitting}
            className={`px-8 h-8 text-xs font-bold text-white rounded transition-colors flex items-center ${currentIndex === questions.length - 1 ? 'bg-[#003b5c] border border-white hover:bg-[#004f7a]' : 'bg-[#003b5c] border border-white hover:bg-[#004f7a]'}`}
          >
            {currentIndex === questions.length - 1 ? 'End Block' : 'Next'}
          </button>
        </div>
      </footer>

      {/* Omission Warning Modal */}
      {omissionWarning && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-[#003b5c] text-white font-bold p-3 px-4 flex justify-between items-center">
              <span>Warning</span>
              <button onClick={() => setOmissionWarning(null)} className="text-white hover:text-slate-200"><HelpCircle className="w-4 h-4" /></button>
            </div>
            <div className="p-6 text-center text-slate-800 text-[15px] font-medium">
              You have not answered all questions in this block. Are you sure you want to proceed?
            </div>
            <div className="bg-slate-100 p-3 flex justify-end gap-3 border-t border-slate-200">
              <button onClick={() => setOmissionWarning(null)} className="px-5 py-1.5 font-bold text-slate-700 bg-white border border-slate-300 rounded shadow-sm hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={() => { omissionWarning(); setOmissionWarning(null); }} className="px-5 py-1.5 font-bold text-white bg-blue-600 rounded shadow-sm hover:bg-blue-700">
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Anti-Cheat Overlay */}
      {isObscured && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md border border-slate-200">
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

      {/* Modals & Overlays */}
      {showCalculator && <Calculator onClose={() => setShowCalculator(false)} />}
      {showLabValues && <LabValuesModal onClose={() => setShowLabValues(false)} />}
      {showSettings && <SettingsSidebar onClose={() => setShowSettings(false)} />}
      {showNotes && <NotesModal initialNotes={currentQ.notes || ''} onClose={() => setShowNotes(false)} onSave={handleSaveNotes} />}
      <Lightbox
        open={!!zoomImage}
        close={() => setZoomImage(null)}
        slides={zoomImage ? [{ src: zoomImage }] : []}
      />
    </div>
  );
}
