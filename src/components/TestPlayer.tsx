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
  
  const [showSecurityWarning, setShowSecurityWarning] = useState(session.mode !== 'review');


  
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

      const trigger = target.closest('.exhibit-trigger') as HTMLElement;
      if (trigger && trigger.dataset.url) {
        e.preventDefault();
        e.stopPropagation();
        setZoomImage(trigger.dataset.url);
        return;
      }

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

  return (
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
          <header className={`h-[56px] flex items-center justify-between px-4 shrink-0 select-none border-b ${headerFooterBg} ${headerFooterText}`}>
            
            {/* Left Block Info & Font Tools */}
            <div className="flex items-center gap-4 px-2">
              <div className={`flex flex-col text-[12px] font-semibold leading-tight`}>
                <div className="text-slate-500 text-[10px] uppercase tracking-wider">Item {currentIndex + 1} of {session.questions.length}</div>
                <div className="text-slate-700">Block 1</div>
              </div>
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
            <div className="flex h-full">
              {session.mode === 'timed' && (
                <button 
                  onClick={() => setIsPaused(true)}
                  className="flex flex-col items-center justify-center h-full px-4 pt-1 border-b-0 rounded-t-sm text-slate-500 border-transparent hover:text-slate-900 hover:bg-slate-50 mr-2"
                >
                  <div className="leading-none mb-0.5"><Clock size={18} /></div>
                  <span className="text-[11px] font-bold pb-1">Pause</span>
                </button>
              )}
              {[
                { 
                  name: 'Highlight', 
                  icon: <Highlighter size={18} />, 
                  action: (e: any) => applyTextFormatting('highlight'), 
                  active: false,
                  render: (isActive: boolean, toolBg: string, toolBorder: string) => (
                    <div key="Highlight" className="relative group h-full flex">
                      <button 
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => applyTextFormatting('highlight')}
                        className={`flex flex-col items-center justify-center h-full px-3 pt-1 border-b-0 rounded-t-sm ${toolBg} ${toolBorder}`}
                      >
                        <div className="leading-none mb-0.5 relative">
                          <Highlighter size={18} />
                          <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border border-gray-400" style={{ backgroundColor: highlightColor }}></div>
                        </div>
                        <span className="text-[11px] font-bold pb-1">Highlight</span>
                      </button>
                      <div className="absolute top-full left-0 hidden group-hover:flex bg-white shadow-lg border border-slate-200 rounded p-1.5 gap-1 z-50">
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
                            className={`w-6 h-6 flex items-center justify-center rounded-full border border-gray-300 hover:scale-110 transition-transform ${highlightColor === c.color ? 'ring-2 ring-primary ring-offset-1' : ''}`}
                            style={{ backgroundColor: c.color === 'transparent' ? '#f8fafc' : c.color }}
                            title={c.name}
                          >
                            {c.color === 'transparent' && <span className="text-red-500 font-bold text-xs">/</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                },
                { name: 'Strike', icon: <Strikethrough size={18} />, action: (e: any) => applyTextFormatting('strikethrough'), active: false },
                { name: 'Report Issue', icon: <AlertTriangle size={18} />, action: (e: any) => setShowReportModal(true), active: showReportModal },
                { name: 'Lab Values', icon: <FlaskConical size={18} />, action: (e: any) => setShowLabValues(true), active: showLabValues },
                { name: 'Notes', icon: <PenLine size={18} />, action: (e: any) => setShowNotes(true), active: showNotes },
                { name: 'Calculator', icon: <CalcIcon size={18} />, action: (e: any) => setShowCalculator(true), active: showCalculator },
                { name: 'Settings', icon: <SettingsIcon size={18} />, action: (e: any) => setSettingsMenuOpen(true), active: settingsMenuOpen }
              ].map(tool => {
                const isActive = tool.active;
                const toolBg = isActive 
                  ? (isDark ? 'bg-slate-800 border-t border-l border-r border-slate-700 text-slate-100' : 'bg-slate-50 text-slate-900 border-t border-l border-r border-slate-200 rounded-t-lg')
                  : (isDark ? 'text-slate-400 border-transparent hover:text-slate-200' : 'text-slate-500 border-transparent hover:text-slate-900 hover:bg-slate-50 rounded-t-lg');
                const toolBorder = '';

                if (tool.render) {
                  return tool.render(isActive, toolBg, toolBorder);
                }

                return (
                  <button 
                    key={tool.name}
                    onMouseDown={(e) => e.preventDefault()}
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

          <main 
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
              <div className={`flex flex-1 ${settings.splitScreen ? 'flex-row' : 'flex-col pr-6'}`}>
                
                {/* Vignette Wrapper */}
                <div className={`${settings.splitScreen ? 'flex-1 overflow-y-auto pr-6 border-r border-gray-300 mr-6' : ''}`}>
                  <div 
                    ref={questionContentRef}
                    className={`vignette-text leading-relaxed cursor-text mb-6 [&_*]:text-[length:inherit] ${settings.highContrast ? 'text-black font-medium' : ''}`}
                    dangerouslySetInnerHTML={{ __html: sanitizeHTML(currentQ.highlightedQuestionText || currentQ.question.questionText) }}
                  />
                </div>
                
                {/* Options & Explanations Wrapper */}
                <div className={`${settings.splitScreen ? 'flex-1 overflow-y-auto pr-2' : ''}`}>
                  {/* Options List */}
                  <div className={settings.answerLayout === 'compact' ? 'space-y-2' : 'space-y-4'}>
                    <fieldset className={`border ${settings.highContrast ? (isDark ? 'border-gray-500' : 'border-gray-400 border-2') : borderCol} ${settings.answerLayout === 'compact' ? 'p-3' : 'p-5'} rounded-xl ${isDark ? 'bg-slate-900' : 'bg-white'} shadow-sm`}>
                      {currentQ.question.options.map((opt, i) => {
                        const isSelected = currentQ.selectedOptionId === opt.id;
                        const isStruckThrough = currentQ.strikethroughs?.includes(opt.id);
                        
                        let bgClass = "bg-transparent";
                        if (showFeedback && opt.isCorrect) {
                          bgClass = isDark ? 'bg-green-900' : (settings.highContrast ? 'bg-[#005a00] text-white' : 'bg-[#008000] text-white');
                        } else if (showFeedback && isSelected) {
                          bgClass = isDark ? 'bg-red-900' : (settings.highContrast ? 'bg-[#d9534f] text-white' : 'bg-[#f8d7da]');
                        }

                        return (
                          <div key={opt.id} className={`flex items-start justify-between group ${bgClass} ${settings.answerLayout === 'compact' ? 'p-0.5' : 'p-1'} rounded transition-colors`}>
                            <div className="flex items-start flex-1 cursor-pointer" onClick={() => !showFeedback && handleOptionSelect(opt.id)}>
                              <input 
                                type="radio" 
                                name={`q-${currentQ.id}`}
                                checked={isSelected}
                                onChange={() => handleOptionSelect(opt.id)}
                                disabled={!!showFeedback}
                                className={`mt-1 w-4 h-4 cursor-pointer accent-black shrink-0 ${settings.highContrast ? 'ring-1 ring-black' : ''}`}
                              />
                              <div className="ml-3 flex-1 flex flex-col">
                                <div className={`flex items-center ${isStruckThrough ? 'line-through opacity-50' : ''}`}>
                                  <span className={`mr-2 ${settings.highContrast ? 'font-black' : ''}`}>{String.fromCharCode(65 + i)}.</span>
                                  {settings.showShortcuts && !showFeedback && (
                                    <kbd className="mr-2 px-1 border border-gray-400 rounded text-[9px] text-gray-500 bg-gray-50 font-mono hidden sm:inline-block">
                                      {String.fromCharCode(65 + i)}
                                    </kbd>
                                  )}
                                  <div className={`leading-snug [&>p]:inline ${settings.highContrast ? 'text-black font-medium' : ''}`} dangerouslySetInnerHTML={{ __html: sanitizeHTML(opt.text) }} />
                                </div>
                                {showFeedback && (opt as any).explanation && (
                                  <div className={`mt-2 text-[13px] ${settings.highContrast ? 'text-black bg-gray-100 border-gray-400' : 'text-gray-800 bg-gray-50 border-gray-200'} p-2 rounded border`}>
                                    <div dangerouslySetInnerHTML={{ __html: sanitizeHTML((opt as any).explanation) }} />
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Strike Through Button */}
                            {session.mode !== 'review' && (
                              <button 
                                type="button"
                                onClick={() => toggleStrikethrough(opt.id)}
                                disabled={showFeedback}
                                aria-label={isStruckThrough ? `Remove strikethrough from option ${String.fromCharCode(65 + i)}` : `Strike out option ${String.fromCharCode(65 + i)}`}
                                aria-pressed={!!isStruckThrough}
                                className={`ml-4 p-1 rounded transition-all shrink-0 ${settings.highContrast ? 'text-gray-800' : 'text-slate-400'} hover:text-slate-900 hover:bg-slate-200/50
                                  opacity-70 sm:opacity-50
                                  sm:group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100 focus-visible:opacity-100 hover:!opacity-100
                                  disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:!opacity-20 disabled:hover:bg-transparent`}
                                title="Strike out option"
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
                  
                  {/* Proceed Button */}
                  <div className="mt-8 pb-10 flex items-center">
                    <button onClick={handleNext} className="bg-slate-900 text-white px-6 py-2.5 text-[14px] font-bold rounded-lg shadow-sm hover:bg-slate-800 hover:shadow-md transition-all">
                      Proceed to Next Item
                    </button>
                    {settings.showShortcuts && (
                      <kbd className="ml-3 px-2 py-1 border border-gray-400 rounded text-[11px] text-gray-500 bg-white font-mono hidden sm:inline-block">
                        Space
                      </kbd>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Media Side */}
              {currentQ.question.media && currentQ.question.media.length > 0 && (
                <div className="w-[400px] shrink-0 pl-4">
                  <div className="border border-gray-400 shadow-[4px_4px_10px_rgba(0,0,0,0.2)] bg-white p-1 flex">
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
          <span className="text-[10px] font-bold">End Block</span>
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
}