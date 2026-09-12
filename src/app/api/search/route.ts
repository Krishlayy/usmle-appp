import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { isFeatureEnabled } from '@/lib/featureFlags';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const enabled = await isFeatureEnabled('UNIFIED_SEARCH');
    if (!enabled) {
      return NextResponse.json({
        enabled: false,
        totalResults: 0,
        questions: [],
        articles: [],
        flashcards: [],
        notes: [],
      });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.trim() || '';
    const type = searchParams.get('type') || 'all'; // all | questions | library | flashcards | notes
    const qbankSlug = searchParams.get('qbankSlug') || null;

    if (!query || query.length < 2) {
      return NextResponse.json({
        enabled: true,
        query,
        totalResults: 0,
        questions: [],
        articles: [],
        flashcards: [],
        notes: [],
      });
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const results: {
      questions: any[];
      articles: any[];
      flashcards: any[];
      notes: any[];
    } = {
      questions: [],
      articles: [],
      flashcards: [],
      notes: [],
    };

    // 1. Search Questions
    if (type === 'all' || type === 'questions') {
      const questionWhere: any = {
        status: 'PUBLISHED',
        OR: [
          { questionText: { contains: query, mode: 'insensitive' } },
          { explanation: { contains: query, mode: 'insensitive' } },
          { subtopic: { contains: query, mode: 'insensitive' } },
          { qid: { contains: query, mode: 'insensitive' } },
          { tags: { has: query } },
        ],
      };

      if (qbankSlug) {
        questionWhere.qbank = { slug: qbankSlug };
      }

      const questions = await prisma.question.findMany({
        where: questionWhere,
        select: {
          id: true,
          qid: true,
          questionText: true,
          subtopic: true,
          difficulty: true,
          qbank: {
            select: {
              id: true,
              slug: true,
              title: true,
            },
          },
        },
        take: 20,
      });

      results.questions = questions.map((q) => ({
        id: q.id,
        qid: q.qid,
        title: `${q.qid}: ${q.subtopic || 'General'}`,
        snippet: q.questionText.slice(0, 180) + '...',
        subtopic: q.subtopic,
        difficulty: q.difficulty,
        qbankSlug: q.qbank.slug,
        qbankTitle: q.qbank.title,
        url: `/dashboard/${q.qbank.slug}`,
      }));
    }

    // 2. Search Medical Library Articles (if MEDICAL_LIBRARY is also enabled)
    const libraryEnabled = await isFeatureEnabled('MEDICAL_LIBRARY');
    if (libraryEnabled && (type === 'all' || type === 'library')) {
      const articles = await prisma.article.findMany({
        where: {
          status: 'PUBLISHED',
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { summary: { contains: query, mode: 'insensitive' } },
            { body: { contains: query, mode: 'insensitive' } },
            { specialty: { contains: query, mode: 'insensitive' } },
            { system: { contains: query, mode: 'insensitive' } },
            { tags: { has: query } },
          ],
        },
        select: {
          id: true,
          slug: true,
          title: true,
          summary: true,
          specialty: true,
          system: true,
          tags: true,
          viewsCount: true,
        },
        take: 20,
      });

      results.articles = articles.map((a) => ({
        id: a.id,
        slug: a.slug,
        title: a.title,
        snippet: a.summary,
        specialty: a.specialty,
        system: a.system,
        tags: a.tags,
        url: `/library/${a.slug}`,
      }));
    }

    // 3. Search ReadyDecks & Flashcards (if READY_DECKS_V2 is also enabled)
    const flashcardsEnabled = await isFeatureEnabled('READY_DECKS_V2');
    if (flashcardsEnabled && (type === 'all' || type === 'flashcards')) {
      const deckWhere: any = {
        OR: [
          { isPublished: true },
          ...(userId ? [{ authorId: userId }] : [])
        ],
        AND: [
          {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
              { subject: { contains: query, mode: 'insensitive' } },
              { tags: { has: query } },
            ]
          }
        ]
      };

      const decks = await prisma.deck.findMany({
        where: deckWhere,
        select: {
          id: true,
          title: true,
          description: true,
          subject: true,
          _count: { select: { cards: true } },
        },
        take: 10,
      });

      const userFlashcards = userId
        ? await prisma.flashcard.findMany({
            where: {
              userId,
              OR: [
                { front: { contains: query, mode: 'insensitive' } },
                { back: { contains: query, mode: 'insensitive' } },
              ],
            },
            select: {
              id: true,
              front: true,
              back: true,
              qbankId: true,
            },
            take: 10,
          })
        : [];

      results.flashcards = [
        ...decks.map((d) => ({
          id: d.id,
          title: d.title,
          snippet: d.description || `Subject: ${d.subject} (${d._count.cards} cards)`,
          type: 'deck',
          url: `/dashboard/cardiology/flashcards/decks/${d.id}`,
        })),
        ...userFlashcards.map((f) => ({
          id: f.id,
          title: f.front,
          snippet: f.back.slice(0, 140) + '...',
          type: 'card',
          url: `/dashboard/cardiology/flashcards/review`,
        })),
      ];
    }

    // 4. Search User's Personal Notes (if authenticated)
    if (userId && (type === 'all' || type === 'notes')) {
      const userNotes = await prisma.userProgress.findMany({
        where: {
          userId,
          notes: {
            contains: query,
            mode: 'insensitive',
          },
        },
        select: {
          id: true,
          notes: true,
          attemptedAt: true,
          question: {
            select: {
              id: true,
              qid: true,
              subtopic: true,
              qbank: { select: { slug: true, title: true } },
            },
          },
        },
        take: 15,
      });

      results.notes = userNotes.map((n) => ({
        id: n.id,
        title: `Note on ${n.question.qid} (${n.question.subtopic || 'General'})`,
        snippet: n.notes || '',
        qbankSlug: n.question.qbank.slug,
        qbankTitle: n.question.qbank.title,
        url: `/dashboard/${n.question.qbank.slug}`,
      }));
    }

    const totalResults =
      results.questions.length +
      results.articles.length +
      results.flashcards.length +
      results.notes.length;

    return NextResponse.json({
      enabled: true,
      query,
      totalResults,
      ...results,
    });
  } catch (error) {
    console.error('[UNIFIED_SEARCH_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
