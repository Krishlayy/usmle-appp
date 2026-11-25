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
import { formatExplanationHtml } from '@/lib/formatExplanation';

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
  /** true until the server reveals the answer key (see /api/test-sessions/[id]/reveal) */
  answersHidden?: boolean;
  questionText: string;
  explanation: string | null;
  acceptableAnswers: string[];
  tags: string[];
  videoUrl?: string | null;
  videoMnemonicTitle?: string | null;
  videoMnemonicExplanation?: string | null;
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
    let initialQs = [...session.questions].sort((a, b) => a.order - b.order);
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
  const [revealing, setRevealing] = useState(false);
  const [revealError, setRevealError] = useState<string | null>(null);
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
    // Time expiry must submit the block; it used to open the "End Block?" dialog
    // (letting students keep answering at 00:00).
    if (session.mode === 'review') return;
    finishSession(questionsRef.current);
  }, [finishSession, commitElapsedTime, session.mode]);

  // Don't count paused time toward the active question.
  useEffect(() => {
    if (isPaused) commitElapsedTime();
    else questionStartTimeRef.current = Date.now();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaused]);

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
      // Never act on shortcuts while any dialog/overlay is open (previously pressing
      // A–G behind the End-Block dialog silently changed answers).
      if (
        settingsMenuOpen || omissionWarning || showCalculator || showLabValues || showNotes ||
        showEndBlockWarning || showUnauthorizedBreakWarning || showKeyModal || showFlashcardModal ||
        showTutorial || isPaused || zoomImage
      ) return;
      // Space on a focused button must activate that button, not toggle the flag.
      if (e.key === ' ' && target && target.tagName === 'BUTTON') return;

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
  }, [currentIndex, currentQ, questions, settingsMenuOpen, omissionWarning, showCalculator, showLabValues, showNotes, showEndBlockWarning, showUnauthorizedBreakWarning, showKeyModal, showFlashcardModal, showTutorial, isPaused, zoomImage, settings.colorTheme, updateSetting, showFeedback, session.mode]);

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

    // While the key is hidden, correctness is unknown client-side (server grades it).
    const selectedOption = currentQ.question.options.find(o => o.id === optionId);
    const isCorrect: boolean | null = currentQ.question.answersHidden ? null : (selectedOption?.isCorrect ?? false);

    // Auto-remove strikethrough if student picks this option
    const currentStrikes = currentQ.strikethroughs || [];
    const newStrikes = currentStrikes.filter(id => id !== optionId);

    // Finalize whatever time has accumulated up to this exact moment into timeTakenSec
    commitElapsedTime();
    updateCurrentQuestionState({ selectedOptionId: optionId, isCorrect, strikethroughs: newStrikes });
    scheduleAutosave(currentQ.id, { selectedOptionId: optionId, strikethroughs: newStrikes });

    if (settings.autoNext && session.mode === 'timed') {
      if (autoNextTimeoutRef.current) {
        clearTimeout(autoNextTimeoutRef.current);
      }
      autoNextTimeoutRef.current = setTimeout(() => {
        handleNext();
      }, 400);
    }
  };
  
  // Tutor mode: persist the answer and fetch the answer key for this one question.
  const revealCurrent = async () => {
    const q = currentQ;
    if (!q.selectedOptionId || revealing) return;
    const selectedOptionId = q.selectedOptionId;

    const showIt = () => {
      setTutorRevealedMap(prev => ({ ...prev, [q.id]: true }));
      setTimeout(() => {
        explanationContentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 150);
    };

    // Mock/simulator sessions already carry the key locally.
    if (!q.question.answersHidden) {
      showIt();
      return;
    }

    setRevealing(true);
    setRevealError(null);
    try {
      commitElapsedTime();
      const res = await fetch(`/api/test-sessions/${session.id}/reveal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionProgressId: q.id, selectedOptionId }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setQuestions(prev => prev.map(qq => qq.id !== q.id ? qq : {
        ...qq,
        isCorrect: data.isCorrect,
        question: {
          ...qq.question,
          answersHidden: false,
          explanation: data.explanation,
          videoUrl: data.videoUrl,
          options: qq.question.options.map(o => {
            const k = data.options.find((x: { id: string }) => x.id === o.id);
            return k ? { ...o, isCorrect: k.isCorrect, isYellowDistractor: k.isYellowDistractor, explanation: k.explanation } : o;
          }),
        },
      }));
      showIt();
    } catch (err) {
      console.error('Reveal failed', err);
      setRevealError('Could not load the explanation. Check your connection and try again.');
    } finally {
      setRevealing(false);
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
              onClick={() => setSettingsMenuOpen(true)}
              className="flex flex-col items-center justify-center px-2 py-0.5 text-white hover:text-cyan-300 transition-colors cursor-pointer"
              title="Simulator Settings"
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
                          onClick={revealCurrent}
                          disabled={!currentQ.selectedOptionId || revealing}
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
                      {/* Video Mnemonic Player & Breakdown */}
                      {currentQ.question.videoUrl && (
                        <div>
                          <VideoMnemonicPlayer 
                            videoUrl={currentQ.question.videoUrl} 
                            title={`High-Yield Video Mnemonic (Item ${currentIndex + 1})`}
                            userEmail={userEmail}
                            mnemonicTitle={currentQ.question.videoMnemonicTitle || undefined}
                            mnemonicExplanation={currentQ.question.videoMnemonicExplanation || undefined}
                            questionRange={`Item ${currentIndex + 1}`}
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

                        {/* Full Vignette Explanation with click-to-zoom on images and professional clinical formatting */}
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
                          dangerouslySetInnerHTML={{ __html: sanitizeHTML(formatExplanationHtml(currentQ.highlightedExplanation || currentQ.question.explanation || '')) }}
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
                onTimeUp={handleTimeUp}
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
    const hc = settings.highContrast;
    const answeredCount = questions.length - unansweredCount;
    const progressPct = questions.length ? (answeredCount / questions.length) * 100 : 0;

    const line = hc ? 'border-slate-300' : 'border-slate-200';
    const canvas = hc ? 'bg-black text-white' : 'bg-white text-slate-800';
    const subtle = hc ? 'text-slate-900' : 'text-slate-600';
    const iconBtn = `grid h-9 w-9 place-items-center rounded-md ${subtle} transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600 cursor-pointer`;
    const primaryBtn = 'inline-flex items-center gap-2 rounded-md bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer';
    const ghostBtn = `inline-flex items-center gap-2 rounded-md border ${hc ? 'border-slate-300' : 'border-slate-200'} px-5 py-2.5 text-sm font-medium ${hc ? 'text-slate-900' : 'text-slate-800'} transition-colors hover:border-slate-300 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600 disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer`;
    const isLast = currentIndex === session.questions.length - 1;
    const modeLabel = session.mode === 'tutor' ? 'Tutor' : session.mode === 'review' ? 'Review' : 'Timed';
    const hasExhibits = !!(currentQ.question.media && currentQ.question.media.length > 0);

    const optionsBlock = (
      <div role="radiogroup" aria-label="Answer choices" className={settings.answerLayout === 'compact' ? 'space-y-1' : 'space-y-2'}>
        {currentQ.question.options.map((opt, i) => {
          const isSelected = currentQ.selectedOptionId === opt.id;
          const isStruckThrough = currentQ.strikethroughs?.includes(opt.id);

          let tone = hc
            ? 'border-slate-300'
            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50';
          let letter = hc ? 'border-slate-300 text-slate-900' : 'border-slate-200 text-slate-600';
          let tag: string | null = null;
          let tagTone = '';

          if (isSelected) {
            tone = 'border-teal-300 bg-teal-300/[0.06]';
            letter = 'border-teal-300 bg-teal-600 text-slate-950';
          }
          if (showFeedback) {
            if (opt.isCorrect) {
              tone = 'border-emerald-300 bg-emerald-400/[0.07]';
              letter = 'border-emerald-300 bg-emerald-600 text-slate-950';
              tag = 'Correct answer';
              tagTone = 'text-emerald-700';
            } else if (opt.isYellowDistractor) {
              tone = 'border-amber-300 bg-amber-400/[0.05]';
              letter = 'border-amber-300 text-amber-700';
              tag = 'High-yield distractor';
              tagTone = 'text-amber-700';
            } else if (isSelected) {
              tone = 'border-rose-300 bg-rose-400/[0.07]';
              letter = 'border-rose-300 bg-rose-600 text-slate-950';
              tag = 'Your answer';
              tagTone = 'text-rose-700';
            } else {
              tone = 'border-slate-200 opacity-50';
            }
          }

          return (
            <div key={opt.id} className="group flex items-stretch gap-2">
              <button
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={!!showFeedback}
                onClick={() => handleOptionSelect(opt.id)}
                className={`flex flex-1 items-start gap-4 rounded-md border text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300 disabled:cursor-default ${
                  settings.answerLayout === 'compact' ? 'px-3 py-2' : 'px-4 py-3.5'
                } ${tone} ${showFeedback ? '' : 'cursor-pointer'}`}
              >
                <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border font-mono text-xs font-semibold transition-colors ${letter}`}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={`block select-text leading-relaxed ${isStruckThrough ? 'line-through opacity-40' : ''}`}
                    style={{ fontSize: `${settings.fontSize}px` }}
                    dangerouslySetInnerHTML={{ __html: sanitizeHTML(opt.text) }}
                  />
                  {tag && <span className={`mt-1.5 block font-mono text-[11px] uppercase tracking-wider ${tagTone}`}>{tag}</span>}
                </span>
              </button>

              {session.mode !== 'review' && !showFeedback && (
                <button
                  type="button"
                  onClick={() => toggleStrikethrough(opt.id)}
                  aria-label={isStruckThrough ? `Restore option ${String.fromCharCode(65 + i)}` : `Strike out option ${String.fromCharCode(65 + i)}`}
                  aria-pressed={!!isStruckThrough}
                  title="Strike out"
                  className="grid w-9 shrink-0 place-items-center rounded-md text-slate-500 opacity-0 transition-opacity hover:text-slate-900 focus-visible:opacity-100 group-hover:opacity-100 cursor-pointer"
                >
                  <Strikethrough size={15} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    );

    return (
      <div className={`relative flex h-screen flex-col overflow-hidden font-sans selection:bg-teal-50 ${canvas}`}>
        {/* Pause overlay */}
        {isPaused && (
          <div role="dialog" aria-modal="true" aria-label="Block paused" className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-100 backdrop-blur-md">
            <div className="mqb-rise w-full max-w-sm px-6 text-center">
              <Clock className="mx-auto mb-5 h-6 w-6 text-teal-700" />
              <h2 className="font-serif text-2xl text-slate-900">Paused</h2>
              <p className="mt-2 text-sm text-slate-600">The timer is stopped and questions are hidden.</p>
              <button type="button" onClick={() => setIsPaused(false)} className={`${primaryBtn} mt-8 w-full justify-center`} autoFocus>
                Resume
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
          <ExhibitDisplay mediaUrl={zoomImage} onClose={() => setZoomImage(null)} onAddToNotes={() => setShowNotes(true)} />
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

        {/* End block confirmation */}
        {showEndBlockWarning && (
          <div role="dialog" aria-modal="true" aria-labelledby="end-block-title" className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="mqb-rise w-full max-w-md rounded-lg border border-slate-200 bg-white p-7">
              <h2 id="end-block-title" className="font-serif text-xl text-slate-900">
                {unansweredCount > 0 ? 'End block with unanswered questions?' : 'End this block?'}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {unansweredCount > 0 && (
                  <>
                    <span className="font-mono text-rose-700">{unansweredCount}</span> unanswered.{' '}
                  </>
                )}
                Your score is computed now and answers cannot be changed afterwards.
              </p>
              <div className="mt-7 flex justify-end gap-2">
                <button type="button" onClick={() => setShowEndBlockWarning(false)} className={ghostBtn} autoFocus>
                  Keep working
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEndBlockWarning(false);
                    finishSession(questions);
                  }}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-600"
                >
                  End block
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <header className={`flex h-14 shrink-0 items-center justify-between gap-4 border-b px-4 md:px-6 ${line}`}>
          <div className="flex min-w-0 items-center gap-4">
            <span className="font-mono text-sm text-slate-900 tabular-nums">
              {currentIndex + 1}
              <span className="text-slate-500"> / {session.questions.length}</span>
            </span>
            <span className="hidden font-mono text-[11px] uppercase tracking-[0.18em] text-teal-700 sm:inline">{modeLabel}</span>
          </div>

          <div className="flex items-center gap-1 font-mono text-sm tabular-nums text-slate-900">
            <Clock className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
            {settings.showTimer !== false ? (
              <TimerDisplay
                initialElapsed={0}
                initialTimeLeft={session.durationSec ? Math.max(0, session.durationSec - initialElapsed) : null}
                isTimed={session.mode === 'timed'}
                isPaused={isPaused}
                onTimeUp={handleTimeUp}
                type={session.mode === 'timed' ? 'remaining' : 'elapsed'}
              />
            ) : (
              <span className="text-slate-500">--:--</span>
            )}
            {session.mode !== 'review' && (
              <button type="button" onClick={() => setIsPaused(true)} aria-label="Pause block" title="Pause" className={`${iconBtn} ml-1 h-7 w-7`}>
                <Pause size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={handleToggleFlag}
              aria-pressed={currentQ.isFlagged}
              aria-label={currentQ.isFlagged ? 'Unmark question' : 'Mark question'}
              title="Mark (Alt+M)"
              className={iconBtn}
            >
              <Flag size={16} className={currentQ.isFlagged ? 'fill-rose-700 text-rose-700' : ''} />
            </button>
            <button type="button" onClick={() => setShowLabValues(true)} aria-label="Lab values" title="Lab values (Alt+L)" className={iconBtn}>
              <FlaskConical size={16} />
            </button>
            <button type="button" onClick={() => setShowCalculator(true)} aria-label="Calculator" title="Calculator (Alt+C)" className={iconBtn}>
              <CalcIcon size={16} />
            </button>
            <button type="button" onClick={() => setShowNotes(true)} aria-label="Notes" title="Notes" className={`${iconBtn} relative`}>
              <PenLine size={16} />
              {currentQ.notes && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-teal-600" />}
            </button>
            <button type="button" onClick={() => setSettingsMenuOpen(true)} aria-label="Settings" title="Settings" className={iconBtn}>
              <SettingsIcon size={16} />
            </button>
            {session.mode !== 'review' && (
              <button
                type="button"
                onClick={handleEndBlock}
                className="ml-2 cursor-pointer rounded-md px-3 py-1.5 text-sm text-slate-700 transition-colors hover:bg-rose-50 hover:text-rose-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-600"
              >
                End block
              </button>
            )}
          </div>
        </header>

        {/* Progress hairline */}
        <div className="h-px w-full shrink-0 bg-slate-50" role="progressbar" aria-label="Answered" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={answeredCount}>
          <div className="h-px bg-teal-600 transition-[width] duration-500 ease-out" style={{ width: `${progressPct}%` }} />
        </div>

        <div className="relative flex flex-1 overflow-hidden">
          {/* Question rail */}
          <nav aria-label="Questions" className={`flex w-14 shrink-0 flex-col items-stretch gap-px overflow-y-auto border-r py-3 ${line}`}>
            {questions.map((q, idx) => {
              const isActive = idx === currentIndex;
              const isAnswered = !!q.selectedOptionId;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => navigateToIndex(idx)}
                  aria-current={isActive ? 'true' : undefined}
                  aria-label={`Question ${idx + 1}${isAnswered ? ', answered' : ''}${q.isFlagged ? ', marked' : ''}`}
                  className={`relative flex h-9 cursor-pointer items-center justify-center font-mono text-xs tabular-nums transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-teal-300 ${
                    isActive ? 'bg-slate-100 text-slate-900' : isAnswered ? 'text-slate-700 hover:bg-slate-50' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-700'
                  }`}
                >
                  {isActive && <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-teal-600" />}
                  {idx + 1}
                  {q.isFlagged && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-600" />}
                  {isAnswered && !q.isFlagged && <span className="absolute right-1.5 top-1.5 h-1 w-1 rounded-full bg-teal-600" />}
                </button>
              );
            })}
          </nav>

          {/* Reading canvas */}
          <main ref={testPlayerMainRef} className="flex-1 overflow-y-auto px-5 pb-24 pt-8 md:px-10 lg:px-16">
            <div
              key={currentQ.id}
              className={`mqb-rise mx-auto ${settings.splitScreen ? 'grid max-w-6xl grid-cols-1 items-start gap-12 lg:grid-cols-2' : 'max-w-3xl'}`}
            >
              {/* Stem + exhibits */}
              <section aria-label="Question" className="min-w-0">
                <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">QID {currentQ.question.qid}</p>
                <div
                  ref={questionContentRef}
                  style={{ fontSize: `${settings.fontSize}px`, lineHeight: 1.7 }}
                  className="vignette-text select-text text-slate-900"
                  dangerouslySetInnerHTML={{ __html: sanitizeHTML(currentQ.highlightedQuestionText || currentQ.question.questionText) }}
                />

                {hasExhibits && (
                  <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {currentQ.question.media!.map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setZoomImage(m.url)}
                        aria-label={`Expand exhibit${m.caption ? `: ${m.caption}` : ''}`}
                        className="group/ex cursor-zoom-in overflow-hidden rounded-md border border-slate-200 bg-black/40 text-left transition-colors hover:border-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600"
                      >
                        <img src={m.url} alt={m.caption || 'Clinical exhibit'} className="h-44 w-full object-contain p-2" />
                        {m.caption && <span className="block border-t border-slate-200 px-3 py-2 text-xs text-slate-600">{m.caption}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </section>

              {/* Answers + feedback */}
              <section aria-label="Answers" className={`min-w-0 ${settings.splitScreen ? '' : 'mt-10'}`}>
                {optionsBlock}

                {session.mode === 'tutor' && !showFeedback && (
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs text-slate-500">
                      {currentQ.selectedOptionId ? 'Submit to lock your answer and see the explanation.' : 'Choose an answer to continue.'}
                    </span>
                    <button
                      type="button"
                      disabled={!currentQ.selectedOptionId || revealing}
                      onClick={revealCurrent}
                      className={primaryBtn}
                    >
                      {revealing ? 'Loading…' : 'Submit answer'}
                    </button>
                    {revealError && <p role="alert" className="w-full text-right text-xs text-rose-700">{revealError}</p>}
                  </div>
                )}

                {showFeedback && (
                  <div className="mt-10 space-y-8">
                    {currentQ.question.videoUrl && (
                      <div className="overflow-hidden rounded-xl border border-slate-200">
                        <VideoMnemonicPlayer
                          videoUrl={currentQ.question.videoUrl}
                          title={`Video Mnemonic · Question ${currentIndex + 1}`}
                          userEmail={userEmail}
                          mnemonicTitle={currentQ.question.videoMnemonicTitle || undefined}
                          mnemonicExplanation={currentQ.question.videoMnemonicExplanation || undefined}
                          questionRange={`Question ${currentIndex + 1}`}
                        />
                      </div>
                    )}

                    <div>
                      <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
                        <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-600">Explanation</h2>
                        {currentQ.isCorrect !== null && (
                          <span className={`font-mono text-[11px] uppercase tracking-wider ${currentQ.isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {currentQ.isCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                        )}
                      </div>
                      <div
                        ref={explanationContentRef}
                        className="qbank-explanation-body select-text text-[15px] leading-relaxed text-slate-700"
                        onClick={(e) => {
                          const target = e.target as HTMLElement;
                          if (target && target.tagName === 'IMG') {
                            const src = (target as HTMLImageElement).src;
                            if (src) setZoomImage(src);
                          }
                        }}
                        dangerouslySetInnerHTML={{ __html: sanitizeHTML(formatExplanationHtml(currentQ.highlightedExplanation || currentQ.question.explanation || '')) }}
                      />
                    </div>
                  </div>
                )}
              </section>
            </div>

            {/* Step navigation */}
            <div className={`mx-auto mt-14 flex items-center justify-between border-t pt-6 ${line} ${settings.splitScreen ? 'max-w-6xl' : 'max-w-3xl'}`}>
              <button type="button" onClick={handlePrev} disabled={currentIndex === 0} className={ghostBtn}>
                <ChevronLeft size={16} /> Previous
                {settings.showShortcuts && <kbd className="font-mono text-[10px] opacity-50">←</kbd>}
              </button>
              <button type="button" onClick={handleNext} className={primaryBtn}>
                {isLast ? (session.mode === 'review' ? 'Finish review' : 'Finish block') : 'Next'}
                {!isLast && <ChevronRight size={16} />}
                {settings.showShortcuts && <kbd className="font-mono text-[10px] opacity-50">→</kbd>}
              </button>
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

      {/* Item Omission Confirmation Modal */}
      {omissionWarning && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="omission-title"
          className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white border-2 border-amber-500 w-[440px] shadow-2xl rounded-sm overflow-hidden font-sans">
            <div className="bg-amber-600 px-4 py-2.5 text-white font-bold text-[13px] flex items-center justify-between">
              <span id="omission-title" className="flex items-center gap-2">
                <AlertTriangle size={16} />
                Confirm Item Omission
              </span>
              <button
                type="button"
                onClick={() => setOmissionWarning(null)}
                className="hover:bg-black/20 p-0.5 rounded text-xs cursor-pointer"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="p-6 text-[13px] text-slate-800 leading-relaxed font-sans">
              <p className="font-semibold text-slate-900 mb-2">
                You have not selected an answer for Item {currentIndex + 1}.
              </p>
              <p className="text-slate-600">
                Proceeding will leave this question marked as omitted. Would you like to proceed anyway or return to choose an answer?
              </p>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setOmissionWarning(null)}
                className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded shadow-xs transition-colors cursor-pointer"
              >
                Return to Question
              </button>
              <button
                type="button"
                onClick={() => {
                  const proceedCb = omissionWarning;
                  setOmissionWarning(null);
                  proceedCb();
                }}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded shadow-xs transition-colors cursor-pointer"
              >
                Proceed Anyway →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
