import { create } from 'zustand';

export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string | null;
}

export interface Question {
  id: string;
  qid: string;
  questionText: string;
  explanation: string | null;
  acceptableAnswers: string[];
  tags: string[];
  videoUrl?: string | null;
  media?: { id: string; type: string; url: string; caption?: string | null; displaySize?: string; placement?: string; [key: string]: unknown }[];
  options: Option[];
}

export interface SessionQuestion {
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
}

interface TestPlayerState {
  sessionId: string;
  questions: SessionQuestion[];
  currentIndex: number;
  isPaused: boolean;
  initSession: (sessionId: string, initialQuestions: SessionQuestion[], initialIndex: number) => void;
  setCurrentIndex: (index: number | ((prev: number) => number)) => void;
  setIsPaused: (isPaused: boolean | ((prev: boolean) => boolean)) => void;
  updateQuestion: (index: number, updates: Partial<SessionQuestion>) => void;
  updateQuestionById: (id: string, updates: Partial<SessionQuestion>) => void;
  setQuestions: (questions: SessionQuestion[] | ((prev: SessionQuestion[]) => SessionQuestion[])) => void;
}

export const useTestPlayerStore = create<TestPlayerState>((set) => ({
  sessionId: '',
  questions: [],
  currentIndex: 0,
  isPaused: false,
  
  initSession: (sessionId, initialQuestions, initialIndex) => set({ 
    sessionId, 
    questions: initialQuestions, 
    currentIndex: initialIndex 
  }),
  
  setCurrentIndex: (index) => set((state) => ({ currentIndex: typeof index === 'function' ? index(state.currentIndex) : index })),
  
  setIsPaused: (isPaused) => set((state) => ({ isPaused: typeof isPaused === 'function' ? isPaused(state.isPaused) : isPaused })),
  
  updateQuestion: (index, updates) => set((state) => {
    const newQuestions = [...state.questions];
    newQuestions[index] = { ...newQuestions[index], ...updates };
    return { questions: newQuestions };
  }),
  
  updateQuestionById: (id, updates) => set((state) => {
    const index = state.questions.findIndex(q => q.id === id);
    if (index === -1) return state;
    const newQuestions = [...state.questions];
    newQuestions[index] = { ...newQuestions[index], ...updates };
    return { questions: newQuestions };
  }),
  
  setQuestions: (questions) => set((state) => ({ questions: typeof questions === 'function' ? questions(state.questions) : questions })),
}));
