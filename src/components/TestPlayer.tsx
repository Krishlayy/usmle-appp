'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useVirtualizer } from '@tanstack/react-virtual';
import dynamic from 'next/dynamic';
import { HelpCircle, TestTubes, FileText, Calculator as CalcIcon, Settings as SettingsIcon, ChevronLeft, ChevronRight, Bookmark, X, Clock, FlaskConical, PenLine, ArrowLeftCircle, ArrowRightCircle, Lock, XCircle, Flag, Strikethrough, AlertTriangle } from 'lucide-react';
import { MediaRenderer } from '@/components/MediaRenderer';
import { QuestionNotesModal } from './QuestionNotesModal';
import { TestSettingsProvider, useTestSettings, TestSettings } from '@/components/TestSettingsProvider';
import { Button } from '@/components/ui/Button';
import { TestSecurityWarning } from '@/components/TestSecurityWarning';
import { SettingsDropdown } from './SettingsDropdown';
import { ExhibitDisplay } from './ExhibitDisplay';
import { TestTutorial } from './TestTutorial';

const SmartContextMenu = ({ 
  top, left, onHighlight, onNote, onFlashcard, onClose, settings 
}: { 
  top: number, left: number, onHighlight: (color: string) => void, onNote: () => void, onFlashcard: () => void, onClose: () => void, settings: TestSettings 
}) => {
  const colors = [
    { id: 'yellow', hex: '#ffeb3b' },
    { id: 'pink', hex: '#f48fb1' },
    { id: 'orange', hex: '#ffb74d' },
    { id: 'blue', hex: '#81d4fa' },
    { id: 'green', hex: '#a5d6a7' }
  ];
  
  const displayColors = settings.multicolorHighlighting 
    ? colors 
    : colors.filter(c => c.id === (settings.defaultHighlighter || 'yellow'));

  return (
    <div 
      className="fixed z-[100] flex items-center gap-2 px-3 py-2 bg-white shadow-xl rounded-lg border border-gray-200 -translate-x-1/2 -translate-y-[calc(100%+10px)]"
      style={{ top, left }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className="flex gap-1.5 border-r border-gray-200 pr-2">
        {displayColors.map(c => (
          <button
            key={c.id}
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onHighlight(c.hex); onClose(); }}
            className="w-5 h-5 rounded-full border border-gray-300 hover:scale-110 transition-transform"
            style={{ backgroundColor: c.hex }}
          />
        ))}
      </div>
      <button onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onHighlight('transparent'); onClose(); }} className="p-1 hover:bg-gray-100 rounded text-gray-500" title="Remove Highlight">
        <X className="w-4 h-4" />
      </button>
      <div className="w-px h-4 bg-gray-200 mx-1"></div>
      <button onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onNote(); onClose(); }} className="p-1 hover:bg-gray-100 rounded text-gray-500" title="Add to Notebook">
        <FileText className="w-4 h-4" />
      </button>
      <button onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onFlashcard(); onClose(); }} className="p-1 hover:bg-gray-100 rounded text-gray-500" title="Create Flashcard">
        <Bookmark className="w-4 h-4" />
      </button>
    </div>
  );
};

const LightboxWrapper = dynamic(() => import('@/components/LightboxWrapper'), { ssr: false });
const Calculator = dynamic(() => import('@/components/Calculator').then(mod => mod.Calculator), { ssr: false });
const LabValuesModal = dynamic(() => import('@/components/LabValuesModal').then(mod => mod.LabValuesModal), { ssr: false });
const SettingsSidebar = dynamic(() => import('@/components/SettingsSidebar').then(mod => mod.SettingsSidebar), { ssr: false });
const FlashcardModal = dynamic(() => import('@/components/FlashcardModal').then(mod => mod.FlashcardModal), { ssr: false });

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
  strikethroughs?: string[];
  highlightedQuestionText?: string;
  highlightedExplanation?: string;
};

export interface TestSession {
  id: string;
  qbankSlug?: string;
  mode: 'timed' | 'tutor' | 'review';
  durationSec: number | null;
  questions: SessionQuestion[];
};

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

function TimerDisplay({ 
  initialTimeLeft, 
  initialElapsed, 
  isTimed, 
  onTimeUp,
  type = 'combined',
  className = ''
}: { 
  initialTimeLeft: number | null, 
  initialElapsed: number, 
  isTimed: boolean, 
  onTimeUp: () => void,
  type?: 'elapsed' | 'remaining' | 'combined',
  className?: string
}) {
  const [timeLeft, setTimeLeft] = useState(initialTimeLeft);
  const [timeElapsed, setTimeElapsed] = useState(initialElapsed);

  useEffect(() => {
    if (!isTimed || timeLeft === null) return;
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isTimed, timeLeft, onTimeUp]);

  useEffect(() => {
    const elapsedTimer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(elapsedTimer);
  }, []);

  if (type === 'elapsed') {
    return <span className={className}>{formatTime(timeElapsed)}</span>;
  }
  if (type === 'remaining') {
    return <span className={className}>{timeLeft !== null ? formatTime(timeLeft) : '--:--:--'}</span>;
  }

  let colorClass = "text-primary";
  if (isTimed && timeLeft !== null) {
    if (timeLeft < 60) colorClass = "text-red-600";
    else if (timeLeft < 300) colorClass = "text-amber-600";
  }

  return (
    <div className={`font-mono font-bold tracking-wider transition-colors duration-500 ${colorClass} ${className}`}>
      {isTimed ? (timeLeft !== null ? formatTime(timeLeft) : '--:--:--') : formatTime(timeElapsed)}
    </div>
  );
}

