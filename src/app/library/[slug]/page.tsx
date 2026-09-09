import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { isFeatureEnabled } from '@/lib/featureFlags';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  BookOpen,
  ChevronLeft,
  Calendar,
  User,
  Eye,
  Bookmark,
  Share2,
  Sparkles,
  HelpCircle,
  Clock,
  Layers,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  History,
} from 'lucide-react';
import { ArticleReaderClient } from './ArticleReaderClient';

export default async function ArticlePage(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const enabled = await isFeatureEnabled('MEDICAL_LIBRARY');
  if (!enabled) {
    redirect('/dashboard');
  }

  const session = await getServerSession(authOptions);
  const isAdmin = (session?.user as any)?.role === 'ADMIN' || (session?.user as any)?.role === 'SUPERADMIN';

  const article = await prisma.article.findUnique({
    where: { slug: params.slug },
    include: {
      author: { select: { id: true, name: true, email: true } },
      revisions: {
        orderBy: { editedAt: 'desc' },
        take: 5,
        include: { editor: { select: { name: true, email: true } } },
      },
      questions: {
        include: {
          question: {
            select: {
              id: true,
              qid: true,
              questionText: true,
              difficulty: true,
              subtopic: true,
              qbank: { select: { slug: true, title: true } },
            },
          },
        },
      },
      bookmarks: session?.user?.id
        ? {
            where: { userId: session.user.id },
            select: { id: true },
          }
        : false,
    },
  });

  if (!article) {
    notFound();
  }

  if (article.status !== 'PUBLISHED' && !isAdmin) {
    notFound();
  }

  // Increment view count asynchronously
  prisma.article
    .update({
      where: { id: article.id },
      data: { viewsCount: { increment: 1 } },
    })
    .catch((err) => console.warn('Could not increment article view', err));

  const isBookmarked = Boolean(article.bookmarks && (article.bookmarks as any[]).length > 0);

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Back Link & Breadcrumbs */}
        <div className="flex items-center justify-between">
          <Link
            href="/library"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Medical Library
          </Link>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200">
              {article.specialty}
            </span>
            {article.system && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                {article.system}
              </span>
            )}
          </div>
        </div>

        {/* Main Article Content & Interactive Client Wrapper */}
        <ArticleReaderClient
          article={{
            id: article.id,
            title: article.title,
            slug: article.slug,
            summary: article.summary,
            body: article.body,
            specialty: article.specialty,
            system: article.system,
            tags: article.tags,
            viewsCount: article.viewsCount + 1,
            updatedAt: article.updatedAt.toISOString(),
            authorName: article.author?.name || 'USMLE Faculty Contributor',
            isBookmarked,
            questions: article.questions.map((aq) => ({
              id: aq.question.id,
              qid: aq.question.qid,
              stem: aq.question.questionText,
              difficulty: aq.question.difficulty,
              subtopic: aq.question.subtopic,
              qbankSlug: aq.question.qbank.slug,
              qbankTitle: aq.question.qbank.title,
            })),
            revisions: article.revisions.map((r) => ({
              id: r.id,
              editorName: r.editor.name || r.editor.email || 'Admin',
              changeDescription: r.changeDescription || 'Content refinement',
              editedAt: r.editedAt.toISOString(),
            })),
          }}
          isAdmin={isAdmin}
          isLoggedIn={Boolean(session?.user?.id)}
        />
      </div>
    </div>
  );
}
