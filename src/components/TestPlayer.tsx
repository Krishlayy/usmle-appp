'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useVirtualizer } from '@tanstack/react-virtual';
import dynamic from 'next/dynamic';
import { HelpCircle, TestTubes, FileText, Calculator as CalcIcon, Settings as SettingsIcon, ChevronLeft, ChevronRight, Bookmark, X, Clock, FlaskConical, PenLine, ArrowLeftCircle, ArrowRightCircle, Lock, XCircle, Flag, Strikethrough, AlertTriangle, Highlighter, Pause, Sparkles, Sun, ZoomIn } from 'lucide-react';
import { MediaRenderer } from '@/components/MediaRenderer';
import { VideoMnemonicPlayer } from '@/components/VideoMnemonicPlayer';
import { QuestionNotesModal } from './QuestionNotesModal';
import { TestSettingsProvider, useTestSettings, TestSettings } from '@/components/TestSettingsProvider';
import { Button } from '@/components/ui/Button';
import { TestSecurityWarning } from '@/components/TestSecurityWarning';
import { ExhibitDisplay } from './ExhibitDisplay';
import { TestTutorial } from './TestTutorial';
import DOMPurify from 'isomorphic-dompurify';
import { TimerDisplay, QuestionTimerDisplay } from '@/features/test-player/components/Timers';


import { useTestPlayerStore } from '@/store/useTestPlayerStore';
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
  isYellowDistractor?: boolean;
  explanation: string | null;
};