export function TestPlayer({ session, initialIndex, userEmail = '', userIp = '' }: { session: TestSession, initialIndex?: number, userEmail?: string, userIp?: string }) {
  return (
    <TestSettingsProvider>
      <TestPlayerInner session={session} initialIndex={initialIndex} userEmail={userEmail} userIp={userIp} />
    </TestSettingsProvider>
  );
}

function TestPlayerInner({ session, initialIndex = 0, userEmail = '', userIp = '' }: { session: TestSession, initialIndex?: number, userEmail?: string, userIp?: string }) {
  const router = useRouter();
  const { settings } = useTestSettings();
  
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState('TYPO');
  const [reportDescription, setReportDescription] = useState('');
  const [reportStatus, setReportStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [questions, setQuestions] = useState<SessionQuestion[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const localState = localStorage.getItem(`test-session-state-${session.id}`);
        if (localState) {
          const parsed = JSON.parse(localState);
          const localAnswered = parsed.filter((q: any) => q.selectedOptionId).length;
          const serverAnswered = session.questions.filter((q: any) => q.selectedOptionId).length;
          if (localAnswered > serverAnswered) {
            const merged = session.questions.map(sq => {
              const localQ = parsed.find((pq: any) => pq.id === sq.id);
              if (localQ) {
                return { ...sq, ...localQ, question: sq.question };
              }
              return sq;
            });
            return merged.sort((a, b) => a.order - b.order);
          }
        }
      }
    } catch (e) {
      console.error('Failed to load local state', e);
    }
    return session.questions.sort((a, b) => a.order - b.order);
  });
  
  useEffect(() => {
    try {
      const stateToSave = questions.map(q => ({
        id: q.id,
        isFlagged: q.isFlagged,
        selectedOptionId: q.selectedOptionId,
        isCorrect: q.isCorrect,
        timeTakenSec: q.timeTakenSec,
        notes: q.notes,
        strikethroughs: q.strikethroughs,
        highlightedQuestionText: q.highlightedQuestionText,
        highlightedExplanation: q.highlightedExplanation
      }));
      localStorage.setItem(`test-session-state-${session.id}`, JSON.stringify(stateToSave));
    } catch (e: any) {
      console.error('Failed to save to localStorage:', e);
      if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
        try {
          const keysToRemove: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('test-session-state-') && key !== `test-session-state-${session.id}`) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(k => localStorage.removeItem(k));
          const stateToSave = questions.map(q => ({
            id: q.id,
            isFlagged: q.isFlagged,
            selectedOptionId: q.selectedOptionId,
            isCorrect: q.isCorrect,
            timeTakenSec: q.timeTakenSec,
            notes: q.notes,
            strikethroughs: q.strikethroughs
          }));
          localStorage.setItem(`test-session-state-${session.id}`, JSON.stringify(stateToSave));
        } catch (retryErr) {
          console.error('Still failed to save after clearing old sessions', retryErr);
        }
      }
    }
  }, [questions, session.id]);
  
  const pushToSyncQueue = useCallback((payload: any) => {
    try {
      const queue = JSON.parse(localStorage.getItem(`sync-queue-${session.id}`) || '[]');
      queue.push(payload);
      localStorage.setItem(`sync-queue-${session.id}`, JSON.stringify(queue));
    } catch (e) {
      console.error('Local storage error', e);
    }
  }, [session.id]);

  const flushSyncQueue = useCallback(async () => {
    try {
      const queue = JSON.parse(localStorage.getItem(`sync-queue-${session.id}`) || '[]');
      if (queue.length === 0) return;

      const successfulIndexes: number[] = [];
      for (let i = 0; i < queue.length; i++) {
        try {
          const res = await fetch(`/api/test-sessions/${session.id}/autosave`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(queue[i]),
          });
          if (res.ok) successfulIndexes.push(i);
        } catch (err) {
          console.error('Network error while flushing', err);
          break;
        }
      }

      if (successfulIndexes.length > 0) {
        const remaining = queue.filter((_: any, idx: number) => !successfulIndexes.includes(idx));
        if (remaining.length === 0) {
          localStorage.removeItem(`sync-queue-${session.id}`);
        } else {
          localStorage.setItem(`sync-queue-${session.id}`, JSON.stringify(remaining));
        }
      }
    } catch (e) {
      console.error('Queue flush error', e);
    }
  }, [session.id]);

  useEffect(() => {
    flushSyncQueue();
    window.addEventListener('online', flushSyncQueue);
    return () => window.removeEventListener('online', flushSyncQueue);
  }, [flushSyncQueue]);

  const initialElapsed = useMemo(() => {
    return questions.reduce((acc, q) => acc + (q.timeTakenSec || 0), 0);
  }, [questions]);

  const [submitting, setSubmitting] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [isObscured, setIsObscured] = useState(false);
  
  const [showCalculator, setShowCalculator] = useState(false);
  const [showLabValues, setShowLabValues] = useState(false);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<HTMLElement | null>(null);
  const [showNotes, setShowNotes] = useState(false);
  const [showFlashcardModal, setShowFlashcardModal] = useState(false);
  const [flashcardPrefillText, setFlashcardPrefillText] = useState('');
  const [omissionWarning, setOmissionWarning] = useState<(() => void) | null>(null);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [notebookAppendText, setNotebookAppendText] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  
  useEffect(() => {
    // Only show tutorial once per browser session or permanently, let's say once per test session init if not seen
    if (!localStorage.getItem('tutorial-seen-' + session.id)) {
      setShowTutorial(true);
    }
  }, [session.id]);
  
  const [showSecurityWarning, setShowSecurityWarning] = useState(session.mode !== 'review');



  const [contextMenu, setContextMenu] = useState<{
    top: number;
    left: number;
    show: boolean;
    targetField: 'question' | 'explanation' | null;
  }>({ top: 0, left: 0, show: false, targetField: null });
  
  const questionContentRef = useRef<HTMLDivElement>(null);
  const explanationContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || selection.toString().trim() === '') {
        setContextMenu(prev => ({ ...prev, show: false }));
        return;
      }
      
      const range = selection.getRangeAt(0);
      const qContains = questionContentRef.current?.contains(range.commonAncestorContainer);
      const eContains = explanationContentRef.current?.contains(range.commonAncestorContainer);
      
      if (!qContains && !eContains) {
        setContextMenu(prev => ({ ...prev, show: false }));
        return;
      }

      if (!settings.smartContextMenu) {
        // Auto-highlight with default color if smart menu is disabled
        const colorMap: Record<string, string> = {
          'yellow': '#ffeb3b', 'pink': '#f48fb1', 'orange': '#ffb74d', 'blue': '#81d4fa', 'green': '#a5d6a7'
        };
        const hex = colorMap[settings.defaultHighlighter || 'yellow'] || '#ffeb3b';
        
        const targetRef = qContains ? questionContentRef : explanationContentRef;
        if (targetRef.current) {
          targetRef.current.contentEditable = 'true';
          document.execCommand('styleWithCSS', false, 'true');
          document.execCommand('backColor', false, hex);
          targetRef.current.contentEditable = 'false';
          const newHtml = targetRef.current.innerHTML;
          updateCurrentQuestionState(qContains ? { highlightedQuestionText: newHtml } : { highlightedExplanation: newHtml });
          window.getSelection()?.removeAllRanges();
        }
        return;
      }

      const rect = range.getBoundingClientRect();
      setContextMenu({
        show: true,
        top: rect.top, 
        left: rect.left + rect.width / 2,
        targetField: qContains ? 'question' : 'explanation',
      });
    };

    document.addEventListener('mouseup', handleSelection);
    const hideMenu = () => setContextMenu(prev => ({ ...prev, show: false }));
    window.addEventListener('scroll', hideMenu, true);
    window.addEventListener('resize', hideMenu);
    
    return () => {
      document.removeEventListener('mouseup', handleSelection);
      window.removeEventListener('scroll', hideMenu, true);
      window.removeEventListener('resize', hideMenu);
    };
  }, [settings.smartContextMenu]);

  const currentQ = questions[currentIndex];

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
  
  const questionsRef = useRef(questions);
  useEffect(() => { questionsRef.current = questions; }, [questions]);

  const handleTimeUp = useCallback(() => {
    finishSession(questionsRef.current);
  }, [finishSession]);

  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: questions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 10,
  });

  useEffect(() => {
    const handleVisibilityChange = () => document.hidden && setIsObscured(true);
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (!!settingsAnchorEl || omissionWarning || showCalculator) return;
      
      const key = e.key.toLowerCase();
      if (key === 'arrowright') handleNext();
      else if (key === 'arrowleft') handlePrev();
      else if (key === ' ') {
        e.preventDefault();
        updateCurrentQuestionState({ isFlagged: !currentQ.isFlagged });
      } else if (['a', 'b', 'c', 'd', 'e', 'f', 'g'].includes(key)) {
        const optionIndex = key.charCodeAt(0) - 97;
        const option = currentQ.question.options[optionIndex];
        if (option) handleOptionSelect(option.id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, currentQ, questions, !!settingsAnchorEl, omissionWarning, showCalculator]);

  const updateCurrentQuestionState = (updates: Partial<SessionQuestion>) => {
    setQuestions(prev => prev.map((q, i) => i === currentIndex ? { ...q, ...updates } : q));
  };

  const handleOptionSelect = (optionId: string) => {
    if (session.mode === 'tutor' && currentQ.selectedOptionId) return;
    if (session.mode === 'review') return;

    const selectedOption = currentQ.question.options.find(o => o.id === optionId);
    const isCorrect = selectedOption?.isCorrect ?? false;
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    
    updateCurrentQuestionState({ 
      selectedOptionId: optionId,
      isCorrect,
      timeTakenSec: currentQ.timeTakenSec + timeSpent
    });

    const payload = {
      questionProgressId: currentQ.id,
      selectedOptionId: optionId,
      isCorrect,
      timeTakenSec: currentQ.timeTakenSec + timeSpent
    };

    fetch(`/api/test-sessions/${session.id}/autosave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch((err) => {
      console.error('Save failed', err);
      pushToSyncQueue(payload);
    });
  };
  
  const handleSaveNotes = (notes: string) => {
    updateCurrentQuestionState({ notes });
    const payload = { questionProgressId: currentQ.id, notes };
    fetch(`/api/test-sessions/${session.id}/autosave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch((err) => {
      console.error('Save failed', err);
      pushToSyncQueue(payload);
    });
  };

  const navigateToIndex = (idx: number) => {
    if(idx >= 0 && idx < questions.length) setCurrentIndex(idx);
  };

  const handleNext = () => {
    if (settings.confirmOmission && !currentQ.selectedOptionId && session.mode !== 'review') {
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
      handleEndBlock();
    }
  };

  const handleEndBlock = async () => {
    if (session.mode === 'review') {
      router.push(`/dashboard/${session.qbankSlug}/session/${session.id}/results`);
      return;
    }
    
    const confirmed = window.confirm("You are about to end this block. You will not be able to return to it. Do you want to proceed?");
    if (!confirmed) return;
    
    if (settings.confirmOmission) {
      const hasUnanswered = questions.some(q => !q.selectedOptionId);
      if (hasUnanswered) {
        setOmissionWarning(() => () => finishSession(questions));
        return;
      }
    }
    finishSession(questions);
  };

  const handleSuspend = async () => {
    const confirmed = window.confirm("You are about to suspend this block. The timer will pause and you will be returned to the dashboard. Do you want to proceed?");
    if (!confirmed) return;
    
    router.push(`/dashboard/${session.qbankSlug}`);
  };

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
    if (session.mode === 'review') return;
    
    const currentStrikes = currentQ.strikethroughs || [];
    const newStrikes = currentStrikes.includes(optionId) 
      ? currentStrikes.filter(id => id !== optionId)
      : [...currentStrikes, optionId];
      
    updateCurrentQuestionState({ strikethroughs: newStrikes });

    const payload = { questionProgressId: currentQ.id, strikethroughs: newStrikes };
    fetch(`/api/test-sessions/${session.id}/autosave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch((err) => pushToSyncQueue(payload));
  };

  const applyHighlight = (color: string) => {
    if (!contextMenu.targetField) return;
    const ref = contextMenu.targetField === 'question' ? questionContentRef : explanationContentRef;
    if (!ref.current) return;
    
    ref.current.contentEditable = 'true';
    document.execCommand('styleWithCSS', false, 'true');
    document.execCommand('backColor', false, color === 'transparent' ? 'rgba(0,0,0,0)' : color);
    ref.current.contentEditable = 'false';
    
    const newHtml = ref.current.innerHTML;
    const updates = contextMenu.targetField === 'question' 
      ? { highlightedQuestionText: newHtml }
      : { highlightedExplanation: newHtml };
      
    updateCurrentQuestionState(updates);
    setContextMenu(prev => ({ ...prev, show: false }));
    window.getSelection()?.removeAllRanges();
  };

  const handleAddToNotebook = () => {
    const text = window.getSelection()?.toString() || '';
    if (text) {
      const newNotes = (currentQ.notes || '') + (currentQ.notes ? '\n\n' : '') + text;
      handleSaveNotes(newNotes);
      setShowNotes(true);
    }
    setContextMenu(prev => ({ ...prev, show: false }));
  };

  const handleAddToFlashcard = () => {
    const text = window.getSelection()?.toString() || '';
    if (text) {
      setFlashcardPrefillText(text);
      setShowFlashcardModal(true);
    }
    setContextMenu(prev => ({ ...prev, show: false }));
  };


  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent | TouchEvent) => {
      let target = e.target as HTMLElement;
      
      if (!target) return;
      if (target.nodeType === 3) {
        target = target.parentElement as HTMLElement;
      }
      if (!target) return;

      // Ignore clicks inside ExhibitDisplay
      if (target.closest('#exhibit-display-root')) return;

      // Check if they clicked a media sidebar item with exhibit-trigger
      const trigger = target.closest('.exhibit-trigger') as HTMLElement;
      if (trigger && trigger.dataset.url) {
        e.preventDefault();
        e.stopPropagation();
        setZoomImage(trigger.dataset.url);
        return;
      }

      // Only intercept if clicked inside the rich text areas (question or explanation)
      // MediaRenderer handles its own clicks.
      if (!target.closest('.vignette-text') && !target.closest('.leading-relaxed')) {
        return;
      }

      let imgElement: HTMLImageElement | null = null;
      let tableElement: HTMLTableElement | null = null;
      
      if (target.tagName && target.tagName.toLowerCase() === 'img') {
        imgElement = target as HTMLImageElement;
      } else if (typeof target.closest === 'function') {
        const closestImg = target.closest('img');
        if (closestImg) imgElement = closestImg as HTMLImageElement;
      }

      if (target.tagName && target.tagName.toLowerCase() === 'table') {
        tableElement = target as HTMLTableElement;
      } else if (typeof target.closest === 'function') {
        const closestTable = target.closest('table') || target.closest('.table');
        if (closestTable) tableElement = closestTable as HTMLTableElement;
      }
      
      if (imgElement && imgElement.src) {
        console.log("EXHIBIT CLICK DETECTED (IMAGE):", imgElement.src);
        e.preventDefault();
        e.stopPropagation();
        setZoomImage(imgElement.src);
      } else if (tableElement) {
        console.log("EXHIBIT CLICK DETECTED (TABLE):", tableElement);
        e.preventDefault();
        e.stopPropagation();
        setZoomImage(tableElement.outerHTML);
      }
    };

    document.addEventListener('click', handleGlobalClick, { capture: true });
    document.addEventListener('contextmenu', handleGlobalClick, { capture: true });
    
    return () => {
      document.removeEventListener('click', handleGlobalClick, { capture: true });
      document.removeEventListener('contextmenu', handleGlobalClick, { capture: true });
    };
  }, []);

  if (showSecurityWarning && session.mode !== 'review') {
    return <TestSecurityWarning onAccept={() => setShowSecurityWarning(false)} userEmail={userEmail} userIp={userIp} />;
  }

  const isDark = settings.colorTheme === 'dark';
  
  // Theme variables based on exact screenshots
  const mainBg = isDark ? 'bg-slate-950' : 'bg-white';
  const mainText = isDark ? 'text-slate-200' : 'text-slate-900';
  const headerFooterBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const headerFooterText = isDark ? 'text-slate-300' : 'text-slate-700';
  const sidebarBg = isDark ? 'bg-slate-900' : 'bg-slate-50';
  const sidebarItemBg = isDark ? 'bg-transparent text-slate-400' : 'bg-transparent text-slate-500';
  const sidebarActiveBg = isDark ? 'bg-slate-800 text-slate-100 shadow-sm rounded-md mx-1' : 'bg-white text-slate-900 shadow-sm border border-slate-200 rounded-md mx-1';
  const borderCol = isDark ? 'border-slate-800' : 'border-slate-200';

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReportStatus('submitting');
    try {
      const res = await fetch(`/api/test-sessions/${session.id}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQ.question.id,
          issueType: reportType,
          description: reportDescription,
        }),
      });
      if (!res.ok) throw new Error('Failed to submit report');
      setReportStatus('success');
      setTimeout(() => {
        setShowReportModal(false);
        setReportStatus('idle');
        setReportDescription('');
      }, 2000);
    } catch (err) {
      console.error(err);
      setReportStatus('error');
    }
  };

  return (
    <div className={`flex flex-col h-screen overflow-hidden font-sans ${mainBg} ${mainText}`} style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      
      {/* Top Section (Sidebar + Header + Main Content) */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar */}
        <aside className={`w-[110px] flex flex-col shrink-0 overflow-hidden border-r ${borderCol} ${sidebarBg}`}>
          <div className={`h-[45px] flex items-center justify-center text-center leading-tight font-bold text-[11px] ${isDark ? 'bg-black border-[#00e5ff] text-[#00e5ff]' : 'bg-white border-black text-black'} border-b`}>
            Question<br/>Status
          </div>
          <div className="flex-1 overflow-y-auto bg-white">
            {session.questions.map((q, idx) => {
              const isActive = idx === currentIndex;
              const isAnswered = !!q.selectedOptionId;
              const isFlagged = q.isFlagged;
              
              let itemClass = isActive ? sidebarActiveBg : sidebarItemBg;
              
              return (
                <div 
                  key={q.id}
                  onClick={() => navigateToIndex(idx)}
                  className={`flex items-center pl-2 py-1.5 my-0.5 border-b border-transparent text-[12px] font-bold cursor-pointer transition-colors ${itemClass} hover:bg-slate-100`}
                >
                  <div className="w-[14px] flex justify-center mr-1">
                    {isFlagged ? (
                      <Flag size={10} className="fill-red-500 text-red-500" />
                    ) : isAnswered ? (
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                    ) : (
                      <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                    )}
                  </div>
                  {idx + 1}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Right Section */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Top Header */}
          <header className={`h-[56px] flex items-center justify-between px-4 shrink-0 select-none border-b ${headerFooterBg} ${headerFooterText}`}>
            
            {/* Left Block Info */}
            <div className={`flex flex-col text-[12px] font-semibold leading-tight px-2`}>
              <div className="text-slate-500 text-[10px] uppercase tracking-wider">Item {currentIndex + 1} of {session.questions.length}</div>
              <div className="text-slate-700">Block 1</div>
            </div>
            
            {/* Center Navigation */}
            <div className="flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
              <button 
                onClick={handlePrev} 
                disabled={currentIndex === 0} 
                className="flex flex-col items-center disabled:opacity-50 hover:bg-white/10 px-2 rounded"
              >
                <ArrowLeftCircle size={20} strokeWidth={1.5} />
                <span className="text-[10px] font-bold mt-0.5">Previous</span>
              </button>
              
              <div className="text-[14px] font-bold">
                {currentIndex + 1} / {session.questions.length}
              </div>
              
              <button 
                onClick={handleNext} 
                className="flex flex-col items-center hover:bg-white/10 px-2 rounded"
              >
                <ArrowRightCircle size={20} strokeWidth={1.5} />
                <span className="text-[10px] font-bold mt-0.5">Next</span>
              </button>
            </div>
            
            {/* Right Tools */}
            <div className="flex items-center gap-1 h-full pt-1">
              {[
                { name: 'Report Issue', icon: <AlertTriangle size={18} />, action: (e: any) => setShowReportModal(true), active: showReportModal },
                { name: 'Lab Values', icon: <FlaskConical size={18} />, action: (e: any) => setShowLabValues(true), active: showLabValues },
                { name: 'Notes', icon: <PenLine size={18} />, action: (e: any) => setShowNotes(true), active: showNotes },
                { name: 'Calculator', icon: <CalcIcon size={18} />, action: (e: any) => setShowCalculator(true), active: showCalculator },
                { name: 'Settings', icon: <SettingsIcon size={18} />, action: (e: any) => setSettingsAnchorEl(e.currentTarget), active: !!settingsAnchorEl }
              ].map(tool => {
                const isActive = tool.active;
                const toolBg = isActive 
                  ? (isDark ? 'bg-slate-800 border-t border-l border-r border-slate-700 text-slate-100' : 'bg-slate-50 text-slate-900 border-t border-l border-r border-slate-200 rounded-t-lg')
                  : (isDark ? 'text-slate-400 border-transparent hover:text-slate-200' : 'text-slate-500 border-transparent hover:text-slate-900 hover:bg-slate-50 rounded-t-lg');
                const toolBorder = '';

                return (
                  <button 
                    key={tool.name}
                    onClick={tool.action}
                    className={`flex flex-col items-center justify-center h-full px-3 pt-1 border-b-0 rounded-t-sm ${toolBg} ${toolBorder}`}
                    style={{ marginBottom: isActive ? '-1px' : '0' }}
                  >
                    <div className="leading-none mb-0.5">{tool.icon}</div>
                    <span className="text-[11px] font-bold pb-1">{tool.name}</span>
                  </button>
                );
              })}
            </div>
            
          </header>

          {/* Main Content Area */}
          <main 
            className="flex-1 overflow-y-auto p-4 flex flex-col relative" 
            style={{ fontSize: `${settings.fontSize}px` }}
          >
            
            <div className="flex items-center mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={currentQ.isFlagged}
                  onChange={() => updateCurrentQuestionState({ isFlagged: !currentQ.isFlagged })}
                  className="w-4 h-4 accent-red-600 cursor-pointer"
                />
                <Flag size={16} className="fill-red-600 text-red-600" />
                <span className="text-[13px] font-bold hover:underline">Mark Question</span>
              </label>
            </div>

            <div className="flex flex-1">
              
              {/* Question & Options Side */}
              <div className="flex flex-col flex-1 pr-6">
                <div 
                  ref={questionContentRef}
                  className="vignette-text leading-relaxed cursor-text mb-6 [&_*]:text-[length:inherit]"
                  dangerouslySetInnerHTML={{ __html: currentQ.highlightedQuestionText || currentQ.question.questionText }}
                />
                
                {/* Options List */}
                <div className="space-y-4">
                  {(() => {
                    const showFeedback = (session.mode === 'tutor' && currentQ.selectedOptionId) || session.mode === 'review';
                    return (
                      <fieldset className={`border ${borderCol} p-5 rounded-xl ${isDark ? 'bg-slate-900' : 'bg-white'} shadow-sm`}>
                        {currentQ.question.options.map((opt, i) => {
                          const isSelected = currentQ.selectedOptionId === opt.id;
                          const isStruckThrough = currentQ.strikethroughs?.includes(opt.id);
                          
                          let bgClass = "bg-transparent";
                          if (showFeedback && opt.isCorrect) bgClass = isDark ? 'bg-green-900' : 'bg-[#008000] text-white';
                          else if (showFeedback && isSelected) bgClass = isDark ? 'bg-red-900' : 'bg-[#f8d7da]';

                          return (
                            <div key={opt.id} className={`flex items-start justify-between group ${bgClass} p-1`}>
                              <div className="flex items-start flex-1">
                                <input 
                                  type="radio" 
                                  name={`q-${currentQ.id}`}
                                  checked={isSelected}
                                  onChange={() => handleOptionSelect(opt.id)}
                                  disabled={!!showFeedback}
                                  className="mt-1 w-4 h-4 cursor-pointer accent-black shrink-0"
                                />
                                <div className="ml-3 flex-1 flex flex-col">
                                  <div className={`flex ${isStruckThrough ? 'line-through text-gray-400' : ''}`}>
                                    <span className="mr-2">{String.fromCharCode(65 + i)}.</span>
                                    <span className="leading-snug" dangerouslySetInnerHTML={{ __html: opt.text }} />
                                  </div>
                                  {showFeedback && (opt as any).explanation && (
                                    <div className="mt-2 text-[13px] text-gray-800 bg-gray-50 p-2 rounded border border-gray-200">
                                      <span dangerouslySetInnerHTML={{ __html: (opt as any).explanation }} />
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Strikethrough icon button on the right */}
                              <button 
                                onClick={(e) => { if(!showFeedback) toggleStrikethrough(e, opt.id); }}
                                className="ml-4 opacity-0 group-hover:opacity-50 hover:opacity-100 transition-opacity"
                                title="Strike out option"
                              >
                                <Strikethrough size={16} />
                              </button>
                            </div>
                          );
                        })}
                      </fieldset>
                    );
                  })()}
                  
                  {(() => {
                    const showFeedback = (session.mode === 'tutor' && currentQ.selectedOptionId) || session.mode === 'review';
                    if (showFeedback) {
                      return (
                        <div className={`mt-8 pt-4 border-t ${borderCol}`}>
                          <div className="font-bold mb-2 uppercase text-[13px]">Explanation:</div>
                          <div 
                            ref={explanationContentRef}
                            className="leading-relaxed [&_*]:text-[length:inherit]"
                            dangerouslySetInnerHTML={{ __html: currentQ.highlightedExplanation || currentQ.question.explanation || '' }}
                          />
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
                
                {/* Proceed Button */}
                <div className="mt-8 pb-10">
                  <button onClick={handleNext} className="bg-slate-900 text-white px-6 py-2.5 text-[14px] font-bold rounded-lg shadow-sm hover:bg-slate-800 hover:shadow-md transition-all">
                    Proceed to Next Item
                  </button>
                </div>
              </div>
              
              {/* Media Side */}
              {currentQ.question.media && currentQ.question.media.length > 0 && (
                <div className="w-[400px] shrink-0 pl-4">
                  <div className="border border-gray-400 shadow-[4px_4px_10px_rgba(0,0,0,0.2)] bg-white p-1 flex">
                    {/* Media Toolbar */}
                    <div className="w-12 flex flex-col items-center gap-4 py-2 border-r border-gray-200 mr-2 shrink-0">
                      <button 
                        className="exhibit-trigger flex flex-col items-center hover:bg-gray-100 p-1 rounded w-full"
                        data-url={currentQ.question.media && currentQ.question.media.length > 0 ? currentQ.question.media[0].url : ''}
                        onClick={() => {
                          if (currentQ.question.media && currentQ.question.media.length > 0) {
                            setZoomImage(currentQ.question.media[0].url);
                          }
                        }}
                      >
                        <div className="w-5 h-5 bg-black rounded-sm flex items-center justify-center text-white text-[12px] transform rotate-45 mb-1">◩</div>
                        <span className="text-[10px]">Invert</span>
                      </button>
                      <button 
                        className="exhibit-trigger flex flex-col items-center hover:bg-gray-100 p-1 rounded w-full"
                        data-url={currentQ.question.media && currentQ.question.media.length > 0 ? currentQ.question.media[0].url : ''}
                        onClick={() => {
                          if (currentQ.question.media && currentQ.question.media.length > 0) {
                            setZoomImage(currentQ.question.media[0].url);
                          }
                        }}
                      >
                        <div className="text-[18px] mb-1">☼</div>
                        <span className="text-[10px]">Contrast</span>
                      </button>
                      <button 
                        className="exhibit-trigger flex flex-col items-center hover:bg-gray-100 p-1 rounded w-full"
                        data-url={currentQ.question.media && currentQ.question.media.length > 0 ? currentQ.question.media[0].url : ''}
                        onClick={() => {
                          if (currentQ.question.media && currentQ.question.media.length > 0) {
                            setZoomImage(currentQ.question.media[0].url);
                          }
                        }}
                      >
                        <div className="text-[18px] mb-1">⊕</div>
                        <span className="text-[10px]">Zoom</span>
                      </button>
                    </div>
                    {/* Image */}
                    <div className="flex-1 flex items-center justify-center bg-[#0000ff] min-h-[300px]">
                      {currentQ.question.media.map(m => (
                        <MediaRenderer key={m.id} media={m} setZoomImage={setZoomImage} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
            </div>
            
      
      {showTutorial && (
        <TestTutorial onComplete={() => {
          setShowTutorial(false);
          localStorage.setItem('tutorial-seen-' + session.id, 'true');
        }} />
      )}
    </main>
        </div>
      </div>

      <footer className={`relative h-[40px] flex items-center justify-between px-4 shrink-0 select-none w-full ${headerFooterBg} ${headerFooterText} border-t ${borderCol}`}>
        <div className={`flex flex-col text-[11px] font-semibold leading-none px-1.5 py-0.5 justify-center h-full`}>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 uppercase tracking-wider text-[9px]">Block Time</span>
            <TimerDisplay 
              initialElapsed={0} 
              initialTimeLeft={session.durationSec ? Math.max(0, session.durationSec - initialElapsed) : null} 
              isTimed={true} 
              onTimeUp={handleEndBlock} 
              type="remaining"
              className="text-[12px] font-mono font-bold text-slate-700"
            />
          </div>
        </div>
        
        <button onClick={handleSuspend} className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center hover:bg-yellow-500/20 px-4 h-full rounded transition-colors">
          <svg className="mb-0.5 w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
          <span className="text-[10px] font-bold uppercase tracking-wider">Suspend</span>
        </button>
        
        <button onClick={handleEndBlock} className="flex flex-col items-center justify-center hover:bg-red-600/30 px-2 h-full rounded">
          <XCircle size={14} className="text-red-500 mb-0.5" />
          <span className="text-[10px] font-bold">End Block</span>
        </button>
      </footer>

      {/* Modals */}
      {contextMenu.show && (
        <SmartContextMenu 
          top={contextMenu.top} 
          left={contextMenu.left} 
          onHighlight={applyHighlight} 
          onNote={handleAddToNotebook} 
          onFlashcard={handleAddToFlashcard}
          onClose={() => setContextMenu(prev => ({ ...prev, show: false }))}
          settings={settings}
        />
      )}
      
      {showCalculator && <Calculator onClose={() => setShowCalculator(false)} />}
      {showLabValues && <LabValuesModal onClose={() => setShowLabValues(false)} />}
      {settingsAnchorEl && <SettingsDropdown anchorEl={settingsAnchorEl} onClose={() => setSettingsAnchorEl(null)} />}
      {showNotes && <QuestionNotesModal 
        isOpen={showNotes} 
        onClose={() => { setShowNotes(false); setNotebookAppendText(null); }} 
        initialNotes={currentQ.notes || ''} 
        onSave={handleSaveNotes} 
        appendContent={notebookAppendText}
      />}
      {zoomImage && (
        <ExhibitDisplay 
          mediaUrl={zoomImage} 
          onClose={() => setZoomImage(null)} 
          onAddToNotes={() => {
            // we will hook this up to notes system in phase 4
            setShowNotes(true);
          }}
        />
      )}
      
      {showFlashcardModal && session.qbankSlug && (
        <FlashcardModal 
          isOpen={showFlashcardModal} 
          onClose={() => setShowFlashcardModal(false)} 
          questionId={currentQ.question.id} 
          qbankSlug={session.qbankSlug} 
          initialFront={flashcardPrefillText}
        />
      )}

      {omissionWarning && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
          <div className={`${mainBg} ${mainText} border ${borderCol} w-[400px] shadow-[4px_4px_0px_rgba(0,0,0,0.2)]`}>
            <div className={`${headerFooterBg} ${headerFooterText} font-bold p-2 text-[14px]`}>
              Warning
            </div>
            <div className="p-8 text-center text-[14px]">
              You have not answered all questions in this block. Are you sure you want to proceed?
            </div>
            <div className={`bg-[#f0f0f0] text-black p-3 flex justify-end gap-2 border-t border-gray-300`}>
              <button onClick={() => setOmissionWarning(null)} className="border border-gray-500 bg-white px-4 py-1 hover:bg-gray-100 font-bold">Cancel</button>
              <button onClick={() => { omissionWarning(); setOmissionWarning(null); }} className="border border-gray-500 bg-white px-4 py-1 hover:bg-gray-100 font-bold">Proceed</button>
            </div>
          </div>
        </div>
      )}

      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full shadow-2xl overflow-hidden text-slate-900">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <AlertTriangle className="text-amber-500" size={20} />
                Report an Issue
              </h3>
              <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleReportSubmit} className="p-6">
              {reportStatus === 'success' ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mb-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">Report Submitted!</h4>
                  <p className="text-slate-500 text-sm">Thank you for your feedback. Our team will review this shortly.</p>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Issue Type</label>
                    <select 
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                      className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value="TYPO">Typo / Formatting</option>
                      <option value="INCORRECT">Incorrect Answer</option>
                      <option value="OUTDATED">Outdated Medical Info</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <textarea 
                      value={reportDescription}
                      onChange={(e) => setReportDescription(e.target.value)}
                      className="w-full border border-slate-300 rounded p-2 h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                      placeholder="Please describe the issue in detail..."
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="secondary" onClick={() => setShowReportModal(false)}>Cancel</Button>
                    <Button type="submit" disabled={reportStatus === 'submitting'}>
                      {reportStatus === 'submitting' ? 'Submitting...' : 'Submit Report'}
                    </Button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
