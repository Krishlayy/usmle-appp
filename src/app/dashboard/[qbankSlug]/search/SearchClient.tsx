'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Search,
  HelpCircle,
  BookOpen,
  Layers,
  FileText,
  ChevronRight,
  ExternalLink,
  Sparkles,
  X,
  Loader2,
} from 'lucide-react';

interface QuestionResult {
  id: string;
  qid: string;
  title: string;
  snippet: string;
  subtopic: string | null;
  difficulty: string;
  qbankSlug: string;
  qbankTitle: string;
  url: string;
}

interface ArticleResult {
  id: string;
  slug: string;
  title: string;
  snippet: string;
  specialty: string;
  system: string | null;
  tags: string[];
  url: string;
}

interface FlashcardResult {
  id: string;
  title: string;
  snippet: string;
  type: string;
  url: string;
}

interface NoteResult {
  id: string;
  title: string;
  snippet: string;
  qbankSlug: string;
  qbankTitle: string;
  url: string;
}

interface SearchResponse {
  enabled: boolean;
  query: string;
  totalResults: number;
  questions: QuestionResult[];
  articles: ArticleResult[];
  flashcards: FlashcardResult[];
  notes: NoteResult[];
}

interface Props {
  qbankSlug: string;
  qbankTitle: string;
}

