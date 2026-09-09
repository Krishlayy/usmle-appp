import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { isFeatureEnabled } from '@/lib/featureFlags';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { Button } from '@/components/ui/Button';
import { BookOpen, Search, Filter, Bookmark, Eye, HelpCircle, ArrowRight, Sparkles, ShieldAlert } from 'lucide-react';
import { LibraryClientView } from './LibraryClientView';

export const metadata = {
  title: 'Medical Library & High-Yield Reference | Micro Q-Bank',
  description: 'Evidence-based USMLE summaries, diagnostic criteria, clinical pearls, and linked board questions.',
};

export default async function LibraryPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const enabled = await isFeatureEnabled('MEDICAL_LIBRARY');
  const session = await getServerSession(authOptions);

  if (!enabled) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="w-14 h-14 bg-cyan-100 text-cyan-800 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <BookOpen className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Medical Library Early Access</h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            The high-yield Medical Library is currently undergoing editorial review. Comprehensive clinical disease summaries, diagnostic criteria, and question links will be available shortly.
          </p>
          <Link href="/dashboard">
            <Button variant="secondary" className="mt-4">
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Fetch published articles
  const articles = await prisma.article.findMany({
    where: { status: 'PUBLISHED' },
    select: {
      id: true,
      title: true,
      slug: true,
      summary: true,
      specialty: true,
      system: true,
      tags: true,
      viewsCount: true,
      updatedAt: true,
      author: { select: { name: true } },
      _count: { select: { questions: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  // User bookmarks if authenticated
  let bookmarkedSlugs: string[] = [];
  if (session?.user?.id) {
    const userBookmarks = await prisma.articleBookmark.findMany({
      where: { userId: session.user.id },
      include: { article: { select: { slug: true } } },
    });
    bookmarkedSlugs = userBookmarks.map(b => b.article.slug);
  }

  // Distinct specialties and systems
  const specialties = Array.from(new Set(articles.map(a => a.specialty).filter(Boolean)));
  const systems = Array.from(new Set(articles.map(a => a.system).filter(Boolean))) as string[];

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950 text-white rounded-2xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold tracking-wide uppercase border border-cyan-500/30">
              <Sparkles className="w-3.5 h-3.5" /> High-Yield Reference
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-serif tracking-tight">
              Medical Knowledge Library
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Explore concise, board-focused articles covering essential pathophysiology, diagnostic flowcharts, and high-yield USMLE clinical pearls directly linked to our question bank.
            </p>
          </div>
        </div>

        {/* Interactive Client View (Search, Filters, Bookmarks, Grid) */}
        <LibraryClientView
          initialArticles={articles.map(a => ({
            ...a,
            updatedAt: a.updatedAt.toISOString(),
          }))}
          specialties={specialties}
          systems={systems}
          initialBookmarkedSlugs={bookmarkedSlugs}
          isLoggedIn={Boolean(session?.user?.id)}
        />
      </div>
    </div>
  );
}
