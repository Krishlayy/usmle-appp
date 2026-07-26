'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useVirtualizer } from '@tanstack/react-virtual';
import dynamic from 'next/dynamic';
import { HelpCircle, TestTubes, FileText, Calculator as CalcIcon, Settings as SettingsIcon, ChevronLeft, ChevronRight, Bookmark, X, Clock, FlaskConical, PenLine, ArrowLeftCircle, ArrowRightCircle, Lock, XCircle, Flag, Strikethrough, AlertTriangle, Highlighter } from 'lucide-react';
import { MediaRenderer } from '@/components/MediaRenderer';
import { QuestionNotesModal } from './QuestionNotesModal';
import { TestSettingsProvider, useTestSettings, TestSettings } from '@/components/TestSettingsProvider';
import { Button } from '@/components/ui/Button';
import { TestSecurityWarning } from '@/components/TestSecurityWarning';
import { ExhibitDisplay } from './ExhibitDisplay';
import { TestTutorial } from './TestTutorial';
import DOMPurify from 'isomorphic-dompurify';
import { TimerDisplay, QuestionTimerDisplay } from '@/features/test-player/components/Timers';


import { useTestPlayerStore } from '@/store/useTestPlayerStore';
import { useTranslation } from '@/hooks/useTranslation';
import { useUITranslation } from '@/hooks/useUITranslation';
import { useHighlighter } from '@/hooks/useHighlighter';
import { HighlightWrapper } from '@/components/HighlightWrapper';
import { HighlightToolbar } from '@/components/HighlightToolbar';