export function SearchClient({ qbankSlug, qbankTitle }: Props) {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'questions' | 'library' | 'flashcards' | 'notes'>('all');
  const [scopeCurrentQbankOnly, setScopeCurrentQbankOnly] = useState(false);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Debounced search effect
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          q: query.trim(),
          type: activeTab,
          ...(scopeCurrentQbankOnly ? { qbankSlug } : {}),
        });
        const res = await fetch(`/api/search?${params.toString()}`);
        if (res.ok) {
          const data: SearchResponse = await res.json();
          setResults(data);
        }
      } catch (err) {
        console.error('Unified search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, activeTab, scopeCurrentQbankOnly, qbankSlug]);

  const quickSuggestions = [
    'Aortic Dissection',
    'Infective Endocarditis',
    'Mitral Stenosis',
    'Duke Criteria',
    'Beta-blockers',
  ];

  const totalResults = results?.totalResults || 0;
  const questionsCount = results?.questions?.length || 0;
  const articlesCount = results?.articles?.length || 0;
  const flashcardsCount = results?.flashcards?.length || 0;
  const notesCount = results?.notes?.length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-serif text-slate-900">
          Unified Medical Search
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Simultaneously query {qbankTitle} questions, medical library guides, active flashcards, and your personal annotations.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search symptoms, diseases, medications, criteria (e.g., 'Duke criteria', 'Aortic dissection')..."
            className="w-full pl-12 pr-12 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-cyan-600" />
              ) : (
                <X className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        {!query && (
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500">
            <span className="font-medium text-slate-400">High-yield suggestions:</span>
            {quickSuggestions.map((item) => (
              <button
                key={item}
                onClick={() => setQuery(item)}
                className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 hover:bg-cyan-50 hover:text-cyan-800 transition-colors cursor-pointer"
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tabs & Filters */}
      {query.length >= 2 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Domains ({totalResults})
            </button>

            <button
              onClick={() => setActiveTab('questions')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'questions'
                  ? 'bg-cyan-700 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" /> Questions ({questionsCount})
            </button>

            <button
              onClick={() => setActiveTab('library')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'library'
                  ? 'bg-indigo-700 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> Medical Library ({articlesCount})
            </button>

            <button
              onClick={() => setActiveTab('flashcards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'flashcards'
                  ? 'bg-emerald-700 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Flashcards ({flashcardsCount})
            </button>

            <button
              onClick={() => setActiveTab('notes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'notes'
                  ? 'bg-amber-700 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Notes ({notesCount})
            </button>
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={scopeCurrentQbankOnly}
              onChange={(e) => setScopeCurrentQbankOnly(e.target.checked)}
              className="rounded text-cyan-600 focus:ring-cyan-500"
            />
            <span>Limit questions to {qbankTitle}</span>
          </label>
        </div>
      )}

      {/* Results Content */}
      {query.length >= 2 && results && (
        <div className="space-y-6">
          {totalResults === 0 && !isLoading && (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-md mx-auto">
              <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No results found</h3>
              <p className="text-xs text-slate-500 mt-1">
                We couldn&apos;t find any matches for &quot;{query}&quot;. Try checking for typos or searching a broader term.
              </p>
            </div>
          )}

          {/* 1. Questions Section */}
          {(activeTab === 'all' || activeTab === 'questions') &&
            results.questions.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-cyan-600" /> Board Questions ({results.questions.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.questions.map((q) => (
                    <Card
                      key={q.id}
                      className="p-4 bg-white border border-slate-200 hover:border-cyan-300 hover:shadow-sm transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900">{q.qid}</span>
                          <span
                            className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded ${
                              q.difficulty === 'hard'
                                ? 'bg-red-100 text-red-800'
                                : q.difficulty === 'medium'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {q.difficulty}
                          </span>
                        </div>
                        {q.subtopic && (
                          <div className="text-[11px] font-semibold text-cyan-800">
                            {q.subtopic}
                          </div>
                        )}
                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                          {q.snippet}
                        </p>
                      </div>

                      <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-[10px] text-slate-400">
                          {q.qbankTitle}
                        </span>
                        <Link
                          href={q.url}
                          className="text-cyan-700 font-semibold hover:underline inline-flex items-center gap-1"
                        >
                          Practice in QBank <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

          {/* 2. Medical Library Articles Section */}
          {(activeTab === 'all' || activeTab === 'library') &&
            results.articles.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600" /> Medical Library ({results.articles.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.articles.map((art) => (
                    <Card
                      key={art.id}
                      className="p-4 bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-sm transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-800">
                            {art.specialty}
                          </span>
                          {art.system && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                              {art.system}
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 leading-snug">
                          {art.title}
                        </h3>
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {art.snippet}
                        </p>
                      </div>

                      <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex gap-1">
                          {art.tags.slice(0, 2).map((t) => (
                            <span key={t} className="text-[10px] text-slate-400">
                              #{t}
                            </span>
                          ))}
                        </div>
                        <Link
                          href={art.url}
                          className="text-indigo-700 font-semibold hover:underline inline-flex items-center gap-1"
                        >
                          Read Article <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

          {/* 3. ReadyDecks & Flashcards Section */}
          {(activeTab === 'all' || activeTab === 'flashcards') &&
            results.flashcards.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-600" /> Flashcards & Decks ({results.flashcards.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.flashcards.map((f) => (
                    <Card
                      key={f.id}
                      className="p-4 bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-sm transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 uppercase">
                          {f.type}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 leading-snug">
                          {f.title}
                        </h3>
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {f.snippet}
                        </p>
                      </div>

                      <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-end text-xs">
                        <Link
                          href={f.url}
                          className="text-emerald-700 font-semibold hover:underline inline-flex items-center gap-1"
                        >
                          Study Flashcard <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

          {/* 4. User Personal Notes Section */}
          {(activeTab === 'all' || activeTab === 'notes') &&
            results.notes.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-600" /> My Study Notes ({results.notes.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.notes.map((n) => (
                    <Card
                      key={n.id}
                      className="p-4 bg-white border border-slate-200 hover:border-amber-300 hover:shadow-sm transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <h3 className="text-sm font-bold text-slate-900 leading-snug">
                          {n.title}
                        </h3>
                        <div className="p-2.5 rounded bg-amber-50/70 border border-amber-200/70 text-xs text-amber-950 italic">
                          &quot;{n.snippet}&quot;
                        </div>
                      </div>

                      <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-[10px] text-slate-400">
                          {n.qbankTitle}
                        </span>
                        <Link
                          href={n.url}
                          className="text-amber-800 font-semibold hover:underline inline-flex items-center gap-1"
                        >
                          Open in QBank <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
}
