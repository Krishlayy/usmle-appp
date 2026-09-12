import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { isFeatureEnabled } from '@/lib/featureFlags';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const subject = searchParams.get('subject');

    const enabled = await isFeatureEnabled('READY_DECKS_V2');

    // If flag is disabled, return basic fallback
    if (!enabled) {
      return NextResponse.json({
        enabled: false,
        userDecks: [],
        curatedDecks: [],
        stats: { dueCount: 0, newCount: 0, totalCards: 0 },
      });
    }

    const whereSubject = subject ? { subject: { equals: subject, mode: 'insensitive' as const } } : {};

    // 1. Fetch curated decks (published by admins)
    const curatedDecks = await prisma.deck.findMany({
      where: {
        isPublished: true,
        ...whereSubject,
      },
      include: {
        author: { select: { name: true, email: true } },
        _count: { select: { cards: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 2. Fetch user's own decks
    const userDecks = await prisma.deck.findMany({
      where: {
        authorId: session.user.id,
        ...whereSubject,
      },
      include: {
        _count: { select: { cards: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // 3. Spaced repetition queue stats for current user
    const now = new Date();
    const [dueCount, newCount, totalCards] = await Promise.all([
      prisma.flashcard.count({
        where: {
          userId: session.user.id,
          nextReview: { lte: now },
          interval: { gt: 0 },
        },
      }),
      prisma.flashcard.count({
        where: {
          userId: session.user.id,
          interval: 0,
        },
      }),
      prisma.flashcard.count({
        where: { userId: session.user.id },
      }),
    ]);

    return NextResponse.json({
      enabled: true,
      userDecks,
      curatedDecks,
      stats: {
        dueCount,
        newCount,
        totalCards,
      },
    });
  } catch (error) {
    console.error('[READYDECKS_GET_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const enabled = await isFeatureEnabled('READY_DECKS_V2');
    if (!enabled) {
      return new NextResponse('ReadyDecks V2 feature is currently disabled', { status: 403 });
    }

    const body = await req.json();
    const { title, description, subject, tags, isPublished } = body;

    if (!title || !subject) {
      return new NextResponse('Title and subject are required', { status: 400 });
    }

    const isAdmin = (session.user as any).role === 'ADMIN' || (session.user as any).role === 'SUPERADMIN';
    const shouldPublish = Boolean(isPublished && isAdmin);

    const MAX_DECKS_PER_USER = 50;
    if (!isAdmin) {
      const existingDeckCount = await prisma.deck.count({
        where: { authorId: session.user.id }
      });
      if (existingDeckCount >= MAX_DECKS_PER_USER) {
        return new NextResponse(`You have reached the maximum limit of ${MAX_DECKS_PER_USER} decks`, { status: 400 });
      }
    }

    const deck = await prisma.deck.create({
      data: {
        title: String(title).trim().substring(0, 100),
        description: description ? String(description).trim().substring(0, 500) : null,
        subject: String(subject).trim().substring(0, 100),
        tags: Array.isArray(tags) ? tags.map(t => String(t).trim().substring(0, 50)) : [],
        isPublished: shouldPublish,
        authorId: session.user.id,
      },
    });

    return NextResponse.json(deck, { status: 201 });
  } catch (error) {
    console.error('[READYDECKS_POST_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