const sanitizeHTML = (html: string) => {
  return DOMPurify.sanitize(html, { 
    ADD_ATTR: ['style', 'data-url', 'class', 'target', 'color', 'size', 'face'], 
    ADD_TAGS: ['font'] 
  });
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



export function TestPlayer({ session, initialIndex, userEmail = '', userIp = '' }: { session: TestSession, initialIndex?: number, userEmail?: string, userIp?: string }) {
  return (
    <TestSettingsProvider>
      <TestPlayerInner session={session} initialIndex={initialIndex} userEmail={userEmail} userIp={userIp} />
    </TestSettingsProvider>
  );
}

function TestPlayerInner({ session, initialIndex = 0, userEmail = '', userIp = '' }: { session: TestSession, initialIndex?: number, userEmail?: string, userIp?: string }) {
  const router = useRouter();
  const { settings, updateSetting } = useTestSettings();
  const { t } = useUITranslation(settings.targetLanguage);
  
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState('TYPO');
  const [reportDescription, setReportDescription] = useState('');
  const [reportStatus, setReportStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  
  const [highlightColor, setHighlightColor] = useState('#fef08a');
  
  const isPaused = useTestPlayerStore(state => state.isPaused);
  const setIsPaused = useTestPlayerStore(state => state.setIsPaused);
  
  const currentIndex = useTestPlayerStore(state => state.currentIndex);
  const setCurrentIndex = useTestPlayerStore(state => state.setCurrentIndex);
  
  const questions = useTestPlayerStore(state => state.questions);
  const setQuestions = useTestPlayerStore(state => state.setQuestions);
  const sessionId = useTestPlayerStore(state => state.sessionId);

  const storeInitRef = useRef(false);
  if (!storeInitRef.current || sessionId !== session.id) {
    storeInitRef.current = true;
    let initialQs = session.questions.sort((a, b) => a.order - b.order);
    try {
      if (typeof window !== 'undefined') {
        const localState = localStorage.getItem(`test-session-state-${session.id}`);
        if (localState) {
          const parsed = JSON.parse(localState);
          const localAnswered = parsed.filter((q: any) => q.selectedOptionId).length;
          const serverAnswered = session.questions.filter((q: any) => q.selectedOptionId).length;
          if (localAnswered > serverAnswered) {
            initialQs = session.questions.map(sq => {
              const localQ = parsed.find((pq: any) => pq.id === sq.id);
              if (localQ) return { ...sq, ...localQ, question: sq.question };
              return sq;
            }).sort((a, b) => a.order - b.order);
          }
        }
      }
    } catch (e) {
      console.error('Failed to load local state', e);
    }
    useTestPlayerStore.setState({ sessionId: session.id, questions: initialQs, currentIndex: initialIndex, isPaused: false });
  }
  
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
          // NOTE: kept in sync with the primary stateToSave shape above so a quota-triggered
          // retry doesn't silently drop highlight fields while keeping strikethroughs.
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

  // --- Consolidated autosave: merges concurrent field writes per question and
  // debounces the network call, so selecting an answer + striking an option in quick
  // succession can no longer race each other as separate partial-payload requests. ---
  const pendingSavesRef = useRef<Record<string, any>>({});
  const saveTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const sendAutosave = useCallback((payload: any) => {
    fetch(`/api/test-sessions/${session.id}/autosave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch((err) => {
      console.error('Save failed', err);
      pushToSyncQueue(payload);
    });
  }, [session.id, pushToSyncQueue]);

  const scheduleAutosave = useCallback((questionProgressId: string, fields: Record<string, any>) => {
    const existing = pendingSavesRef.current[questionProgressId] || { questionProgressId };
    pendingSavesRef.current[questionProgressId] = { ...existing, ...fields };

    if (saveTimersRef.current[questionProgressId]) {
      clearTimeout(saveTimersRef.current[questionProgressId]);
    }

    saveTimersRef.current[questionProgressId] = setTimeout(() => {
      const toSend = pendingSavesRef.current[questionProgressId];
      delete pendingSavesRef.current[questionProgressId];
      delete saveTimersRef.current[questionProgressId];
      sendAutosave(toSend);
    }, 350);
  }, [sendAutosave]);

  const flushPendingSaves = useCallback(() => {
    Object.keys(saveTimersRef.current).forEach(id => clearTimeout(saveTimersRef.current[id]));
    saveTimersRef.current = {};
    const pending = pendingSavesRef.current;
    pendingSavesRef.current = {};
    Object.values(pending).forEach(payload => sendAutosave(payload));
  }, [sendAutosave]);

  // Flush any debounced-but-unsent saves on unmount so navigating away from the
  // player entirely never silently drops the last few seconds of edits.
  // (Also commits any not-yet-accumulated question time — see commitElapsedTime below.)
  useEffect(() => {
    return () => {
      commitElapsedTime();
      flushPendingSaves();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flushPendingSaves]);

  const initialElapsed = useMemo(() => {
    return questions.reduce((acc, q) => acc + (q.timeTakenSec || 0), 0);
  }, [questions]);

  const [submitting, setSubmitting] = useState(false);
  // Ref-only "start of current unaccounted time interval" for the active question.
  // Replaces the old `questionStartTime` state — nothing needs to re-render off of
  // this value directly, it's only read/written inside commitElapsedTime.
  const questionStartTimeRef = useRef(Date.now());
  const [isObscured, setIsObscured] = useState(false);
  
  const [showCalculator, setShowCalculator] = useState(false);
  const [showLabValues, setShowLabValues] = useState(false);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showFlashcardModal, setShowFlashcardModal] = useState(false);
  const [flashcardPrefillText, setFlashcardPrefillText] = useState('');
  const [omissionWarning, setOmissionWarning] = useState<(() => void) | null>(null);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [notebookAppendText, setNotebookAppendText] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  
  useEffect(() => {
    if (!localStorage.getItem('tutorial-seen-' + session.id)) {
      setShowTutorial(true);
    }
  }, [session.id]);
  
  const [showSecurityWarning, setShowSecurityWarning] = useState(false); // Anti-cheat temporarily disabled


  
  const questionContentRef = useRef<HTMLDivElement>(null);
  const explanationContentRef = useRef<HTMLDivElement>(null);

  const applyTextFormatting = (type: 'highlight' | 'strikethrough', explicitColor?: string) => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.toString().trim() === '') {
      return;
    }
    
    const range = selection.getRangeAt(0).cloneRange();
    const qContains = questionContentRef.current?.contains(range.commonAncestorContainer);
    const eContains = explanationContentRef.current?.contains(range.commonAncestorContainer);
    
    if (!qContains && !eContains) {
      return;
    }

    const targetRef = qContains ? questionContentRef : explanationContentRef;
    if (targetRef.current) {
      targetRef.current.contentEditable = 'true';
      try {
        document.execCommand('styleWithCSS', false, true as any);
      } catch(e) {}
      
      if (type === 'highlight') {
        const targetColor = explicitColor || highlightColor;
        
        if (targetColor === 'transparent') {
          document.execCommand('backColor', false, 'transparent');
          document.execCommand('hiliteColor', false, 'transparent');
        } else {
          document.execCommand('backColor', false, targetColor);
          document.execCommand('hiliteColor', false, targetColor);
        }
      } else if (type === 'strikethrough') {
        document.execCommand('strikeThrough', false, undefined);
      }
      
      targetRef.current.contentEditable = 'false';
      
      const newHtml = targetRef.current.innerHTML;
      const updates = qContains ? { highlightedQuestionText: newHtml } : { highlightedExplanation: newHtml };
      updateCurrentQuestionState(updates);
      scheduleAutosave(currentQRef.current.id, updates);
      
      window.getSelection()?.removeAllRanges();
    }
  };

  const currentQ = questions[currentIndex];
  
  const testPlayerMainRef = useRef<HTMLDivElement>(null);
  const { translatedData, isTranslating } = useTranslation(currentQ?.question.id, settings.targetLanguage);
  
  const { highlights, selectionRect, addHighlight, currentSelection } = useHighlighter({
    questionId: currentQ?.question.id || '',
    containerRef: testPlayerMainRef,
  });

  // Single source of truth for "answer feedback is currently visible" — reused by the
  // options fieldset, the explanation panel, and the strikethrough lock.
  const showFeedback = (session.mode === 'tutor' && !!currentQ?.selectedOptionId) || session.mode === 'review';

  const currentIndexRef = useRef(currentIndex);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);

  const questionsRef = useRef(questions);
  useEffect(() => { questionsRef.current = questions; }, [questions]);

  // Kept as a ref too, purely so the mouseup handler above (and anything else declared
  // earlier in the file) can always read the *current* question without needing to be
  // redeclared after `currentQ` — avoids stale-closure bugs without adding dependencies.
  const currentQRef = useRef(currentQ);
  useEffect(() => { currentQRef.current = currentQ; }, [currentQ]);

  // --- Single source of truth for question timing --------------------------------
  // Computes how much time has elapsed since the last commit (navigation, answer
  // selection, or a periodic checkpoint from the live QuestionTimerDisplay), adds it
  // to the current question's timeTakenSec, persists it (state -> localStorage effect,
  // plus a debounced autosave call), and resets the "start of interval" ref so the
  // same elapsed seconds are never counted twice.
  const commitElapsedTime = useCallback(() => {
    const idx = currentIndexRef.current;
    const q = questionsRef.current[idx];
    const now = Date.now();
    const deltaSec = Math.floor((now - questionStartTimeRef.current) / 1000);
    questionStartTimeRef.current = now;
    if (!q || deltaSec <= 0) return;

    const timeTakenSec = q.timeTakenSec + deltaSec;
    setQuestions(prev => prev.map((qq, i) => (i === idx ? { ...qq, timeTakenSec } : qq)));
    scheduleAutosave(q.id, { timeTakenSec });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduleAutosave]);

  const finishSession = useCallback(async (finalQuestions: SessionQuestion[]) => {
    commitElapsedTime();
    flushPendingSaves();
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
  }, [session.id, session.qbankSlug, router, flushPendingSaves, commitElapsedTime]);

  const handleTimeUp = useCallback(() => {
    commitElapsedTime();
    finishSession(questionsRef.current);
  }, [finishSession, commitElapsedTime]);

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
      if (!currentQ) return;
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (settingsMenuOpen || omissionWarning || showCalculator) return;
      
      const key = e.key.toLowerCase();
      if (key === 'arrowright') handleNext();
      else if (key === 'arrowleft') handlePrev();
      else if (key === ' ') {
        e.preventDefault();
        const nextFlagged = !currentQ.isFlagged;
        updateCurrentQuestionState({ isFlagged: nextFlagged });
        scheduleAutosave(currentQ.id, { isFlagged: nextFlagged });
      } else if (['a', 'b', 'c', 'd', 'e', 'f', 'g'].includes(key)) {
        const optionIndex = key.charCodeAt(0) - 97;
        const option = currentQ.question.options[optionIndex];
        if (option) handleOptionSelect(option.id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, currentQ, questions, settingsMenuOpen, omissionWarning, showCalculator]);

  const updateCurrentQuestionState = (updates: Partial<SessionQuestion>) => {
    setQuestions(prev => prev.map((q, i) => i === currentIndex ? { ...q, ...updates } : q));
  };

  const handleOptionSelect = (optionId: string) => {
    if (session.mode === 'tutor' && currentQ.selectedOptionId) return;
    if (session.mode === 'review') return;

    const selectedOption = currentQ.question.options.find(o => o.id === optionId);
    const isCorrect = selectedOption?.isCorrect ?? false;

    // Finalize whatever time has accumulated up to this exact moment into timeTakenSec
    // first, so the answer-selection autosave and the timer's autosave never race
    // each other over the same field.
    commitElapsedTime();
    updateCurrentQuestionState({ selectedOptionId: optionId, isCorrect });
    scheduleAutosave(currentQ.id, { selectedOptionId: optionId, isCorrect });

    if (settings.autoNext) {
      setTimeout(() => {
        handleNext();
      }, 700);
    }
  };
  
  const handleSaveNotes = (notes: string) => {
    updateCurrentQuestionState({ notes });
    scheduleAutosave(currentQ.id, { notes });
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
    commitElapsedTime();
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
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

    commitElapsedTime();
    
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
    
    commitElapsedTime();
    flushPendingSaves();
    router.push(`/dashboard/${session.qbankSlug}`);
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      commitElapsedTime();
      setCurrentIndex(prev => prev - 1);
    }
  };

  const toggleStrikethrough = (optionId: string) => {
    if (session.mode === 'review') return;
    // Lock strike state once the answer/feedback is showing, consistent with the
    // options themselves being disabled at that point (see `disabled={!!showFeedback}` below).
    if (showFeedback) return;
    
    const currentStrikes = currentQ.strikethroughs || [];
    const newStrikes = currentStrikes.includes(optionId) 
      ? currentStrikes.filter(id => id !== optionId)
      : [...currentStrikes, optionId];
      
    updateCurrentQuestionState({ strikethroughs: newStrikes });
    scheduleAutosave(currentQ.id, { strikethroughs: newStrikes });
  };



  const handleAddToNotebook = () => {
    const text = window.getSelection()?.toString() || '';
    if (text) {
      const newNotes = (currentQ.notes || '') + (currentQ.notes ? '\n\n' : '') + text;
      handleSaveNotes(newNotes);
      setShowNotes(true);
    }
  };

  const handleAddToFlashcard = () => {
    const text = window.getSelection()?.toString() || '';
    if (text) {
      setFlashcardPrefillText(text);
      setShowFlashcardModal(true);
    }
  };

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent | TouchEvent) => {
      let target = e.target as HTMLElement;
      
      if (!target) return;
      if (target.nodeType === 3) {
        target = target.parentElement as HTMLElement;
      }
      if (!target) return;

      if (target.closest('#exhibit-display-root')) return;

      // Let React handle exhibit trigger clicks naturally
      if (target.closest('.exhibit-trigger')) return;

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
        e.preventDefault();
        e.stopPropagation();
        setZoomImage(imgElement.src);
      } else if (tableElement) {
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

  if (!currentQ) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[var(--background)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (showSecurityWarning && session.mode !== 'review') {
    return <TestSecurityWarning onAccept={() => setShowSecurityWarning(false)} userEmail={userEmail} userIp={userIp} />;
  }

  const isDark = settings.colorTheme === 'dark';
  const isSepia = settings.colorTheme === 'sepia';
  
  const mainBg = isDark ? 'bg-slate-950' : isSepia ? 'bg-[#f4ecd8]' : 'bg-white';
  const mainText = isDark ? 'text-slate-200' : isSepia ? 'text-[#5b4636]' : 'text-slate-900';
  const headerFooterBg = isDark ? 'bg-slate-900 border-slate-800' : isSepia ? 'bg-[#e9e1c9] border-[#d4c6a6]' : 'bg-white border-slate-200';
  const headerFooterText = isDark ? 'text-slate-300' : isSepia ? 'text-[#5b4636]' : 'text-slate-700';
  const sidebarBg = isDark ? 'bg-slate-900' : isSepia ? 'bg-[#e9e1c9]' : 'bg-slate-50';
  const sidebarItemBg = isDark ? 'bg-transparent text-slate-400' : isSepia ? 'bg-transparent text-[#7d6550]' : 'bg-transparent text-slate-500';
  const sidebarActiveBg = isDark ? 'bg-slate-800 text-slate-100 shadow-sm rounded-md mx-1' : isSepia ? 'bg-[#f4ecd8] text-[#5b4636] shadow-sm border border-[#d4c6a6] rounded-md mx-1' : 'bg-white text-slate-900 shadow-sm border border-slate-200 rounded-md mx-1';
  const borderCol = isDark ? 'border-slate-800' : isSepia ? 'border-[#d4c6a6]' : 'border-slate-200';

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

  const renderMqbTheme = () => (
   <div className={`flex flex-col h-screen overflow-hidden font-sans ${mainBg} ${mainText}`} style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      
      {isPaused && (
        <div className="fixed inset-0 z-50 bg-slate-900/95 flex flex-col items-center justify-center backdrop-blur-sm">
          <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-md w-full">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Block Paused</h2>
            <p className="text-slate-600 mb-8">The block timer is currently paused. The questions are hidden to maintain test security.</p>
            <button 
              onClick={() => setIsPaused(false)}
              className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg shadow hover:bg-slate-800 transition-colors"
            >
              Resume Block
            </button>
          </div>
        </div>
      )}

      {/* Top Section (Sidebar + Header + Main Content) */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar */}
        <aside className={`w-[110px] flex flex-col shrink-0 overflow-hidden border-r ${borderCol} ${sidebarBg}`}>
          <div className={`h-[45px] flex items-center justify-center text-center leading-tight font-bold text-[11px] ${isDark ? 'bg-black border-[#00e5ff] text-[#00e5ff]' : 'bg-white border-black text-black'} border-b`}>
            Question<br/>Status
          </div>
          <div className="flex-1 overflow-y-auto bg-white">
            {questions.map((q, idx) => {
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
                  <div className="w-5 flex items-center justify-center gap-[2px] mr-1 shrink-0">
                    {isAnswered && (
                      <div className="w-2 h-2 rounded-full bg-black shrink-0" />
                    )}
                    {isFlagged && (
                      <Flag size={10} className="fill-red-500 text-red-500 shrink-0" />
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
          <header className={`min-h-[60px] flex items-center justify-between px-4 shrink-0 select-none border-b ${headerFooterBg} ${headerFooterText}`}>
            
            {/* Left Column: Info & Font Tools */}
            <div className="flex-1 flex items-center gap-6">
              <div className={`flex flex-col text-[12px] font-semibold leading-tight`}>
                <div className="text-slate-500 text-[10px] uppercase tracking-wider">Item {currentIndex + 1} of {session.questions.length}</div>
                <div className="text-slate-700">Block 1</div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => updateSetting('fontSize', Math.max(12, settings.fontSize - 2))}
                  className="text-slate-500 font-bold hover:text-slate-900 transition-colors"
                  title="Decrease Font Size"
                >A-</button>
                <button 
                  onClick={() => updateSetting('fontSize', Math.min(24, settings.fontSize + 2))}
                  className="text-slate-500 font-bold hover:text-slate-900 transition-colors text-lg"
                  title="Increase Font Size"
                >A+</button>
              </div>
            </div>
            
            {/* Center Column: Navigation */}
            <div className="flex-1 flex items-center justify-center gap-8">
              <button 
                onClick={handlePrev} 
                disabled={currentIndex === 0} 
                className="flex flex-col items-center disabled:opacity-30 hover:text-blue-600 transition-colors"
              >
                <ArrowLeftCircle size={22} strokeWidth={1.5} />
                <span className="text-[10px] font-bold mt-1">{t('Previous')}</span>
              </button>
              
              <div className="text-[14px] font-bold tracking-wide">
                {currentIndex + 1} / {session.questions.length}
              </div>
              
              <button 
                onClick={handleNext} 
                className="flex flex-col items-center hover:text-blue-600 transition-colors"
              >
                <ArrowRightCircle size={22} strokeWidth={1.5} />
                <span className="text-[10px] font-bold mt-1">{t('Next')}</span>
              </button>
            </div>
            
            {/* Right Column: Tools */}
            <div className="flex-1 flex justify-end items-center gap-1 h-full py-1">
              {session.mode === 'timed' && (
                <button 
                  onClick={() => setIsPaused(true)}
                  className="flex flex-col items-center justify-center px-3 text-slate-500 hover:text-blue-600 transition-colors rounded"
                >
                  <Clock size={20} strokeWidth={1.5} className="mb-1" />
                  <span className="text-[10px] font-bold">{t('Pause')}</span>
                </button>
              )}
              {[
                { 
                  name: 'Multi-Color', 
                  icon: <Highlighter size={20} strokeWidth={1.5} />, 
                  action: (e: any) => applyTextFormatting('highlight'), 
                  active: false,
                  render: (isActive: boolean) => (
                    <div key="Highlight" className="relative group flex items-center justify-center h-full">
                      <button 
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => applyTextFormatting('highlight')}
                        className={`flex flex-col items-center justify-center px-3 text-slate-500 hover:text-blue-600 transition-colors rounded`}
                      >
                        <div className="relative mb-1">
                          <Highlighter size={20} strokeWidth={1.5} />
                          <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border border-gray-400" style={{ backgroundColor: highlightColor }}></div>
                        </div>
                        <span className="text-[10px] font-bold">Multi-Color</span>
                      </button>
                      <div className="absolute top-full right-0 hidden group-hover:flex bg-white shadow-lg border border-slate-200 rounded p-2 gap-2 z-50">
                        {[
                          { color: '#fef08a', name: 'Yellow' },
                          { color: '#bbf7d0', name: 'Green' },
                          { color: '#bfdbfe', name: 'Blue' },
                          { color: '#fbcfe8', name: 'Pink' },
                          { color: 'transparent', name: 'Eraser (Clear)' }
                        ].map(c => (
                          <button
                            key={c.name}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              if (c.color !== 'transparent') setHighlightColor(c.color);
                              applyTextFormatting('highlight', c.color);
                            }}
                            className={`w-6 h-6 rounded-full border border-gray-300 hover:scale-110 transition-transform ${highlightColor === c.color ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
                            style={{ backgroundColor: c.color === 'transparent' ? '#f8fafc' : c.color }}
                            title={c.name}
                          >
                            {c.color === 'transparent' && <span className="text-red-500 font-bold text-xs flex items-center justify-center h-full w-full">/</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                },
                { name: 'Report Issue', icon: <AlertTriangle size={20} strokeWidth={1.5} />, action: (e: any) => setShowReportModal(true), active: showReportModal },
                { name: 'Lab Values', icon: <FlaskConical size={20} strokeWidth={1.5} />, action: (e: any) => setShowLabValues(true), active: showLabValues },
                { name: 'Notes', icon: <PenLine size={20} strokeWidth={1.5} />, action: (e: any) => setShowNotes(true), active: showNotes },
                { name: 'Calculator', icon: <CalcIcon size={20} strokeWidth={1.5} />, action: (e: any) => setShowCalculator(true), active: showCalculator },
                { name: 'Settings', icon: <SettingsIcon size={20} strokeWidth={1.5} />, action: (e: any) => setSettingsMenuOpen(true), active: settingsMenuOpen }
              ].map(tool => {
                if (tool.render) return tool.render(tool.active);
                
                return (
                  <button 
                    key={tool.name}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={tool.action}
                    className={`flex flex-col items-center justify-center px-3 text-slate-500 hover:text-blue-600 transition-colors rounded`}
                  >
                    <div className="mb-1">{tool.icon}</div>
                    <span className="text-[10px] font-bold">{tool.name}</span>
                  </button>
                );
              })}
            </div>
            
          </header>

          <main 
            ref={testPlayerMainRef}
            className={`flex-1 flex flex-col relative ${settings.splitScreen ? 'overflow-hidden' : 'overflow-y-auto p-4'}`}
            style={{ fontSize: `${settings.fontSize}px`, lineHeight: 1.5 }}
          >
            
            <div className="flex items-center mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={currentQ.isFlagged}
                  onChange={() => {
                    const nextFlagged = !currentQ.isFlagged;
                    updateCurrentQuestionState({ isFlagged: nextFlagged });
                    scheduleAutosave(currentQ.id, { isFlagged: nextFlagged });
                  }}
                  className="w-4 h-4 accent-red-600 cursor-pointer"
                />
                <Flag size={16} className="fill-red-600 text-red-600" />
                <span className="text-[13px] font-bold hover:underline">Mark Question</span>
              </label>
            </div>

            <div className={`flex flex-1 ${settings.splitScreen ? 'overflow-hidden p-4 pt-0' : ''}`}>
              
              
              {/* Main Content Area */}
              <div className={`flex flex-1 ${settings.targetLanguage ? 'flex-row gap-6' : ''}`}>
                
                {/* English Panel */}
                <div className={`flex flex-1 ${settings.targetLanguage ? 'flex-col' : (settings.splitScreen ? 'flex-row' : 'flex-col pr-6')}`}>
                  {/* Vignette Wrapper */}
                  <div className={`${settings.splitScreen && !settings.targetLanguage ? 'flex-1 overflow-y-auto pr-6 border-r border-gray-300 mr-6' : ''}`}>
                    <HighlightWrapper 
                      html={sanitizeHTML(currentQ.highlightedQuestionText || currentQ.question.questionText)}
                      highlights={highlights}
                      section="stem"
                      className={`vignette-text leading-relaxed cursor-text mb-6 [&_*]:text-[length:inherit] ${settings.highContrast ? 'text-black font-medium' : ''}`}
                    />
                  </div>
                  
                  {/* Options & Explanations Wrapper */}
                  <div className={`${settings.splitScreen && !settings.targetLanguage ? 'flex-1 overflow-y-auto pr-2' : ''}`}>
                    <div className={settings.answerLayout === 'compact' ? 'space-y-2' : 'space-y-4'}>
                      <fieldset className={`flex flex-col gap-2 ${settings.answerLayout === 'compact' ? 'mt-2' : 'mt-4'}`}>
                        {currentQ.question.options.map((opt, i) => {
                          const isSelected = currentQ.selectedOptionId === opt.id;
                          const isStruckThrough = currentQ.strikethroughs?.includes(opt.id);
                          
                          let bgClass = "bg-transparent";
                          if (showFeedback && opt.isCorrect) {
                            bgClass = isDark ? 'bg-green-900/40' : (settings.highContrast ? 'bg-[#005a00]/20' : 'bg-[#008000]/10');
                          } else if (showFeedback && isSelected) {
                            bgClass = isDark ? 'bg-red-900/40' : (settings.highContrast ? 'bg-[#d9534f]/20' : 'bg-[#f8d7da]/50');
                          }

                          return (
                            <div key={opt.id} className={`flex items-start justify-between group ${bgClass} py-2 px-1 rounded transition-colors`}>
                              <div className="flex items-start flex-1 cursor-pointer" onClick={() => !showFeedback && handleOptionSelect(opt.id)}>
                                <input 
                                  type="radio" 
                                  name={`q-${currentQ.id}`}
                                  checked={isSelected}
                                  onChange={() => handleOptionSelect(opt.id)}
                                  disabled={!!showFeedback}
                                  className={`mt-1.5 w-4 h-4 cursor-pointer accent-slate-600 shrink-0 ${settings.highContrast ? 'ring-1 ring-black' : ''}`}
                                />
                                <div className="ml-4 flex-1 flex flex-col">
                                  <div className={`flex items-start ${isStruckThrough ? 'line-through opacity-50' : ''}`}>
                                    <span className={`mr-3 ${settings.highContrast ? 'font-black' : 'font-semibold'}`}>{String.fromCharCode(65 + i)}.</span>
                                    {settings.showShortcuts && !showFeedback && (
                                      <kbd className="mr-3 mt-0.5 px-1.5 py-0.5 border border-gray-300 rounded text-[9px] text-gray-500 bg-white shadow-sm font-mono hidden sm:inline-block">
                                        {String.fromCharCode(65 + i)}
                                      </kbd>
                                    )}
                                    <div className={`leading-relaxed [&>p]:inline ${settings.highContrast ? 'text-black font-medium' : ''}`} dangerouslySetInnerHTML={{ __html: sanitizeHTML(opt.text) }} />
                                  </div>
                                  {showFeedback && (opt as any).explanation && (
                                    <div className={`mt-3 text-[13px] ${settings.highContrast ? 'text-black bg-gray-100 border-gray-400' : 'text-slate-700 bg-slate-50 border-slate-200'} p-3 rounded-md border`}>
                                      <div dangerouslySetInnerHTML={{ __html: sanitizeHTML((opt as any).explanation) }} />
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {session.mode !== 'review' && (
                                <button 
                                  type="button"
                                  onClick={() => toggleStrikethrough(opt.id)}
                                  disabled={showFeedback}
                                  className={`ml-4 p-1.5 rounded transition-all shrink-0 ${settings.highContrast ? 'text-gray-800' : 'text-slate-400'} hover:text-slate-900 hover:bg-slate-200/50 opacity-70 sm:opacity-50 sm:group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100 focus-visible:opacity-100 hover:!opacity-100 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:!opacity-20 disabled:hover:bg-transparent`}
                                >
                                  <Strikethrough size={16} />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </fieldset>
                      
                      {showFeedback && (
                        <div className={`mt-8 pt-4 border-t ${settings.highContrast ? 'border-gray-400' : borderCol}`}>
                          <div className={`font-bold mb-2 uppercase text-[13px] ${settings.highContrast ? 'text-black' : ''}`}>Explanation:</div>
                          <div 
                            ref={explanationContentRef}
                            className={`leading-relaxed [&_*]:text-[length:inherit] ${settings.highContrast ? 'text-black font-medium' : ''}`}
                            dangerouslySetInnerHTML={{ __html: sanitizeHTML(currentQ.highlightedExplanation || currentQ.question.explanation || '') }}
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-8 pb-10 flex items-center">
                      <button onClick={handleNext} className="bg-slate-900 text-white px-6 py-2.5 text-[14px] font-bold rounded-lg shadow-sm hover:bg-slate-800 hover:shadow-md transition-all">
                        {t('Next')} Item
                      </button>
                      {settings.showShortcuts && (
                        <kbd className="ml-3 px-2 py-1 border border-gray-400 rounded text-[11px] text-gray-500 bg-white font-mono hidden sm:inline-block">
                          Space
                        </kbd>
                      )}
                    </div>
                  </div>
                </div>

                {/* Translated Panel */}
                {settings.targetLanguage && translatedData && (
                  <div className="flex flex-1 flex-col pl-6 border-l border-gray-300 bg-blue-50/30">
                    <div className="text-[10px] font-bold text-blue-600 uppercase mb-2">Translation</div>
                    <div className="mb-6">
                      <HighlightWrapper 
                        html={translatedData.questionText}
                        highlights={highlights}
                        section="stem"
                        className={`vignette-text leading-relaxed cursor-text mb-6 [&_*]:text-[length:inherit] ${settings.highContrast ? 'text-black font-medium' : ''}`}
                      />
                    </div>
                    
                    <div>
                      <div className={settings.answerLayout === 'compact' ? 'space-y-2' : 'space-y-4'}>
                        <fieldset className={`flex flex-col gap-2 ${settings.answerLayout === 'compact' ? 'mt-2' : 'mt-4'}`}>
                          {translatedData.options.map((opt, i) => {
                            const originalOpt = currentQ.question.options[i];
                            const isSelected = currentQ.selectedOptionId === originalOpt.id;
                            const isStruckThrough = currentQ.strikethroughs?.includes(originalOpt.id);
                            
                            let bgClass = "bg-transparent";
                            if (showFeedback && originalOpt.isCorrect) {
                              bgClass = isDark ? 'bg-green-900/40' : (settings.highContrast ? 'bg-[#005a00]/20' : 'bg-[#008000]/10');
                            } else if (showFeedback && isSelected) {
                              bgClass = isDark ? 'bg-red-900/40' : (settings.highContrast ? 'bg-[#d9534f]/20' : 'bg-[#f8d7da]/50');
                            }

                            return (
                              <div key={opt.id} className={`flex items-start justify-between group ${bgClass} py-2 px-1 rounded transition-colors`}>
                                <div className="flex items-start flex-1 opacity-90">
                                  <input 
                                    type="radio" 
                                    checked={isSelected}
                                    readOnly
                                    className={`mt-1.5 w-4 h-4 accent-slate-600 shrink-0 ${settings.highContrast ? 'ring-1 ring-black' : ''}`}
                                  />
                                  <div className="ml-4 flex-1 flex flex-col">
                                    <div className={`flex items-start ${isStruckThrough ? 'line-through opacity-50' : ''}`}>
                                      <span className={`mr-3 ${settings.highContrast ? 'font-black' : 'font-semibold'}`}>{String.fromCharCode(65 + i)}.</span>
                                      <div className={`leading-relaxed [&>p]:inline ${settings.highContrast ? 'text-black font-medium' : ''}`} dangerouslySetInnerHTML={{ __html: sanitizeHTML(opt.text) }} />
                                    </div>
                                    {showFeedback && (originalOpt as any).explanation && (
                                      <div className={`mt-3 text-[13px] ${settings.highContrast ? 'text-black bg-gray-100 border-gray-400' : 'text-slate-700 bg-slate-50 border-slate-200'} p-3 rounded-md border`}>
                                        <div dangerouslySetInnerHTML={{ __html: sanitizeHTML((opt as any).explanation || '') }} />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </fieldset>
                        
                        {showFeedback && translatedData.explanation && (
                          <div className={`mt-8 pt-4 border-t ${settings.highContrast ? 'border-gray-400' : borderCol}`}>
                            <div className={`font-bold mb-2 uppercase text-[13px] ${settings.highContrast ? 'text-black' : ''}`}>{t('Explanation')}:</div>
                            <div 
                              className={`leading-relaxed [&_*]:text-[length:inherit] ${settings.highContrast ? 'text-black font-medium' : ''}`}
                              dangerouslySetInnerHTML={{ __html: sanitizeHTML(translatedData.explanation) }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
{/* Media Side */}
              {currentQ.question.media && currentQ.question.media.length > 0 && (
                <div className="w-[350px] shrink-0 pl-4">
                  <div className="border border-gray-300 shadow-md bg-white p-1 flex h-[300px]">
                    
                    {/* Left Tools Panel */}
                    <div className="w-12 flex flex-col items-center gap-3 py-2 border-r border-gray-200 mr-1 shrink-0">
                      <button 
                        className="exhibit-trigger flex flex-col items-center justify-center hover:bg-gray-100 p-1 rounded w-full"
                        onClick={() => {
                          if (currentQ.question.media && currentQ.question.media.length > 0) {
                            setZoomImage(currentQ.question.media[0].url);
                          }
                        }}
                      >
                        <div className="w-4 h-4 bg-black rounded-sm flex items-center justify-center transform rotate-45 mb-1 text-white overflow-hidden">
                           <div className="w-full h-1/2 bg-white absolute top-0 left-0 transform -rotate-45 -translate-y-1"></div>
                        </div>
                        <span className="text-[9px] font-semibold text-slate-700">Invert</span>
                      </button>
                      <button 
                        className="exhibit-trigger flex flex-col items-center justify-center hover:bg-gray-100 p-1 rounded w-full"
                        onClick={() => {
                          if (currentQ.question.media && currentQ.question.media.length > 0) {
                            setZoomImage(currentQ.question.media[0].url);
                          }
                        }}
                      >
                        <div className="text-[16px] mb-1 leading-none text-slate-700">☼</div>
                        <span className="text-[9px] font-semibold text-slate-700">Contrast</span>
                      </button>
                      <button 
                        className="exhibit-trigger flex flex-col items-center justify-center hover:bg-gray-100 p-1 rounded w-full"
                        onClick={() => {
                          if (currentQ.question.media && currentQ.question.media.length > 0) {
                            setZoomImage(currentQ.question.media[0].url);
                          }
                        }}
                      >
                        <div className="text-[16px] mb-1 leading-none text-slate-700">⊕</div>
                        <span className="text-[9px] font-semibold text-slate-700">Zoom</span>
                      </button>
                    </div>

                    {/* Right Blue Exhibit Panel */}
                    <div className="flex-1 flex flex-col bg-[#0000ff] rounded-sm overflow-hidden">
                      <div className="flex-1 flex items-center justify-center p-2 pb-0 relative">
                        {currentQ.question.media.map(m => (
                          <div key={m.id} className="relative w-full h-full flex items-center justify-center bg-white rounded-t-xl overflow-hidden border border-gray-300">
                             <MediaRenderer media={{ ...m, caption: translatedData?.media?.find(tm => tm.id === m.id)?.caption || m.caption }} setZoomImage={setZoomImage} />
                          </div>
                        ))}
                      </div>
                      <div className="text-center text-[#5555ff] text-[11px] font-medium py-1.5 bg-[#0000ff]">
                        Clinical Exhibit
                      </div>
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
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 uppercase tracking-wider text-[9px]">Block Time</span>
              {settings.showTimer !== false ? (
                <TimerDisplay 
                  initialElapsed={0} 
                  initialTimeLeft={session.durationSec ? Math.max(0, session.durationSec - initialElapsed) : null} 
                  isTimed={true} 
                  isPaused={isPaused}
                  onTimeUp={handleEndBlock} 
                  type="remaining"
                  className="text-[12px] font-mono font-bold text-slate-700"
                />
              ) : (
                <span className="text-[12px] font-mono font-bold text-slate-700">--:--</span>
              )}
            </div>
            <div className="flex items-center gap-2 border-l border-slate-300 pl-4">
              <span className="text-slate-500 uppercase tracking-wider text-[9px]">Question Time</span>
              <QuestionTimerDisplay
                key={currentQ.id}
                questionId={currentQ.id}
                baseSeconds={currentQ.timeTakenSec}
                isTicking={session.mode !== 'review' && !isPaused}
                onCheckpoint={commitElapsedTime}
                className="text-[12px] font-mono font-bold text-slate-700"
              />
            </div>
          </div>
        </div>
        
        <button onClick={handleSuspend} className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center hover:bg-yellow-500/20 px-4 h-full rounded transition-colors">
          <svg className="mb-0.5 w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
          <span className="text-[10px] font-bold uppercase tracking-wider">Suspend</span>
        </button>
        
        <button onClick={handleEndBlock} className="flex flex-col items-center justify-center hover:bg-red-600/30 px-2 h-full rounded">
          <XCircle size={14} className="text-red-500 mb-0.5" />
          <span className="text-[10px] font-bold">{t('End Block')}</span>
        </button>
      </footer>

      {/* Modals */}
      
      
      {showCalculator && <Calculator onClose={() => setShowCalculator(false)} />}
      {showLabValues && <LabValuesModal onClose={() => setShowLabValues(false)} />}
      {settingsMenuOpen && <SettingsSidebar onClose={() => setSettingsMenuOpen(false)} />}
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

  const renderNbmeTheme = () => (
    <div className="flex flex-col h-screen overflow-hidden font-sans bg-white text-black select-none relative" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      
      {/* Modals & Overlays */}
      {isPaused && (
        <div className="fixed inset-0 z-50 bg-slate-900/95 flex flex-col items-center justify-center backdrop-blur-sm">
          <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-md w-full">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Block Paused</h2>
            <p className="text-slate-600 mb-8">The block timer is currently paused. The questions are hidden to maintain test security.</p>
            <button 
              onClick={() => setIsPaused(false)}
              className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg shadow hover:bg-slate-800 transition-colors"
            >
              Resume Block
            </button>
          </div>
        </div>
      )}

      {showCalculator && <Calculator onClose={() => setShowCalculator(false)} />}
      {showLabValues && <LabValuesModal onClose={() => setShowLabValues(false)} />}
      
      {settingsMenuOpen && (
         <div className="absolute top-[46px] right-2 z-[9999] bg-white border border-black shadow-lg shadow-black/20 w-[220px] py-1 flex flex-col text-[13px] font-medium text-black">
            <button className="flex items-center justify-between px-3 py-1.5 hover:bg-[#3399ff] hover:text-white group">
               Resize Text <span className="text-[10px] group-hover:text-white text-black">▶</span>
            </button>
            <button className="flex items-center justify-between px-3 py-1.5 hover:bg-[#3399ff] hover:text-white group">
               Color Theme <span className="text-[10px] group-hover:text-white text-black">▶</span>
            </button>
            <button className="flex items-center justify-between px-3 py-1.5 hover:bg-[#3399ff] hover:text-white">
               Show/Hide Strikeout
            </button>
            <button className="flex items-center justify-between px-3 py-1.5 hover:bg-[#3399ff] hover:text-white">
               Help
            </button>
            <div className="border-t border-gray-300 my-1"></div>
            <div className="px-3 py-1 text-[11px] text-gray-500 font-bold uppercase tracking-wider">Switch Theme</div>
            <button onClick={() => updateSetting('appTheme', 'MQB')} className="flex items-center justify-between px-3 py-1.5 hover:bg-[#3399ff] hover:text-white">
               Back to MQB Theme
            </button>
         </div>
      )}

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
          onAddToNotes={() => setShowNotes(true)}
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
      
      {/* NBME Header */}
      <header className="h-[46px] bg-[#003b6d] text-white flex items-center shrink-0 w-full relative z-10 border-b border-[#002244]">
        
        {/* Question Status Title Block */}
        <div className="w-[110px] h-full bg-white text-black border border-black flex items-center justify-center text-[11px] font-bold leading-tight text-center shrink-0 shadow-[inset_0_0_2px_rgba(0,0,0,0.5)]">
          Question<br/>Status
        </div>
        
        {/* Item & Block Info */}
        <div className="flex flex-col text-[13px] font-bold leading-tight px-4 min-w-[120px]">
          <div>Item: {currentIndex + 1} of {session.questions.length}</div>
          <div>Block: 1 of 6</div>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 flex items-center justify-center gap-6">
          <button 
            onClick={handlePrev} 
            disabled={currentIndex === 0}
            className="flex flex-col items-center disabled:opacity-50 hover:bg-[#1a5f94] p-0.5 rounded transition-colors"
          >
            <ArrowLeftCircle size={24} fill="white" stroke="#003b6d" strokeWidth={1} className="drop-shadow-sm" />
            <span className="text-[10px] font-bold mt-0.5">{t('Previous')}</span>
          </button>
          
          <div className="text-[16px] font-bold tracking-wide mt-[-10px]">
            {currentIndex + 1} / {session.questions.length}
          </div>
          
          <button 
            onClick={handleNext} 
            className="flex flex-col items-center hover:bg-[#1a5f94] p-0.5 rounded transition-colors"
          >
            <ArrowRightCircle size={24} fill="white" stroke="#003b6d" strokeWidth={1} className="drop-shadow-sm" />
            <span className="text-[10px] font-bold mt-0.5">{t('Next')}</span>
          </button>
        </div>
        
        {/* Tools */}
        <div className="flex items-center h-full px-2 gap-0.5">
          <button onClick={() => setShowLabValues(true)} className="flex flex-col items-center justify-center w-[60px] h-full hover:bg-[#1a5f94] transition-colors rounded">
            <FlaskConical size={20} className="mb-0.5" />
            <span className="text-[10px] font-bold">{t('Lab Values')}</span>
          </button>
          <button onClick={() => setShowNotes(true)} className="flex flex-col items-center justify-center w-[60px] h-full hover:bg-[#1a5f94] transition-colors rounded">
            <PenLine size={20} className="mb-0.5" />
            <span className="text-[10px] font-bold">{t('Notes')}</span>
          </button>
          <button onClick={() => setShowCalculator(true)} className="flex flex-col items-center justify-center w-[60px] h-full hover:bg-[#1a5f94] transition-colors rounded">
            <CalcIcon size={20} className="mb-0.5" />
            <span className="text-[10px] font-bold">{t('Calculator')}</span>
          </button>
          <button onClick={() => setSettingsMenuOpen(!settingsMenuOpen)} className="flex flex-col items-center justify-center w-[60px] h-full hover:bg-[#1a5f94] transition-colors rounded relative">
            <SettingsIcon size={20} className="mb-0.5" />
            <span className="text-[10px] font-bold">{t('Settings')}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Question List Sidebar */}
        <aside className="w-[110px] bg-white border-r border-gray-300 flex flex-col shrink-0 overflow-y-auto overflow-x-hidden pt-0.5">
          {questions.map((q, idx) => {
            const isActive = idx === currentIndex;
            const isAnswered = !!q.selectedOptionId;
            const isFlagged = q.isFlagged;
            
            return (
              <div 
                key={q.id}
                onClick={() => navigateToIndex(idx)}
                className={`flex items-center px-1.5 py-1 text-[12px] font-bold cursor-pointer border-b border-gray-100 ${isActive ? 'bg-[#3399ff] text-white' : 'hover:bg-gray-100 text-black'}`}
              >
                <div className="w-[18px] flex items-center justify-center gap-[1px] shrink-0 mr-1.5">
                  {isAnswered && <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : 'bg-black'} shrink-0`} />}
                  {isFlagged && <Flag size={10} className={`${isActive ? 'fill-white text-white' : 'fill-[#cc0000] text-[#cc0000]'} shrink-0`} />}
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <span className={`text-[13px] ${isActive ? 'text-white' : 'text-gray-800'}`}>{idx + 1}</span>
                  {isActive && <span className="text-white font-black text-[14px] ml-1 flex items-center justify-center -mr-1">▶</span>}
                </div>
              </div>
            );
          })}
        </aside>

        {/* Content Pane */}
        <main className="flex-1 flex flex-col overflow-y-auto p-4 pl-6 relative pb-20">
          
          <div className="flex justify-between items-start mb-6">
             {/* Mark Question Checkbox */}
             <label className="flex items-center gap-1.5 cursor-pointer">
              <input 
                type="checkbox" 
                checked={currentQ.isFlagged}
                onChange={() => {
                  const nextFlagged = !currentQ.isFlagged;
                  updateCurrentQuestionState({ isFlagged: nextFlagged });
                  scheduleAutosave(currentQ.id, { isFlagged: nextFlagged });
                }}
                className="w-3.5 h-3.5 accent-[#cc0000] outline-none border border-gray-400"
              />
              <span className="text-[13px] text-[#cc0000] flex items-center gap-1 font-bold">
                 <Flag size={13} className="fill-[#cc0000]" />
                 Mark Question
              </span>
             </label>
          </div>

          <div className="flex flex-1">
             
             {/* Vignette & Options */}
             <div className="flex-1 pr-8 flex flex-col max-w-[800px]">
                <HighlightWrapper 
                  html={sanitizeHTML(currentQ.highlightedQuestionText || currentQ.question.questionText)}
                  highlights={highlights}
                  section="stem"
                  className="vignette-text text-[15px] leading-relaxed mb-6 font-medium text-black"
                />
                {settings.targetLanguage && translatedData && (
                  <div className="mt-4 mb-6 p-4 bg-gray-100 border border-gray-300">
                    <div className="text-[10px] font-bold text-gray-600 uppercase mb-2">Translation</div>
                    <HighlightWrapper 
                      html={translatedData.questionText}
                      highlights={highlights}
                      section="stem"
                      className="vignette-text text-[15px] leading-relaxed font-medium text-black"
                    />
                  </div>
                )}

                {/* NBME Options Box */}
                <div className="border border-[#4477aa] w-[450px]">
                  <fieldset className="flex flex-col p-0.5">
                    {currentQ.question.options.map((opt, i) => {
                      const isSelected = currentQ.selectedOptionId === opt.id;
                      const isStruckThrough = currentQ.strikethroughs?.includes(opt.id);
                      
                      return (
                        <div key={opt.id} className="flex items-start group hover:bg-gray-100 py-2 px-2 relative">
                          <div className="flex items-start flex-1 cursor-pointer" onClick={() => !showFeedback && handleOptionSelect(opt.id)}>
                            <input 
                              type="radio" 
                              name={`q-nbme-${currentQ.id}`}
                              checked={isSelected}
                              onChange={() => handleOptionSelect(opt.id)}
                              disabled={!!showFeedback}
                              className="mt-1 w-3.5 h-3.5 accent-black cursor-pointer shadow-sm"
                            />
                            <div className="ml-3 flex-1 flex flex-col">
                              <div className={`flex items-start ${isStruckThrough ? 'line-through text-gray-500' : 'text-black'}`}>
                                <span className="mr-2 font-medium text-[15px]">{String.fromCharCode(65 + i)}.</span>
                                <div className="leading-relaxed [&>p]:inline text-[15px]" dangerouslySetInnerHTML={{ __html: sanitizeHTML(opt.text) }} />
                              </div>
                            </div>
                          </div>
                          
                          {session.mode !== 'review' && (
                            <button 
                              type="button"
                              onClick={() => toggleStrikethrough(opt.id)}
                              disabled={showFeedback}
                              className="ml-2 text-gray-400 hover:text-black opacity-0 group-hover:opacity-100 absolute right-2 top-2"
                            >
                              <span className="text-[13px] font-bold line-through">ab</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </fieldset>

                  {/* Show Answer button */}
                  {session.mode === 'tutor' && !showFeedback && (
                    <div className="p-2 border-t border-[#4477aa] bg-white">
                       <button onClick={() => alert("Please select an option to see the answer.")} className="border border-black bg-[#e0e0e0] px-3 py-1 text-[12px] font-bold hover:bg-[#d0d0d0] shadow-sm active:bg-gray-300">
                          Show Answer
                       </button>
                    </div>
                  )}
                </div>

                {/* Explanations */}
                {showFeedback && (
                  <div className="mt-8 pt-4 border-t border-gray-400">
                    <div className="font-bold mb-2 uppercase text-[13px] text-black">Explanation:</div>
                    <div 
                      ref={explanationContentRef}
                      className="leading-relaxed text-[14px] text-black"
                      dangerouslySetInnerHTML={{ __html: sanitizeHTML(currentQ.highlightedExplanation || currentQ.question.explanation || '') }}
                    />
                  </div>
                )}
                
                {/* Proceed Button */}
                <div className="mt-10">
                  <button onClick={handleNext} className="bg-[#0055a4] text-white px-5 py-2 text-[13px] font-bold rounded shadow-md border border-[#003b6d] hover:bg-[#004b87] active:bg-[#003b6d] transition-colors">
                    {t('Next')} Item
                  </button>
                </div>

             </div>

             {/* NBME Exhibit Side */}
             {currentQ.question.media && currentQ.question.media.length > 0 && (
               <div className="w-[450px] shrink-0 pl-4">
                 {currentQ.question.media.map(m => (
                   <div key={m.id} className="relative border-4 border-[#004b87]/10 shadow-[0_4px_12px_rgba(0,0,0,0.15)] bg-white p-[1px] mb-4">
                     <div className="bg-[#0000cc] w-full flex items-center justify-center overflow-hidden border border-gray-400">
                       <MediaRenderer media={{ ...m, caption: translatedData?.media?.find(tm => tm.id === m.id)?.caption || m.caption }} setZoomImage={setZoomImage} />
                     </div>
                     {/* Floating NBME Tools */}
                     <div className="absolute bottom-1 left-1 bg-white/95 border border-gray-300 shadow-sm rounded-sm flex flex-col p-1 gap-1 w-12 z-10">
                        <button className="flex flex-col items-center justify-center py-1.5 hover:bg-gray-100 rounded border border-transparent hover:border-gray-200">
                           <div className="w-3.5 h-3.5 bg-black transform rotate-45 text-white overflow-hidden mb-1">
                              <div className="w-full h-1/2 bg-white absolute top-0 left-0 transform -rotate-45 -translate-y-1"></div>
                           </div>
                           <span className="text-[9px] font-bold text-gray-800">Invert</span>
                        </button>
                        <button className="flex flex-col items-center justify-center py-1.5 hover:bg-gray-100 rounded border border-transparent hover:border-gray-200">
                           <div className="text-[16px] leading-none mb-1 text-gray-800">☼</div>
                           <span className="text-[9px] font-bold text-gray-800">Contrast</span>
                        </button>
                        <button 
                           className="flex flex-col items-center justify-center py-1.5 hover:bg-gray-100 rounded border border-transparent hover:border-gray-200"
                           onClick={() => setZoomImage(m.url)}
                        >
                           <div className="text-[16px] leading-none mb-1 text-gray-800">⊕</div>
                           <span className="text-[9px] font-bold text-gray-800">Zoom</span>
                        </button>
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </main>
      </div>
      
      {/* NBME Footer */}
      <footer className="h-[38px] bg-[#003b6d] text-white flex items-center justify-between px-3 shrink-0 border-t border-[#002244]">
         <div className="flex flex-col text-[11px] font-bold leading-tight mt-0.5">
            <div className="flex gap-1 items-center">
               <span>Block Time Remaining:</span>
               {settings.showTimer !== false ? (
                 <TimerDisplay 
                   initialElapsed={0} 
                   initialTimeLeft={session.durationSec ? Math.max(0, session.durationSec - initialElapsed) : null} 
                   isTimed={true} 
                   isPaused={isPaused}
                   onTimeUp={handleEndBlock} 
                   type="remaining"
                   className="font-bold"
                 />
               ) : (
                 <span>--:--</span>
               )}
            </div>
            <div className="flex gap-1 text-[#a0c8e6] items-center">
               <span>Day Time Remaining:</span>
               <span>3:29:48</span>
            </div>
         </div>

         <button onClick={() => setIsPaused(true)} className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center text-[#a0c8e6] hover:text-white transition-colors">
            <svg className="mb-0.5 w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            <span className="text-[9px] font-bold uppercase tracking-wider">Lock</span>
         </button>

         <button onClick={handleEndBlock} className="flex flex-col items-center justify-center text-[#ff3333] hover:text-[#ff6666] transition-colors gap-0.5">
            <XCircle size={16} fill="white" stroke="#ff3333" />
            <span className="text-[9px] font-bold">{t('End Block')}</span>
         </button>
      </footer>
    </div>
  );


  return (
    <>
      <HighlightToolbar 
        rect={selectionRect} 
        onHighlight={addHighlight} 
      />
      {settings.appTheme === 'NBME' ? renderNbmeTheme() : renderMqbTheme()}
    </>
  );
}