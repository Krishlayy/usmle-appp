'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { Button } from '@/components/ui/Button';
import { Search, Bookmark, Eye, HelpCircle, ArrowRight, BookOpen, Filter, X } from 'lucide-react';

interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  specialty: string;
  system: string | null;
  tags: string[];
  viewsCount: number;
  updatedAt: string;
  author: { name: string | null } | null;
  _count: { questions: number };
}

interface Props {
  initialArticles: ArticleItem[];
  specialties: string[];
  systems: string[];
  initialBookmarkedSlugs: string[];
  isLoggedIn: boolean;
}

export function LibraryClientView({
  initialArticles,
  specialties,
  systems,
  initialBookmarkedSlugs,
  isLoggedIn,
}: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [bookmarkedSlugs, setBookmarkedSlugs] = useState<Set<string>>(new Set(initialBookmarkedSlugs));
  const [bookmarkLoading, setBookmarkLoading] = useState<string | null>(null);

  const toggleBookmark = async (slug: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      window.location.href = '/login';
      return;
    }

    setBookmarkLoading(slug);
    try {
      const res = await fetch(`/api/library/${slug}/bookmark`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setBookmarkedSlugs(prev => {
          const next = new Set(prev);
          if (data.bookmarked) {
            next.add(slug);
          } else {
            next.delete(slug);
          }
          return next;
        });
      }
    } catch (err) {
      console.error('Failed to toggle bookmark', err);
    } finally {
      setBookmarkLoading(null);
    }
  };

  const filteredArticles = useMemo(() => {
    return initialArticles.filter(art => {
      if (showBookmarksOnly && !bookmarkedSlugs.has(art.slug)) {
        return false;
      }
      if (selectedSpecialty && art.specialty !== selectedSpecialty) {
        return false;
      }
      if (selectedSystem && art.system !== selectedSystem) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = art.title.toLowerCase().includes(q);
        const matchesSummary = art.summary.toLowerCase().includes(q);
        const matchesTags = art.tags.some(t => t.toLowerCase().includes(q));
        const matchesSpecialty = art.specialty.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSummary && !matchesTags && !matchesSpecialty) {
          return false;
        }
      }
      return true;
    });
  }, [initialArticles, showBookmarksOnly, bookmarkedSlugs, selectedSpecialty, selectedSystem, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search high-yield conditions, symptoms, criteria, or tags..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Toggles */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {isLoggedIn && (
            <button
              onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                showBookmarksOnly
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${showBookmarksOnly ? 'fill-amber-500 text-amber-500' : ''}`} />
              <span>Saved ({bookmarkedSlugs.size})</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Chips: Specialties & Systems */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
          <Filter className="w-3 h-3" /> Filters:
        </span>

        {/* All Filter */}
        <button
          onClick={() => {
            setSelectedSpecialty(null);
            setSelectedSystem(null);
          }}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
            !selectedSpecialty && !selectedSystem
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All Topics
        </button>

        {/* Specialties */}
        {specialties.map((spec) => (
          <button
            key={spec}
            onClick={() => setSelectedSpecialty(selectedSpecialty === spec ? null : spec)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              selectedSpecialty === spec
                ? 'bg-cyan-700 text-white shadow-sm'
                : 'bg-cyan-50 text-cyan-800 border border-cyan-200/60 hover:bg-cyan-100'
            }`}
          >
            {spec}
          </button>
        ))}

        {/* Systems */}
        {systems.map((sys) => (
          <button
            key={sys}
            onClick={() => setSelectedSystem(selectedSystem === sys ? null : sys)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              selectedSystem === sys
                ? 'bg-indigo-700 text-white shadow-sm'
                : 'bg-indigo-50 text-indigo-800 border border-indigo-200/60 hover:bg-indigo-100'
            }`}
          >
            {sys}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      {filteredArticles.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center max-w-lg mx-auto">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No articles found</h3>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search terms or clearing selected category filters.
          </p>
          <Button
            variant="secondary"
            className="mt-4 text-xs"
            onClick={() => {
              setSearchQuery('');
              setSelectedSpecialty(null);
              setSelectedSystem(null);
              setShowBookmarksOnly(false);
            }}
          >
            Reset All Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((art) => {
            const isBookmarked = bookmarkedSlugs.has(art.slug);
            return (
              <Card
                key={art.id}
                className="group relative flex flex-col justify-between hover:shadow-md hover:border-cyan-300 transition-all duration-200 bg-white"
              >
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200">
                        {art.specialty}
                      </span>
                      {art.system && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
                          {art.system}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => toggleBookmark(art.slug, e)}
                      disabled={bookmarkLoading === art.slug}
                      title={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
                      className="text-slate-400 hover:text-amber-500 transition-colors p-1 rounded-md hover:bg-slate-50"
                    >
                      <Bookmark
                        className={`w-4 h-4 ${
                          isBookmarked ? 'fill-amber-500 text-amber-500' : ''
                        }`}
                      />
                    </button>
                  </div>

                  <Link href={`/library/${art.slug}`} className="block group-hover:text-cyan-800 transition-colors">
                    <h2 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
                      {art.title}
                    </h2>
                  </Link>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {art.summary}
                  </p>

                  {/* Tags */}
                  {art.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {art.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-slate-50 text-slate-500 border border-slate-100"
                        >
                          #{tag}
                        </span>
                      ))}
                      {art.tags.length > 3 && (
                        <span className="text-[10px] text-slate-400 px-1 py-0.5">
                          +{art.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="px-6 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1" title="Views">
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      {art.viewsCount}
                    </span>
                    {art._count.questions > 0 && (
                      <span className="flex items-center gap-1 text-cyan-700 font-medium" title="Linked QBank Questions">
                        <HelpCircle className="w-3.5 h-3.5" />
                        {art._count.questions} questions
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/library/${art.slug}`}
                    className="inline-flex items-center gap-1 text-cyan-700 font-semibold group-hover:translate-x-0.5 transition-transform"
                  >
                    Read <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