type Question = {
  id: string;
  qid: string;
  questionText: string;
  explanation: string | null;
  acceptableAnswers: string[];
  tags: string[];
  videoUrl?: string | null;
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
  blockNumber?: number;
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

      // Fire all pending saves in parallel — don't let one slow request block others
      const results = await Promise.allSettled(
        queue.map((item: any) =>
          fetch(`/api/test-sessions/${session.id}/autosave`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
          }).then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return true;
          })
        )
      );

      const remaining = queue.filter((_: any, idx: number) => results[idx].status === 'rejected');
      if (remaining.length === 0) {
        localStorage.removeItem(`sync-queue-${session.id}`);
      } else {
        localStorage.setItem(`sync-queue-${session.id}`, JSON.stringify(remaining));
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
  const [showEndBlockWarning, setShowEndBlockWarning] = useState(false);
  const [showUnauthorizedBreakWarning, setShowUnauthorizedBreakWarning] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [previewImageInvert, setPreviewImageInvert] = useState(false);
  const [previewImageContrast, setPreviewImageContrast] = useState(100);
  const [tutorRevealedMap, setTutorRevealedMap] = useState<Record<string, boolean>>({});
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
  const autoNextTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Single source of truth for "answer feedback is currently visible"
  // In tutor mode: only visible after submitting / revealing with "Show Answer"
  const showFeedback = session.mode === 'review' || (session.mode === 'tutor' && !!currentQ?.selectedOptionId && !!tutorRevealedMap[currentQ?.id]);

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

    const isMock = session.id.startsWith('usmle-exam-');
    if (isMock) {
      try {
        localStorage.setItem(`mock_session_results_${session.id}`, JSON.stringify({
          sessionId: session.id,
          qbankSlug: session.qbankSlug,
          mode: session.mode,
          durationSec: session.durationSec,
          questions: finalQuestions,
          completedAt: new Date().toISOString(),
        }));
      } catch (e) {
        console.error('Failed to store mock session results', e);
      }
      setSubmitting(false);
      router.push(`/dashboard/${session.qbankSlug}/session/${session.id}/results`);
      router.refresh();
      return;
    }

    try {
      await fetch(`/api/test-sessions/${session.id}/submit`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: finalQuestions })
      });
    } catch (err) {
      console.error('Error submitting session:', err);
    } finally {
      setSubmitting(false);
      router.push(`/dashboard/${session.qbankSlug}/session/${session.id}/results`);
      router.refresh();
    }
  }, [session.id, session.qbankSlug, session.mode, session.durationSec, router, flushPendingSaves, commitElapsedTime]);

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
      const target = e.target as HTMLElement | null;
      const isTextInput = target && (
        target.tagName === 'TEXTAREA' ||
        (target.tagName === 'INPUT' && !['radio', 'checkbox', 'button'].includes((target as HTMLInputElement).type?.toLowerCase())) ||
        target.isContentEditable
      );
      if (isTextInput) return;
      if (settingsMenuOpen || omissionWarning || showCalculator) return;
      
      const key = e.key.toLowerCase();
      if ((e.altKey && key === 'p') || key === 'arrowleft') {
        e.preventDefault();
        handlePrev();
      } else if ((e.altKey && key === 'n') || key === 'arrowright') {
        e.preventDefault();
        handleNext();
      } else if (e.altKey && key === 'm') {
        e.preventDefault();
        handleToggleFlag();
      } else if (e.altKey && key === 'c') {
        e.preventDefault();
        setShowCalculator(prev => !prev);
      } else if (e.altKey && key === 'l') {
        e.preventDefault();
        setShowLabValues(prev => !prev);
      } else if (e.altKey && key === 'r') {
        e.preventDefault();
        updateSetting('colorTheme', settings.colorTheme === 'dark' ? 'light' : 'dark');
      } else if (key === ' ') {
        e.preventDefault();
        handleToggleFlag();
      } else if (!e.altKey && !e.ctrlKey && !e.metaKey && ['a', 'b', 'c', 'd', 'e', 'f', 'g'].includes(key)) {
        if (!showFeedback && session.mode !== 'review') {
          const optionIndex = key.charCodeAt(0) - 97;
          const option = currentQ.question.options[optionIndex];
          if (option) handleOptionSelect(option.id);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, currentQ, questions, settingsMenuOpen, omissionWarning, showCalculator, settings.colorTheme, updateSetting, showFeedback, session.mode]);

  const updateCurrentQuestionState = (updates: Partial<SessionQuestion>) => {
    setQuestions(prev => prev.map((q, i) => i === currentIndex ? { ...q, ...updates } : q));
  };

  const handleToggleFlag = () => {
    const nextFlagged = !currentQ.isFlagged;
    updateCurrentQuestionState({ isFlagged: nextFlagged });
    scheduleAutosave(currentQ.id, { isFlagged: nextFlagged });
  };

  const handleOptionSelect = (optionId: string) => {
    // In tutor mode, allow selecting and changing options freely until answer is submitted/revealed
    if (showFeedback || session.mode === 'review') return;

    const selectedOption = currentQ.question.options.find(o => o.id === optionId);
    const isCorrect = selectedOption?.isCorrect ?? false;

    // Auto-remove strikethrough if student picks this option
    const currentStrikes = currentQ.strikethroughs || [];
    const newStrikes = currentStrikes.filter(id => id !== optionId);

    // Finalize whatever time has accumulated up to this exact moment into timeTakenSec
    commitElapsedTime();
    updateCurrentQuestionState({ selectedOptionId: optionId, isCorrect, strikethroughs: newStrikes });
    scheduleAutosave(currentQ.id, { selectedOptionId: optionId, isCorrect, strikethroughs: newStrikes });

    if (settings.autoNext && session.mode === 'timed') {
      if (autoNextTimeoutRef.current) {
        clearTimeout(autoNextTimeoutRef.current);
      }
      autoNextTimeoutRef.current = setTimeout(() => {
        handleNext();
      }, 400);
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
    
    commitElapsedTime();
    setShowEndBlockWarning(true);
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
  const isReverseColor = isDark;
  const isSepia = false;
  
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

  const renderUworldTheme = () => {
    const unansweredCount = questions.filter(q => !q.selectedOptionId).length;

    return (
      <div className="flex flex-col h-screen overflow-hidden font-sans bg-white text-slate-900 select-text">
        
        {/* Fullscreen Pause / Unauthorized Break Overlay */}
        {isPaused && (
          <div className="fixed inset-0 z-50 bg-[#001f3f]/95 flex flex-col items-center justify-center backdrop-blur-md">
            <div className="bg-white p-8 rounded shadow-2xl text-center max-w-md w-full border border-slate-300">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6 text-[#003366]" />
              </div>
              <h2 className="text-xl font-bold text-[#003366] mb-2">Exam Locked - Break in Progress</h2>
              <p className="text-slate-600 mb-6 text-xs leading-relaxed">
                The exam timer is paused and items are hidden to protect test security.
              </p>
              <button 
                type="button"
                onClick={() => setIsPaused(false)}
                className="w-full bg-[#003366] hover:bg-[#002244] text-white font-bold py-2.5 px-6 rounded text-sm shadow transition-colors cursor-pointer"
              >
                Resume Exam
              </button>
            </div>
          </div>
        )}

        {/* TOP HEADER BAR - Authentic Deep Navy Blue */}
        <header className="h-[48px] bg-[#003366] text-white flex items-center justify-between px-4 shrink-0 select-none border-b border-[#002244] shadow-sm z-20">
          
          {/* Left Column: Authentic Item/Block Box */}
          <div className="flex items-center">
            <div className="border border-[#2a6699] bg-[#002244] text-white px-3 py-1 flex flex-col justify-center rounded-xs text-[11px] leading-tight select-none">
              <span className="font-semibold">Item: {currentIndex + 1} of {session.questions.length}</span>
              <span className="text-slate-300">Block: {session.blockNumber ?? 1} of 1</span>
            </div>
          </div>
          
          {/* Center Column: Navigation Arrows & Counter */}
          <div className="flex items-center gap-6 select-none">
            <button 
              type="button"
              onClick={handlePrev} 
              disabled={currentIndex === 0} 
              className="flex flex-col items-center text-white disabled:opacity-30 hover:text-cyan-300 transition-colors cursor-pointer disabled:cursor-not-allowed"
              title="Previous Item"
            >
              <ArrowLeftCircle size={20} strokeWidth={1.8} />
              <span className="text-[10px] font-bold mt-0.5">Previous</span>
            </button>
            
            <div className="text-[14px] font-bold tracking-wider text-white font-mono">
              {currentIndex + 1} / {session.questions.length}
            </div>
            
            <button 
              type="button"
              onClick={handleNext} 
              className="flex flex-col items-center text-white hover:text-cyan-300 transition-colors cursor-pointer"
              title="Next Item"
            >
              <ArrowRightCircle size={20} strokeWidth={1.8} />
              <span className="text-[10px] font-bold mt-0.5">Next</span>
            </button>
          </div>
          
          {/* Right Column: Authentic USMLE Tool Icons */}
          <div className="flex items-center gap-3 select-none">
            <button 
              type="button"
              onClick={() => setShowLabValues(true)}
              className="flex flex-col items-center justify-center px-2 py-0.5 text-white hover:text-cyan-300 transition-colors cursor-pointer"
              title="Laboratory Values Reference"
            >
              <FlaskConical size={18} strokeWidth={1.8} />
              <span className="text-[10px] font-bold mt-0.5">Lab Values</span>
            </button>

            <button 
              type="button"
              onClick={() => setShowNotes(true)}
              className="flex flex-col items-center justify-center px-2 py-0.5 text-white hover:text-cyan-300 transition-colors cursor-pointer relative"
              title="Question Notes"
            >
              <PenLine size={18} strokeWidth={1.8} />
              <span className="text-[10px] font-bold mt-0.5">Notes</span>
              {currentQ.notes && (
                <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-amber-400" />
              )}
            </button>

            <button 
              type="button"
              onClick={() => setShowCalculator(true)}
              className="flex flex-col items-center justify-center px-2 py-0.5 text-white hover:text-cyan-300 transition-colors cursor-pointer"
              title="Standard Calculator"
            >
              <CalcIcon size={18} strokeWidth={1.8} />
              <span className="text-[10px] font-bold mt-0.5">Calculator</span>
            </button>

            <button 
              type="button"
              onClick={() => updateSetting('colorTheme', settings.colorTheme === 'dark' ? 'light' : 'dark')}
              className="flex flex-col items-center justify-center px-2 py-0.5 text-white hover:text-cyan-300 transition-colors cursor-pointer"
              title="Reverse Color (USMLE Invert / Night Mode)"
            >
              <div className="w-4 h-4 rounded-xs border border-white/80 overflow-hidden flex shadow-2xs">
                <div className="w-1/2 h-full bg-white"></div>
                <div className="w-1/2 h-full bg-slate-900"></div>
              </div>
              <span className="text-[10px] font-bold mt-0.5">Reverse</span>
            </button>

            <button 
              type="button"
              onClick={() => setSettingsMenuOpen(true)}
              className="flex flex-col items-center justify-center px-2 py-0.5 text-white hover:text-cyan-300 transition-colors cursor-pointer"
              title="Settings"
            >
              <SettingsIcon size={18} strokeWidth={1.8} />
              <span className="text-[10px] font-bold mt-0.5">Settings</span>
            </button>
          </div>
          
        </header>

        {/* MIDDLE SECTION - Left Question Status Sidebar + Main Question Content */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Left "Question Status" Navigation Sidebar */}
          <aside className="w-[50px] flex flex-col shrink-0 overflow-hidden border-r border-slate-300 bg-white select-none">
            {/* Top Navy Header */}
            <div className="h-[36px] bg-[#003366] text-white flex flex-col items-center justify-center text-[9px] font-bold uppercase tracking-wider leading-tight text-center border-b border-[#002244]">
              Question<br />Status
            </div>
            
            {/* Numbered Rows */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {questions.map((q, idx) => {
                const isActive = idx === currentIndex;
                const isAnswered = !!q.selectedOptionId;
                const isFlagged = q.isFlagged;
                const hasNotes = !!q.notes && q.notes.trim() !== '';

                return (
                  <div 
                    key={q.id}
                    onClick={() => navigateToIndex(idx)}
                    title={hasNotes ? `Note: ${q.notes}` : undefined}
                    className={`flex items-center justify-between px-1.5 h-6 text-[11px] font-medium cursor-pointer transition-colors relative ${
                      isActive 
                        ? 'bg-[#0078d7] text-white font-bold' 
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-0.5 shrink-0">
                      {isAnswered && (
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-slate-900'}`} title="Answered" />
                      )}
                      {isFlagged && (
                        <Flag size={9} className="fill-red-500 text-red-500 shrink-0" title="Marked" />
                      )}
                      {hasNotes && (
                        <PenLine size={9} className={`${isActive ? 'text-white' : 'text-amber-600'} shrink-0`} title={q.notes || 'Notes'} />
                      )}
                    </div>
                    <span className="font-mono text-[11px]">{idx + 1}</span>
                  </div>
                );
              })}
            </div>

            {/* Bottom Key Button */}
            <button 
              type="button"
              onClick={() => setShowKeyModal(true)}
              className="h-6 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold flex items-center justify-center border-t border-slate-300 transition-colors cursor-pointer"
            >
              Key
            </button>
          </aside>

          {/* Center Main Question Panel */}
          <main 
            ref={testPlayerMainRef}
            className={`flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 select-text cursor-text transition-colors ${isReverseColor ? 'bg-[#18181b] text-slate-100' : 'bg-white text-slate-900'}`}
            style={{ fontSize: `${settings.fontSize}px`, lineHeight: 1.5 }}
          >
            {/* Centered Maximum Reading Workspace (Centered on all monitors) */}
            <div className="w-full max-w-7xl mx-auto">

              {/* Mark Question Checkbox Row */}
              <div className="flex items-center mb-4 select-none">
                <label className="flex items-center gap-2 cursor-pointer group">
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
                  <Flag size={15} className={currentQ.isFlagged ? "fill-red-600 text-red-600" : "text-slate-400 group-hover:text-red-500"} />
                  <span className={`text-[13px] font-bold hover:underline ${isReverseColor ? 'text-slate-200' : 'text-slate-800'}`}>Mark Question</span>
                </label>
              </div>

              {/* Two-Column Area: Question + Optional Exhibit Display */}
              <div className={`grid gap-8 items-start ${currentQ.question.media && currentQ.question.media.length > 0 ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1 max-w-4xl mx-auto'}`}>
                
                {/* Question Stem and Options */}
                <div className={`${currentQ.question.media && currentQ.question.media.length > 0 ? 'lg:col-span-7 xl:col-span-8' : ''} w-full`}>
                  {/* Question Stem Text */}
                  <div 
                    ref={questionContentRef}
                    dangerouslySetInnerHTML={{ 
                      __html: sanitizeHTML(
                        (currentQ.question.media && currentQ.question.media.length > 0)
                          ? (currentQ.highlightedQuestionText || currentQ.question.questionText).replace(/<img[^>]*>/gi, '')
                          : (currentQ.highlightedQuestionText || currentQ.question.questionText)
                      ) 
                    }}
                    className={`vignette-text text-[15px] leading-relaxed cursor-text mb-6 font-sans select-text selection:bg-teal-100 selection:text-teal-900 ${isReverseColor ? 'text-slate-100 [&_*]:!text-slate-100' : 'text-slate-900'}`}
                  />

          {/* Authentic Framed Options Box with Light-Blue Border */}
                  <div className={`border p-4 rounded-xs shadow-2xs mb-4 select-text ${
                    settings.highContrast
                      ? isReverseColor ? 'border-2 border-white bg-black text-white font-bold' : 'border-2 border-black bg-white text-black font-bold'
                      : isReverseColor ? 'border-slate-700 bg-slate-900/90 text-slate-100' : 'border-[#6894be] bg-white text-slate-900'
                  }`}>
                    <div className={`flex flex-col ${settings.answerLayout === 'compact' ? 'gap-1.5' : 'gap-3'}`}>
                      {currentQ.question.options.map((opt, i) => {
                        const isSelected = currentQ.selectedOptionId === opt.id;
                        const isStruckThrough = currentQ.strikethroughs?.includes(opt.id);
                        
                        let rowHighlight = '';
                        let badge = null;
                        if (showFeedback && opt.isCorrect) {
                          rowHighlight = isReverseColor 
                            ? 'bg-emerald-950/60 border-l-4 border-emerald-500 pl-2 font-semibold text-emerald-200' 
                            : 'bg-emerald-50 border-l-4 border-emerald-600 pl-2 font-semibold text-emerald-950';
                          badge = (
                            <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase tracking-wide">
                              ✓ Correct Answer
                            </span>
                          );
                        } else if (showFeedback && opt.isYellowDistractor) {
                          rowHighlight = isReverseColor 
                            ? 'bg-amber-950/50 border-l-4 border-amber-400 pl-2 font-medium text-amber-200' 
                            : 'bg-amber-50 border-l-4 border-amber-500 pl-2 font-medium text-amber-950';
                          badge = (
                            <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 uppercase tracking-wide">
                              ⚠️ High-Yield Distractor
                            </span>
                          );
                        } else if (showFeedback && isSelected) {
                          rowHighlight = isReverseColor 
                            ? 'bg-rose-950/60 border-l-4 border-rose-500 pl-2 text-rose-200' 
                            : 'bg-rose-50 border-l-4 border-rose-500 pl-2 text-rose-950';
                          badge = (
                            <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300 uppercase tracking-wide">
                              ✗ Your Choice
                            </span>
                          );
                        }

                        return (
                          <div key={opt.id} className={`flex items-start justify-between ${settings.answerLayout === 'compact' ? 'py-0.5 px-1' : 'py-1.5 px-1'} rounded-xs transition-colors ${rowHighlight}`}>
                            <label 
                              className="flex items-start flex-1 cursor-pointer select-text gap-3"
                              onClick={() => !showFeedback && handleOptionSelect(opt.id)}
                            >
                              <input 
                                type="radio" 
                                name={`q-${currentQ.id}`}
                                checked={isSelected}
                                onChange={() => {}}
                                disabled={!!showFeedback}
                                className="mt-1 w-4 h-4 cursor-pointer accent-[#003366] shrink-0"
                              />
                              <div className="flex-1 flex flex-wrap items-baseline select-text cursor-text">
                                {settings.showShortcuts && (
                                  <span className="mr-1.5 text-[9px] font-mono font-bold text-teal-800 bg-teal-100/80 border border-teal-300 px-1 rounded">
                                    {String.fromCharCode(65 + i)}
                                  </span>
                                )}
                                <span className={`mr-2 font-bold shrink-0 ${isStruckThrough ? 'line-through text-slate-400' : isReverseColor ? 'text-slate-200' : 'text-slate-900'}`}>
                                  {String.fromCharCode(65 + i)}.
                                </span>
                                <div 
                                  className={`leading-relaxed inline [&>p]:inline select-text cursor-text ${isStruckThrough ? 'line-through text-slate-400' : isReverseColor ? 'text-slate-100' : 'text-slate-900'}`}
                                  dangerouslySetInnerHTML={{ __html: sanitizeHTML(opt.text) }}
                                />
                                {badge}
                              </div>
                            </label>

                            {/* Authentic Strikeout [ab] button */}
                            {session.mode !== 'review' && !showFeedback && (
                              <button 
                                type="button"
                                onClick={() => toggleStrikethrough(opt.id)}
                                className="ml-3 px-1.5 py-0.5 border border-slate-300 hover:border-slate-500 bg-slate-50 hover:bg-slate-100 rounded text-[11px] font-mono text-slate-600 line-through select-none cursor-pointer shrink-0"
                                title="Strike out option"
                              >
                                ab
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Tutor Mode: Submit & View Explanation */}
                    {session.mode === 'tutor' && !showFeedback && (
                      <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            if (!currentQ.selectedOptionId) return;
                            setTutorRevealedMap(prev => ({ ...prev, [currentQ.id]: true }));
                            setTimeout(() => {
                              explanationContentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                            }, 150);
                          }}
                          disabled={!currentQ.selectedOptionId}
                          className="px-6 py-2.5 bg-[#003366] hover:bg-[#002244] text-white text-xs font-bold uppercase tracking-wider rounded shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                        >
                          <span>Submit Answer &amp; View Explanation</span>
                          <span className="text-sm">→</span>
                        </button>
                        <span className="text-xs text-slate-500 font-medium italic select-none">
                          {currentQ.selectedOptionId ? 'Click to submit your answer and reveal the explanation' : 'Select an answer choice above to submit'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Proceed to Next Item button */}
                  <div className="mb-6 select-none">
                    <button 
                      type="button"
                      onClick={handleNext} 
                      className="bg-[#005580] hover:bg-[#004466] text-white px-5 py-2 text-xs font-bold rounded shadow-xs transition-colors cursor-pointer"
                    >
                      Proceed to Next Item
                    </button>
                  </div>

                  {/* Tutor / Review Mode: Rich Feedback & Explanations */}
                  {showFeedback && (
                    <div className="mt-6 pt-6 border-t-2 border-slate-300 space-y-6">
                      {/* Video Mnemonic Player */}
                      {currentQ.question.videoUrl && (
                        <div>
                          <VideoMnemonicPlayer 
                            videoUrl={currentQ.question.videoUrl} 
                            title={`High-Yield Video Mnemonic (Item ${currentIndex + 1})`}
                            userEmail={userEmail}
                          />
                        </div>
                      )}
                      
                      {/* Comprehensive Explanation & Educational Discussion */}
                      <div className={`border-2 rounded-md p-6 shadow-xs select-text ${
                        isReverseColor 
                          ? 'bg-slate-900 border-slate-700 text-slate-100' 
                          : 'bg-white border-[#6894be]/60 text-slate-900'
                      }`}>
                        <div className={`flex items-center justify-between mb-4 border-b pb-3 ${isReverseColor ? 'border-slate-800' : 'border-slate-200'}`}>
                          <span className={`font-bold text-sm uppercase tracking-wider flex items-center gap-2 ${isReverseColor ? 'text-teal-400' : 'text-[#003366]'}`}>
                            <Sparkles className="w-4 h-4 text-teal-500" />
                            Explanation &amp; Educational Discussion
                          </span>
                          {currentQ.isCorrect !== null && (
                            <span className={`text-xs px-3 py-1 rounded font-bold uppercase ${
                              currentQ.isCorrect 
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                                : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}>
                              {currentQ.isCorrect ? '✓ Correct Answer' : '✗ Incorrect'}
                            </span>
                          )}
                        </div>

                        {/* Full Vignette Explanation with click-to-zoom on images */}
                        <div 
                          ref={explanationContentRef}
                          className={`text-[15px] leading-relaxed select-text cursor-text qbank-explanation-body selection:bg-teal-100 selection:text-teal-900 ${
                            isReverseColor ? 'text-slate-100 [&_*]:!text-slate-100' : 'text-slate-900'
                          }`}
                          onClick={(e) => {
                            const target = e.target as HTMLElement;
                            if (target && target.tagName === 'IMG') {
                              const src = (target as HTMLImageElement).src;
                              if (src) setZoomImage(src);
                            }
                          }}
                          dangerouslySetInnerHTML={{ __html: sanitizeHTML(currentQ.highlightedExplanation || currentQ.question.explanation || '') }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Exhibit Display on the Right (Framed exactly matching reference screenshot) */}
                {currentQ.question.media && currentQ.question.media.length > 0 && (
                  <div className="lg:col-span-5 xl:col-span-4 w-full">
                    <div className="border-2 border-slate-300 shadow-md bg-white p-1 flex">
                      {/* Left Vertical Tool Strip */}
                      <div className="w-12 flex flex-col items-center gap-4 py-3 border-r border-slate-200 mr-1 shrink-0 bg-slate-50 select-none">
                        <button 
                          type="button"
                          onClick={() => setPreviewImageInvert(!previewImageInvert)}
                          className="flex flex-col items-center justify-center p-1 hover:bg-slate-200 rounded transition-colors cursor-pointer w-full"
                          title="Invert Colors"
                        >
                          <div className="w-5 h-5 bg-black rounded-xs overflow-hidden flex border border-slate-400">
                            <div className="w-1/2 h-full bg-white"></div>
                          </div>
                          <span className="text-[9px] font-semibold text-slate-700 mt-1">Invert</span>
                        </button>

                        <button 
                          type="button"
                          onClick={() => setPreviewImageContrast(c => c >= 150 ? 100 : c + 25)}
                          className="flex flex-col items-center justify-center p-1 hover:bg-slate-200 rounded transition-colors cursor-pointer w-full"
                          title="Adjust Contrast"
                        >
                          <Sun size={18} className="text-slate-700" />
                          <span className="text-[9px] font-semibold text-slate-700 mt-1">Contrast</span>
                        </button>

                        <button 
                          type="button"
                          onClick={() => {
                            if (currentQ.question.media && currentQ.question.media.length > 0) {
                              setZoomImage(currentQ.question.media[0].url);
                            }
                          }}
                          className="flex flex-col items-center justify-center p-1 hover:bg-slate-200 rounded transition-colors cursor-pointer w-full"
                          title="Zoom / Fullscreen Exhibit"
                        >
                          <ZoomIn size={18} className="text-slate-700" />
                          <span className="text-[9px] font-semibold text-slate-700 mt-1">Zoom</span>
                        </button>
                      </div>

                      {/* Image Preview */}
                      <div 
                        className="flex-1 flex flex-col items-center justify-center p-2 bg-slate-100 overflow-hidden cursor-pointer"
                        onClick={() => {
                          if (currentQ.question.media && currentQ.question.media.length > 0) {
                            setZoomImage(currentQ.question.media[0].url);
                          }
                        }}
                      >
                        <img 
                          src={currentQ.question.media[0].url} 
                          alt="Clinical Exhibit"
                          style={{
                            filter: `${previewImageInvert ? 'invert(1)' : ''} contrast(${previewImageContrast}%)`,
                          }}
                          className="max-h-[360px] w-auto object-contain shadow-xs bg-white p-1"
                        />
                        <span className="text-[10px] text-slate-500 font-medium mt-1 select-none">Click to expand exhibit</span>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </main>
        </div>

        {/* BOTTOM FOOTER BAR - Authentic Deep Navy Blue */}
        <footer className="h-[42px] bg-[#003366] text-white flex items-center justify-between px-4 shrink-0 select-none border-t border-[#002244] z-20">
          
          {/* Left Timer Box */}
          <div className="border border-[#2a6699] bg-[#002244] text-white px-3 py-1 flex items-center gap-3 rounded-xs text-[11px] font-mono select-none">
            <span className="text-slate-300">Block Time Remaining:</span>
            {settings.showTimer !== false ? (
              <TimerDisplay 
                initialElapsed={0} 
                initialTimeLeft={session.durationSec ? Math.max(0, session.durationSec - initialElapsed) : null} 
                isTimed={session.mode === 'timed'} 
                isPaused={isPaused}
                onTimeUp={handleEndBlock} 
                type="remaining"
                className="font-bold text-white tracking-tight"
              />
            ) : (
              <span className="font-bold text-white">--:--</span>
            )}
          </div>
          
          {/* Center Lock Button */}
          <button 
            type="button"
            onClick={() => setShowUnauthorizedBreakWarning(true)}
            className="flex flex-col items-center justify-center text-white hover:text-cyan-300 transition-colors cursor-pointer"
            title="Lock Exam (Unauthorized Break)"
          >
            <Lock size={15} />
            <span className="text-[10px] font-bold mt-0.5">Lock</span>
          </button>
          
          {/* Right End Block Button */}
          <button 
            type="button"
            onClick={handleEndBlock}
            className="flex flex-col items-center justify-center text-white hover:text-rose-300 transition-colors cursor-pointer"
            title="End Examination Block"
          >
            <div className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-[10px] leading-none">
              ✕
            </div>
            <span className="text-[10px] font-bold mt-0.5">End Block</span>
          </button>
        </footer>

        {/* ================= MODALS & DIALOGS ================= */}

        {/* 1. Calculator */}
        {showCalculator && <Calculator onClose={() => setShowCalculator(false)} />}
        
        {/* 2. Lab Values */}
        {showLabValues && <LabValuesModal onClose={() => setShowLabValues(false)} />}
        
        {/* 3. Settings Sidebar */}
        {settingsMenuOpen && <SettingsSidebar onClose={() => setSettingsMenuOpen(false)} />}
        
        {/* 4. Notes Modal (Per-Question Persistent) */}
        {showNotes && (
          <QuestionNotesModal 
            isOpen={showNotes} 
            onClose={() => { setShowNotes(false); setNotebookAppendText(null); }} 
            initialNotes={currentQ.notes || ''} 
            onSave={handleSaveNotes} 
            appendContent={notebookAppendText}
          />
        )}

        {/* 5. Exhibit Zoom / Fullscreen Display */}
        {zoomImage && (
          <ExhibitDisplay 
            mediaUrl={zoomImage} 
            onClose={() => setZoomImage(null)} 
            onAddToNotes={() => setShowNotes(true)}
          />
        )}
        
        {/* 6. Flashcard Modal */}
        {showFlashcardModal && session.qbankSlug && (
          <FlashcardModal 
            isOpen={showFlashcardModal} 
            onClose={() => setShowFlashcardModal(false)} 
            questionId={currentQ.question.id} 
            qbankSlug={session.qbankSlug} 
            initialFront={flashcardPrefillText}
          />
        )}

        {/* 7. Key Modal (Question Status Symbols) */}
        {showKeyModal && (
          <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white border border-[#003366] w-[340px] shadow-2xl rounded-xs overflow-hidden">
              <div className="bg-[#003366] text-white font-bold px-4 py-2.5 text-[13px] flex items-center justify-between">
                <span>Item Status Key</span>
                <button type="button" onClick={() => setShowKeyModal(false)} className="hover:text-red-300 cursor-pointer">✕</button>
              </div>
              <div className="p-4 space-y-3 text-xs text-slate-800">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-black shrink-0" />
                  <span><strong>Answered item</strong>: option selected</span>
                </div>
                <div className="flex items-center gap-3">
                  <Flag size={14} className="fill-red-500 text-red-500 shrink-0" />
                  <span><strong>Marked item</strong>: flagged for review</span>
                </div>
                <div className="flex items-center gap-3">
                  <PenLine size={14} className="text-amber-600 shrink-0" />
                  <span><strong>Notes attached</strong>: hover to read notes</span>
                </div>
              </div>
              <div className="bg-slate-100 px-4 py-2 flex justify-end border-t border-slate-300">
                <button 
                  type="button" 
                  onClick={() => setShowKeyModal(false)} 
                  className="px-4 py-1 bg-white border border-slate-400 text-xs font-bold rounded hover:bg-slate-50 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 8. Authentic NBME End Block Warning Dialog */}
        {showEndBlockWarning && (
          <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white border-2 border-slate-400 w-[420px] shadow-2xl rounded-xs overflow-hidden font-sans">
              {/* Titlebar: Red if incomplete, Blue if complete */}
              <div className={`px-4 py-2.5 text-white font-bold text-[13px] flex items-center justify-between ${
                unansweredCount > 0 ? 'bg-[#d9534f]' : 'bg-[#1780b8]'
              }`}>
                <span>{unansweredCount > 0 ? 'Warning - This block is incomplete!' : 'Warning - You are about to end the block.'}</span>
                <button 
                  type="button" 
                  onClick={() => setShowEndBlockWarning(false)} 
                  className="hover:bg-black/20 p-0.5 rounded text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="p-6 text-center text-[13px] text-slate-800 leading-relaxed font-sans">
                {unansweredCount > 0 && (
                  <p className="font-bold mb-2">
                    Number of unanswered items in this block: {unansweredCount}
                  </p>
                )}
                <p>If you end this block you will not be able to return.</p>
              </div>

              {/* Action Buttons: End Block (Blue) and Remain in Block (Brown/Orange) */}
              <div className="bg-slate-50 px-6 py-4 flex items-center justify-center gap-4 border-t border-slate-200">
                <button 
                  type="button"
                  onClick={() => {
                    setShowEndBlockWarning(false);
                    finishSession(questions);
                  }} 
                  className="px-5 py-1.5 bg-[#0078d7] hover:bg-[#0060aa] text-white text-xs font-bold rounded shadow-xs transition-colors cursor-pointer"
                >
                  End Block
                </button>
                <button 
                  type="button"
                  onClick={() => setShowEndBlockWarning(false)} 
                  className="px-5 py-1.5 bg-[#935a16] hover:bg-[#7b4a11] text-white text-xs font-bold rounded shadow-xs transition-colors cursor-pointer"
                >
                  Remain in Block
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 9. Authentic NBME Unauthorized Break Warning Dialog */}
        {showUnauthorizedBreakWarning && (
          <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white border-2 border-slate-400 w-[440px] shadow-2xl rounded-xs overflow-hidden font-sans">
              <div className="bg-[#d9534f] px-4 py-2.5 text-white font-bold text-[13px] flex items-center justify-between">
                <span>Unauthorized Break Warning</span>
                <button 
                  type="button" 
                  onClick={() => setShowUnauthorizedBreakWarning(false)} 
                  className="hover:bg-black/20 p-0.5 rounded text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 text-center text-[13px] text-slate-800 leading-relaxed">
                You are about to lock the exam and take an Unauthorized Break. An Unauthorized Break may be reported as an irregularity for the exam.
              </div>

              <div className="bg-slate-50 px-6 py-4 flex items-center justify-center gap-4 border-t border-slate-200">
                <button 
                  type="button"
                  onClick={() => {
                    setShowUnauthorizedBreakWarning(false);
                    setIsPaused(true);
                  }} 
                  className="px-5 py-1.5 bg-[#cc0000] hover:bg-[#aa0000] text-white text-xs font-bold rounded shadow-xs transition-colors cursor-pointer"
                >
                  Unauthorized Break
                </button>
                <button 
                  type="button"
                  onClick={() => setShowUnauthorizedBreakWarning(false)} 
                  className="px-5 py-1.5 bg-[#935a16] hover:bg-[#7b4a11] text-white text-xs font-bold rounded shadow-xs transition-colors cursor-pointer"
                >
                  Return to Exam
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 10. Tutorial */}
        {showTutorial && (
          <TestTutorial onComplete={() => {
            setShowTutorial(false);
            localStorage.setItem('tutorial-seen-' + session.id, 'true');
          }} />
        )}
      </div>
    );
  };

  const renderMqbTheme = () => {
    const unansweredCount = questions.filter(q => !q.selectedOptionId).length;
    const isDarkClinical = !settings.highContrast;
    const canvasBg = settings.highContrast ? 'bg-black text-white' : 'bg-[#080d1a] text-slate-100';
    const cardBg = settings.highContrast ? 'bg-black border-2 border-white' : 'bg-[#0f172a]/90 border border-teal-900/35 backdrop-blur-md shadow-2xl';
    const headerBg = settings.highContrast ? 'bg-black border-b-2 border-white text-white' : 'bg-[#0b1120]/95 backdrop-blur-md border-b border-teal-900/40 text-slate-200 shadow-md';
    const sidebarBg = settings.highContrast ? 'bg-black border-r-2 border-white' : 'bg-[#0b1120]/95 border-r border-teal-900/30';

    return (
      <div className={`flex flex-col h-screen overflow-hidden font-sans ${canvasBg} relative selection:bg-teal-500/30 selection:text-teal-200`}>
        {/* Modals & Overlays */}
        {isPaused && (
          <div className="fixed inset-0 z-50 bg-slate-950/85 flex flex-col items-center justify-center backdrop-blur-md">
            <div className="bg-[#0f172a] p-8 rounded-2xl shadow-2xl text-center max-w-md w-full border border-teal-500/30 text-white">
              <div className="w-14 h-14 rounded-full bg-teal-950/80 text-teal-400 border border-teal-500/50 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-extrabold text-white mb-2 font-serif">Exam Block Suspended</h2>
              <p className="text-slate-300 mb-6 text-sm">Timer is stopped. Vignettes and answer choices remain hidden to maintain testing authenticity.</p>
              <button 
                type="button"
                onClick={() => setIsPaused(false)}
                className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold py-3 rounded-xl shadow-lg shadow-teal-500/25 transition-all cursor-pointer"
              >
                Resume Exam Practice
              </button>
            </div>
          </div>
        )}

        {showCalculator && <Calculator onClose={() => setShowCalculator(false)} />}
        {showLabValues && <LabValuesModal onClose={() => setShowLabValues(false)} />}
        {settingsMenuOpen && <SettingsSidebar onClose={() => setSettingsMenuOpen(false)} />}
        {showNotes && (
          <QuestionNotesModal 
            isOpen={showNotes} 
            onClose={() => { setShowNotes(false); setNotebookAppendText(null); }} 
            initialNotes={currentQ.notes || ''} 
            onSave={handleSaveNotes} 
            appendContent={notebookAppendText}
          />
        )}
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

        {/* End Block Confirmation Dialog in MQB Theme */}
        {showEndBlockWarning && (
          <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-md">
            <div className="bg-[#0f172a] border border-teal-500/40 w-[440px] shadow-2xl rounded-2xl overflow-hidden font-sans text-white">
              <div className={`px-5 py-3 font-bold text-sm flex items-center justify-between ${
                unansweredCount > 0 ? 'bg-rose-950/90 text-rose-300 border-b border-rose-500/30' : 'bg-teal-950/90 text-teal-300 border-b border-teal-500/30'
              }`}>
                <span>{unansweredCount > 0 ? 'Warning - Unanswered Questions' : 'End Examination Block'}</span>
                <button 
                  type="button" 
                  onClick={() => setShowEndBlockWarning(false)} 
                  className="hover:bg-white/10 p-1 rounded-lg text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 text-center text-sm text-slate-300 leading-relaxed font-sans">
                {unansweredCount > 0 && (
                  <p className="font-bold text-white mb-2">
                    Number of unanswered items in this block: <span className="text-rose-400 font-mono">{unansweredCount}</span>
                  </p>
                )}
                <p>If you end this examination block now, your score will be computed and you will not be able to change your answers.</p>
              </div>

              <div className="bg-[#080d1a] px-6 py-4 border-t border-teal-900/40 flex items-center justify-center gap-3">
                <button 
                  type="button"
                  onClick={() => {
                    setShowEndBlockWarning(false);
                    finishSession(questions);
                  }} 
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer"
                >
                  End Block &amp; View Results
                </button>
                <button 
                  type="button"
                  onClick={() => setShowEndBlockWarning(false)} 
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Remain in Block
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Clinical Dark Glass Header */}
        <header className={`h-16 ${headerBg} flex items-center justify-between px-4 sm:px-6 shrink-0 relative z-20`}>
          {/* Left: Item Counter & Mode Pill */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-extrabold text-white font-mono">Item {currentIndex + 1}</span>
              <span className="text-xs text-teal-400/80 font-mono">/ {session.questions.length}</span>
            </div>

            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-950/70 border border-teal-500/30 text-teal-300 text-xs font-bold font-mono">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span>{session.mode === 'tutor' ? 'Tutor Mode' : 'Timed Mode'}</span>
            </div>

            {/* Quick Theme Switch Pill */}
            <button 
              type="button"
              onClick={() => updateSetting('appTheme', 'UWORLD')}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full border border-teal-500/40 bg-teal-950/60 text-teal-300 hover:bg-teal-900/60 transition-all cursor-pointer shadow-xs"
              title="Switch to UWorld Official FRED v2 Theme"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>Theme: MQB Signature</span>
              <span className="hidden md:inline text-[10px] text-teal-400/70 font-normal">(Click for UWorld)</span>
            </button>
          </div>

          {/* Center: Timer with Optional Shortcuts */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-[#080d1a]/80 border border-teal-900/50 px-3.5 py-1.5 rounded-full shadow-inner">
              <Clock className="w-4 h-4 text-teal-400" />
              {settings.showTimer !== false ? (
                <TimerDisplay 
                  initialElapsed={0} 
                  initialTimeLeft={session.durationSec ? Math.max(0, session.durationSec - initialElapsed) : null} 
                  isTimed={session.mode === 'timed'} 
                  isPaused={isPaused}
                  onTimeUp={handleEndBlock} 
                  type={session.mode === 'timed' ? 'remaining' : 'elapsed'}
                  className="text-sm font-bold text-teal-300 font-mono tracking-tight"
                />
              ) : (
                <span className="text-sm font-bold text-slate-500 font-mono">--:--</span>
              )}
              <button 
                type="button" 
                onClick={() => setIsPaused(true)}
                className="text-slate-400 hover:text-teal-300 transition-colors ml-1 p-0.5 cursor-pointer"
                title="Pause Block Timer"
              >
                <Pause size={14} />
              </button>
            </div>
          </div>

          {/* Right: Tools & Settings Action Strip */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Mark / Flag Question */}
            <button 
              type="button"
              onClick={handleToggleFlag}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                currentQ.isFlagged 
                  ? 'bg-rose-950/80 border-rose-500 text-rose-300 shadow-sm shadow-rose-950/50' 
                  : 'border-slate-700/80 bg-slate-900/60 text-slate-300 hover:text-white hover:border-slate-600'
              }`}
              title="Mark Question (Alt + M)"
            >
              <Flag size={14} className={currentQ.isFlagged ? 'fill-rose-500 text-rose-500' : 'text-slate-400'} />
              <span className="hidden sm:inline">{currentQ.isFlagged ? 'Marked' : 'Mark'}</span>
              {settings.showShortcuts && <kbd className="text-[9px] font-mono opacity-60">Alt+M</kbd>}
            </button>

            {/* Labs */}
            <button 
              type="button"
              onClick={() => setShowLabValues(true)}
              className="p-2 text-slate-300 hover:text-teal-300 hover:bg-slate-800/60 rounded-lg border border-slate-700/80 bg-slate-900/60 transition-colors cursor-pointer"
              title="Lab Values Reference (Alt + L)"
            >
              <FlaskConical size={16} />
            </button>

            {/* Calculator */}
            <button 
              type="button"
              onClick={() => setShowCalculator(true)}
              className="p-2 text-slate-300 hover:text-teal-300 hover:bg-slate-800/60 rounded-lg border border-slate-700/80 bg-slate-900/60 transition-colors cursor-pointer"
              title="Calculator (Alt + C)"
            >
              <CalcIcon size={16} />
            </button>

            {/* Notes */}
            <button 
              type="button"
              onClick={() => setShowNotes(true)}
              className="p-2 text-slate-300 hover:text-teal-300 hover:bg-slate-800/60 rounded-lg border border-slate-700/80 bg-slate-900/60 transition-colors cursor-pointer"
              title="Question Notes"
            >
              <PenLine size={16} />
            </button>

            {/* Settings */}
            <button 
              type="button"
              onClick={() => setSettingsMenuOpen(true)}
              className="p-2 text-slate-300 hover:text-teal-300 hover:bg-slate-800/60 rounded-lg border border-slate-700/80 bg-slate-900/60 transition-colors cursor-pointer"
              title="Display & Exam Settings"
            >
              <SettingsIcon size={16} />
            </button>

            {/* End Block */}
            <button 
              type="button"
              onClick={handleEndBlock}
              className="ml-1 sm:ml-2 px-3.5 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/50 text-xs font-bold rounded-lg transition-all cursor-pointer shadow-sm"
            >
              End Block
            </button>
          </div>
        </header>

        {/* Main Body Workspace */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Ambient Focus Mode Sidebar (1-50 Questions) */}
          <aside className={`w-16 ${sidebarBg} flex flex-col shrink-0 overflow-y-auto py-2.5 px-1 space-y-1 custom-scrollbar`}>
            {questions.map((q, idx) => {
              const isActive = idx === currentIndex;
              const isAnswered = !!q.selectedOptionId;
              const isFlagged = q.isFlagged;

              return (
                <button 
                  key={q.id}
                  type="button"
                  onClick={() => navigateToIndex(idx)}
                  className={`flex flex-col items-center justify-center h-11 rounded-xl text-xs font-bold transition-all relative cursor-pointer ${
                    isActive 
                      ? 'bg-teal-950/90 text-teal-200 border-2 border-teal-400 shadow-[0_0_14px_rgba(20,184,166,0.4)] scale-105 z-10 opacity-100 font-black' 
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 opacity-60 hover:opacity-100'
                  }`}
                  title={`Question ${idx + 1}${isAnswered ? ' (Answered)' : ''}${isFlagged ? ' (Marked)' : ''}`}
                >
                  <span className="font-mono text-[11px]">{idx + 1}</span>
                  <div className="flex items-center gap-1 mt-0.5 h-2">
                    {isAnswered && (
                      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-teal-300' : 'bg-teal-500'}`} />
                    )}
                    {isFlagged && (
                      <Flag size={8} className="fill-rose-500 text-rose-500" />
                    )}
                  </div>
                </button>
              );
            })}
          </aside>

          {/* Central Question & Reading Canvas */}
          <main 
            ref={testPlayerMainRef} 
            className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-12 py-6 max-w-7xl mx-auto w-full pb-28 custom-scrollbar"
          >
            {/* Split Screen Grid vs Single Column Layout */}
            <div className={settings.splitScreen ? 'grid grid-cols-1 lg:grid-cols-2 gap-8 items-start' : 'max-w-4xl mx-auto'}>
              
              {/* LEFT COLUMN: Question Vignette + Media Exhibits */}
              <div className="space-y-6">
                <div className={`${cardBg} rounded-2xl p-6 sm:p-8`}>
                  {/* Vignette Meta Header */}
                  <div className="flex items-center justify-between border-b border-teal-900/30 pb-3 mb-6">
                    <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-teal-400 flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5" />
                      Clinical Vignette • QID {currentQ.question.qid}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-400">Font: {settings.fontSize}px</span>
                    </div>
                  </div>

                  {/* Vignette Stem */}
                  <div 
                    ref={questionContentRef}
                    style={{ fontSize: `${settings.fontSize}px`, lineHeight: 1.6 }}
                    className="leading-relaxed font-sans select-text text-slate-200"
                    dangerouslySetInnerHTML={{ __html: sanitizeHTML(currentQ.highlightedQuestionText || currentQ.question.questionText) }}
                  />

                  {/* Clinical Exhibits & Media */}
                  {currentQ.question.media && currentQ.question.media.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-teal-900/30">
                      <div className="text-xs font-mono font-bold uppercase tracking-wider text-teal-400 mb-3 flex items-center justify-between">
                        <span>Clinical Exhibits &amp; High-Yield Images</span>
                        <span className="text-[10px] text-slate-400 font-sans normal-case">(Click image for high-res zoom)</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {currentQ.question.media.map(m => (
                          <div 
                            key={m.id} 
                            onClick={() => setZoomImage(m.url)}
                            className="cursor-pointer group relative rounded-xl overflow-hidden border border-teal-900/40 bg-[#080d1a] hover:border-teal-500 transition-all shadow-md"
                          >
                            <img 
                              src={m.url} 
                              alt={m.caption || 'Clinical Exhibit'} 
                              className="w-full h-44 object-contain p-2 group-hover:scale-[1.03] transition-transform duration-300" 
                            />
                            {m.caption && (
                              <div className="p-2 text-xs text-slate-300 bg-[#0b1120]/90 border-t border-teal-900/40 font-sans">
                                {m.caption}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: Options + Feedback & Video Mnemonics */}
              <div className="space-y-6">
                <div className={`${cardBg} rounded-2xl p-6 sm:p-8`}>
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-teal-400 border-b border-teal-900/30 pb-3 mb-5 flex items-center justify-between">
                    <span>Select Single Best Answer</span>
                    {settings.showShortcuts && (
                      <span className="text-[10px] text-slate-400 font-sans normal-case">Use keys [A] – [E]</span>
                    )}
                  </div>

                  {/* Options List */}
                  <div className="space-y-3">
                    {currentQ.question.options.map((opt, i) => {
                      const isSelected = currentQ.selectedOptionId === opt.id;
                      const isStruckThrough = currentQ.strikethroughs?.includes(opt.id);

                      let optionCardStyle = 'bg-[#131d33]/60 border-slate-700/70 hover:border-teal-500/50 hover:bg-[#16233f] text-slate-200';
                      let letterStyle = 'bg-slate-800 text-slate-300 border-slate-700';

                      if (isSelected) {
                        optionCardStyle = 'bg-teal-950/70 border-teal-400 text-teal-100 shadow-[0_0_15px_rgba(20,184,166,0.25)] ring-1 ring-teal-400/40';
                        letterStyle = 'bg-teal-500 text-slate-950 font-black border-teal-400';
                      }

                      if (showFeedback) {
                        if (opt.isCorrect) {
                          optionCardStyle = 'bg-emerald-950/70 border-emerald-400 text-emerald-100 shadow-[0_0_15px_rgba(52,211,153,0.25)] ring-1 ring-emerald-400/50';
                          letterStyle = 'bg-emerald-500 text-slate-950 font-black border-emerald-400';
                        } else if (opt.isYellowDistractor) {
                          optionCardStyle = 'bg-amber-950/60 border-amber-400 text-amber-100';
                          letterStyle = 'bg-amber-500 text-slate-950 font-black border-amber-400';
                        } else if (isSelected) {
                          optionCardStyle = 'bg-rose-950/70 border-rose-500 text-rose-100 ring-1 ring-rose-500/40';
                          letterStyle = 'bg-rose-500 text-slate-950 font-black border-rose-400';
                        } else {
                          optionCardStyle = 'bg-[#0b1120]/60 border-slate-800 opacity-60 text-slate-400';
                        }
                      }

                      const paddingStyle = settings.answerLayout === 'compact' ? 'p-2.5 sm:p-3 text-sm' : 'p-3.5 sm:p-4 text-[15px]';

                      return (
                        <div 
                          key={opt.id}
                          onClick={() => !showFeedback && handleOptionSelect(opt.id)}
                          className={`${paddingStyle} rounded-xl border-2 transition-all cursor-pointer relative group ${optionCardStyle}`}
                        >
                          <div className="flex items-start gap-3 sm:gap-4">
                            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center font-mono font-bold text-xs sm:text-sm shrink-0 transition-colors ${letterStyle}`}>
                              {String.fromCharCode(65 + i)}
                            </div>
                            <div className="flex-1 pt-0.5">
                              <div className={`leading-relaxed select-text ${isStruckThrough ? 'line-through opacity-35' : ''}`}>
                                <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(opt.text) }} />
                              </div>

                              {/* Distractor Rationale Tags */}
                              {showFeedback && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {opt.isCorrect && (
                                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 border border-emerald-400 text-emerald-300">
                                      ✓ Accurate Board Answer
                                    </span>
                                  )}
                                  {opt.isYellowDistractor && (
                                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-950 border border-amber-400 text-amber-300">
                                      ⚠️ High-Yield Distractor
                                    </span>
                                  )}
                                  {isSelected && !opt.isCorrect && (
                                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-950 border border-rose-400 text-rose-300">
                                      ✗ Your Selection
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Strikethrough toggle button */}
                            {session.mode !== 'review' && !showFeedback && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleStrikethrough(opt.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-white transition-opacity cursor-pointer"
                                title="Strike through option"
                              >
                                <Strikethrough size={15} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Tutor Mode Submit CTA */}
                  {session.mode === 'tutor' && !showFeedback && (
                    <div className="mt-6 pt-5 border-t border-teal-900/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          if (!currentQ.selectedOptionId) return;
                          setTutorRevealedMap(prev => ({ ...prev, [currentQ.id]: true }));
                          setTimeout(() => {
                            explanationContentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                          }, 150);
                        }}
                        disabled={!currentQ.selectedOptionId}
                        className="w-full sm:w-auto px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-lg shadow-teal-500/25 transition-all disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span>Submit Answer &amp; View Explanation</span>
                        <span>→</span>
                      </button>
                      <span className="text-xs text-slate-400 font-sans italic">
                        {currentQ.selectedOptionId ? 'Click to submit and lock answer' : 'Select an answer option to proceed'}
                      </span>
                    </div>
                  )}

                  {/* Timed Mode Next CTA inside card */}
                  {session.mode === 'timed' && (
                    <div className="mt-6 pt-5 border-t border-teal-900/30 flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-mono">
                        {currentQ.selectedOptionId ? 'Choice recorded (editable anytime)' : 'Select an answer choice above'}
                      </span>
                      <button
                        type="button"
                        onClick={handleNext}
                        className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <span>{currentIndex === session.questions.length - 1 ? 'Review & Finish' : 'Next Item →'}</span>
                        {settings.showShortcuts && <kbd className="text-[10px] font-mono text-slate-900 font-bold">Alt+N</kbd>}
                      </button>
                    </div>
                  )}

                  {/* Proceed to Next Item CTA in Tutor/Feedback */}
                  {showFeedback && (
                    <div className="mt-6 pt-5 border-t border-teal-900/30 flex justify-end">
                      <button 
                        type="button"
                        onClick={handleNext}
                        className="px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-teal-500/20 transition-all cursor-pointer"
                      >
                        {currentIndex === session.questions.length - 1 ? 'Finish Block →' : 'Proceed to Next Item →'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Explanation & Video Mnemonic in Tutor / Review Mode */}
                {showFeedback && (
                  <div className="space-y-6">
                    {/* 1. Cinematic Video Mnemonic */}
                    {currentQ.question.videoUrl && (
                      <div className="rounded-2xl overflow-hidden border border-teal-500/40 shadow-2xl bg-black">
                        <VideoMnemonicPlayer 
                          videoUrl={currentQ.question.videoUrl} 
                          title={`Visual Mnemonic • Concept Retention (Question ${currentIndex + 1})`}
                          userEmail={userEmail}
                        />
                      </div>
                    )}

                    {/* 2. Educational Discussion Card */}
                    <div className={`${cardBg} rounded-2xl p-6 sm:p-8 space-y-4`}>
                      <div className="flex items-center justify-between border-b border-teal-900/30 pb-3">
                        <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-teal-400 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-teal-400" />
                          Educational Discussion &amp; Clinical Pearls
                        </span>
                        {currentQ.isCorrect !== null && (
                          <span className={`text-xs px-3 py-1 rounded-full font-mono font-bold uppercase ${
                            currentQ.isCorrect 
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-400' 
                              : 'bg-rose-950 text-rose-300 border border-rose-400'
                          }`}>
                            {currentQ.isCorrect ? '✓ Correct Answer' : '✗ Incorrect'}
                          </span>
                        )}
                      </div>

                      <div 
                        ref={explanationContentRef}
                        className="text-slate-200 text-sm leading-relaxed qbank-explanation-body select-text cursor-text font-sans"
                        onClick={(e) => {
                          const target = e.target as HTMLElement;
                          if (target && target.tagName === 'IMG') {
                            const src = (target as HTMLImageElement).src;
                            if (src) setZoomImage(src);
                          }
                        }}
                        dangerouslySetInnerHTML={{ __html: sanitizeHTML(currentQ.highlightedExplanation || currentQ.question.explanation || '') }}
                      />
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Stepper Navigation Footer */}
            <div className="flex items-center justify-between pt-10 pb-6 border-t border-teal-900/20 mt-10">
              <button 
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-5 py-2.5 rounded-xl border border-slate-700/80 text-slate-300 font-bold text-xs uppercase tracking-wider hover:bg-slate-800/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-2"
              >
                <span>← Previous Item</span>
                {settings.showShortcuts && <kbd className="text-[10px] font-mono opacity-50">Alt+P</kbd>}
              </button>

              <div className="flex items-center gap-3">
                <button 
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-teal-500/20 transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>{currentIndex === session.questions.length - 1 ? 'Review & End Block' : 'Next Item →'}</span>
                  {settings.showShortcuts && <kbd className="text-[10px] font-mono text-slate-900 font-bold">Alt+N</kbd>}
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  };


  return (
    <>
      <HighlightToolbar 
        containerRef={testPlayerMainRef} 
        onHighlight={(color) => applyTextFormatting('highlight', color)} 
      />
      {settings.appTheme === 'MQB' ? renderMqbTheme() : renderUworldTheme()}
    </>
  );
}