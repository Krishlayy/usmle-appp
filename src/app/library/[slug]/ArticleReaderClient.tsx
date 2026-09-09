'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Bookmark,
  Share2,
  Calendar,
  User,
  Eye,
  Sparkles,
  HelpCircle,
  Clock,
  Layers,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  History,
  PlusCircle,
  Check,
} from 'lucide-react';

interface QuestionLink {
  id: string;
  qid: string;
  stem: string;
  difficulty: string;
  subtopic: string | null;
  qbankSlug: string;
  qbankTitle: string;
}

interface Revision {
  id: string;
  editorName: string;
  changeDescription: string;
  editedAt: string;
}

interface ArticleData {
  id: string;
  title: string;
  slug: string;
  summary: string;
  body: string;
  specialty: string;
  system: string | null;
  tags: string[];
  viewsCount: number;
  updatedAt: string;
  authorName: string;
  isBookmarked: boolean;
  questions: QuestionLink[];
  revisions: Revision[];
}

interface Props {
  article: ArticleData;
  isAdmin: boolean;
  isLoggedIn: boolean;
}

export function ArticleReaderClient({ article, isAdmin, isLoggedIn }: Props) {
  const [isBookmarked, setIsBookmarked] = useState(article.isBookmarked);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardFront, setCardFront] = useState(article.title);
  const [cardBack, setCardBack] = useState(article.summary);
  const [cardCreated, setCardCreated] = useState(false);
  const [cardLoading, setCardLoading] = useState(false);

  const toggleBookmark = async () => {
    if (!isLoggedIn) {
      window.location.href = '/login';
      return;
    }

    setBookmarkLoading(true);
    try {
      const res = await fetch(`/api/library/${article.slug}/bookmark`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setIsBookmarked(data.bookmarked);
      }
    } catch (err) {
      console.error('Failed to toggle bookmark', err);
    } finally {
      setBookmarkLoading(false);
    }
  };

  const copyShareLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCreateFlashcard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      window.location.href = '/login';
      return;
    }

    setCardLoading(true);
    try {
      const res = await fetch('/api/readydecks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Study Deck: ${article.specialty}`,
          subject: article.specialty,
          tags: article.tags,
          isPublished: false,
        }),
      });

      // Get or create deck, then add card
      let deckId: string | null = null;
      if (res.ok) {
        const deck = await res.json();
        deckId = deck.id;
      } else {
        // Fetch existing decks
        const listRes = await fetch('/api/readydecks');
        if (listRes.ok) {
          const list = await listRes.json();
          if (list.decks && list.decks.length > 0) {
            deckId = list.decks[0].id;
          }
        }
      }

      if (deckId) {
        await fetch(`/api/readydecks/${deckId}/cards`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            front: cardFront,
            back: cardBack,
          }),
        });
        setCardCreated(true);
        setTimeout(() => {
          setShowCardModal(false);
          setCardCreated(false);
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to create flashcard', err);
    } finally {
      setCardLoading(false);
    }
  };

  // Render article body with clean formatting
  const renderFormattedBody = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let listBuffer: string[] = [];

    const flushList = () => {
      if (listBuffer.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="my-3 space-y-1.5 list-disc list-inside text-slate-700 text-sm leading-relaxed pl-2">
            {listBuffer.map((item, idx) => (
              <li key={idx} className="marker:text-cyan-600">
                <span dangerouslySetInnerHTML={{ __html: item }} />
              </li>
            ))}
          </ul>
        );
        listBuffer = [];
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith('* ') || line.startsWith('- ')) {
        const formattedItem = line
          .substring(2)
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>');
        listBuffer.push(formattedItem);
        continue;
      }

      flushList();

      if (line.startsWith('### ')) {
        elements.push(
          <h3
            key={`h3-${i}`}
            className="text-lg font-bold text-slate-900 mt-6 mb-2 flex items-center gap-2 border-b border-slate-100 pb-1"
          >
            {line.replace('### ', '')}
          </h3>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2
            key={`h2-${i}`}
            className="text-xl font-bold text-slate-900 mt-8 mb-3 flex items-center gap-2 text-cyan-900 border-b border-cyan-100 pb-2"
          >
            {line.replace('## ', '')}
          </h2>
        );
      } else if (line.startsWith('#### ')) {
        elements.push(
          <h4
            key={`h4-${i}`}
            className="text-base font-semibold text-slate-800 mt-4 mb-1"
          >
            {line.replace('#### ', '')}
          </h4>
        );
      } else if (line.trim().length > 0) {
        // Detect high-yield callouts
        const isPearl = line.includes('High-Yield') || line.includes('Pearl');
        const formattedText = line
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>');

        elements.push(
          <p
            key={`p-${i}`}
            className={`my-3 text-sm leading-relaxed ${
              isPearl
                ? 'bg-amber-50/80 border-l-4 border-amber-400 p-3 rounded-r-lg text-amber-950 font-medium shadow-xs'
                : 'text-slate-700'
            }`}
            dangerouslySetInnerHTML={{ __html: formattedText }}
          />
        );
      }
    }

    flushList();
    return elements;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Article Main Column (8 cols) */}
      <article className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-10 space-y-8">
        {/* Article Header */}
        <div className="space-y-4 border-b border-slate-100 pb-6">
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 leading-tight">
            {article.title}
          </h1>

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              {article.authorName}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Updated {new Date(article.updatedAt).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              {article.viewsCount} views
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              variant={isBookmarked ? 'secondary' : 'primary'}
              size="sm"
              onClick={toggleBookmark}
              disabled={bookmarkLoading}
              className={`flex items-center gap-1.5 text-xs ${
                isBookmarked ? 'text-amber-800 border-amber-300 bg-amber-50' : ''
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
              {isBookmarked ? 'Saved to Bookmarks' : 'Bookmark Article'}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowCardModal(true)}
              className="flex items-center gap-1.5 text-xs"
            >
              <PlusCircle className="w-3.5 h-3.5 text-cyan-700" />
              Create Flashcard
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={copyShareLink}
              className="flex items-center gap-1.5 text-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied Link
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-500" /> Share
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Executive Summary Box */}
        <div className="bg-gradient-to-r from-cyan-50/70 to-blue-50/70 border border-cyan-200/80 rounded-xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-900 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-cyan-600" /> High-Yield Executive Summary
          </div>
          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
            {article.summary}
          </p>
        </div>

        {/* Formatted Article Body */}
        <div className="prose prose-slate max-w-none prose-headings:font-serif">
          {renderFormattedBody(article.body)}
        </div>

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="border-t border-slate-100 pt-6 space-y-2">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Topic Tags
            </div>
            <div className="flex flex-wrap gap-1.5">
              {article.tags.map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* Right Sidebar (4 cols): Related Questions, Flashcards & Revisions */}
      <aside className="lg:col-span-4 space-y-6">
        {/* Linked QBank Practice Questions */}
        <Card className="p-5 space-y-4 bg-white border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
              <HelpCircle className="w-4 h-4 text-cyan-600" /> Linked QBank Questions
            </div>
            <span className="text-xs bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded-full font-semibold">
              {article.questions.length}
            </span>
          </div>

          {article.questions.length === 0 ? (
            <p className="text-xs text-slate-500 py-2">
              No direct question links configured yet for this topic.
            </p>
          ) : (
            <div className="space-y-3">
              {article.questions.map((q) => (
                <div
                  key={q.id}
                  className="p-3.5 rounded-lg border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 hover:border-cyan-300 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{q.qid}</span>
                    <span
                      className={`text-[10px] uppercase font-semibold px-2 py-0.2 rounded ${
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

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {q.stem}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-500">
                      {q.qbankTitle}
                    </span>
                    <Link
                      href={`/dashboard/${q.qbankSlug}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-700 hover:text-cyan-900"
                    >
                      Practice <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* ReadyDecks Spaced Repetition Link */}
        <Card className="p-5 space-y-3 bg-gradient-to-br from-cyan-900 to-slate-900 text-white shadow-md">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-300">
            <Layers className="w-4 h-4" /> ReadyDecks Spaced Repetition
          </div>
          <h3 className="text-sm font-bold text-white">
            Reinforce this topic with active recall
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Flashcards test high-yield diagnostic criteria and board pearls using the SM-2 spaced repetition algorithm.
          </p>
          <Link href="/dashboard/cardiology/flashcards" className="block pt-1">
            <Button variant="secondary" size="sm" className="w-full text-xs font-semibold">
              Open ReadyDecks
            </Button>
          </Link>
        </Card>

        {/* Revision History (Admin Only) */}
        {isAdmin && article.revisions.length > 0 && (
          <Card className="p-5 space-y-3 bg-white border-slate-200">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-700 uppercase tracking-wider">
              <History className="w-3.5 h-3.5 text-slate-500" /> Editorial Revision History
            </div>
            <div className="space-y-2.5 text-xs">
              {article.revisions.map((rev) => (
                <div key={rev.id} className="p-2 rounded bg-slate-50 border border-slate-100">
                  <div className="font-semibold text-slate-800">
                    {rev.changeDescription}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    by {rev.editorName} • {new Date(rev.editedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </aside>

      {/* Create Flashcard Modal */}
      {showCardModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-cyan-600" /> Create Flashcard
              </h3>
              <button
                onClick={() => setShowCardModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            {cardCreated ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <div className="text-sm font-semibold text-slate-800">
                  Flashcard Added to ReadyDecks!
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateFlashcard} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Front (Prompt / Question)
                  </label>
                  <textarea
                    rows={3}
                    value={cardFront}
                    onChange={(e) => setCardFront(e.target.value)}
                    required
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Back (High-Yield Answer & Pearls)
                  </label>
                  <textarea
                    rows={4}
                    value={cardBack}
                    onChange={(e) => setCardBack(e.target.value)}
                    required
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowCardModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={cardLoading}
                  >
                    {cardLoading ? 'Adding...' : 'Save to ReadyDecks'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
