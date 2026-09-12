import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { isFeatureEnabled } from '@/lib/featureFlags';

import DOMPurify from 'isomorphic-dompurify';

export const dynamic = 'force-dynamic';

const MAX_CARDS_PER_DECK = 500;
const MAX_FRONT_LENGTH = 2000;
const MAX_BACK_LENGTH = 5000;

export async function GET(
  req: Request,
  props: { params: Promise<{ deckId: string }> }
) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // IDOR Check: Ensure user owns private deck or is admin, or deck is published
    const deck = await prisma.deck.findUnique({
      where: { id: params.deckId },
      select: { authorId: true, isPublished: true }
    });

    if (!deck) {
      return new NextResponse('Deck not found', { status: 404 });
    }

    const isAdmin = (session.user as any).role === 'ADMIN' || (session.user as any).role === 'SUPERADMIN';
    if (!deck.isPublished && deck.authorId !== session.user.id && !isAdmin) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const cards = await prisma.deckCard.findMany({
      where: { deckId: params.deckId },
      orderBy: { position: 'asc' },
      include: {
        flashcard: true
      }
    });

    return NextResponse.json(cards);
  } catch (error) {
    console.error('[DECK_CARDS_GET_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(
  req: Request,
  props: { params: Promise<{ deckId: string }> }
) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const enabled = await isFeatureEnabled('READY_DECKS_V2');
    if (!enabled) {
      return new NextResponse('ReadyDecks feature is disabled', { status: 403 });
    }

    const deck = await prisma.deck.findUnique({
      where: { id: params.deckId },
      include: {
        _count: { select: { cards: true } }
      }
    });

    if (!deck) {
      return new NextResponse('Deck not found', { status: 404 });
    }

    const isAdmin = (session.user as any).role === 'ADMIN' || (session.user as any).role === 'SUPERADMIN';
    if (deck.authorId !== session.user.id && !isAdmin) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Card limit check
    if (deck._count.cards >= MAX_CARDS_PER_DECK && !isAdmin) {
      return new NextResponse(`Deck has reached the limit of ${MAX_CARDS_PER_DECK} cards`, { status: 400 });
    }

    const body = await req.json();
    const { flashcardId, front, back, questionId, qbankId } = body;

    let targetCardId = flashcardId;

    // If front and back provided, create the flashcard first
    if (!targetCardId && front && back) {
      const sanitizedFront = DOMPurify.sanitize(String(front).trim());
      const sanitizedBack = DOMPurify.sanitize(String(back).trim());

      if (sanitizedFront.length === 0 || sanitizedFront.length > MAX_FRONT_LENGTH) {
        return new NextResponse(`Front text must be between 1 and ${MAX_FRONT_LENGTH} characters`, { status: 400 });
      }

      if (sanitizedBack.length === 0 || sanitizedBack.length > MAX_BACK_LENGTH) {
        return new NextResponse(`Back text must be between 1 and ${MAX_BACK_LENGTH} characters`, { status: 400 });
      }

      // Find a default qbank if not provided
      let finalQbankId = qbankId;
      if (!finalQbankId) {
        const firstQbank = await prisma.qBank.findFirst({ select: { id: true } });
        finalQbankId = firstQbank?.id || 'default';
      }

      let finalQuestionId = questionId;
      if (!finalQuestionId) {
        const firstQ = await prisma.question.findFirst({ select: { id: true } });
        finalQuestionId = firstQ?.id;
      }

      if (!finalQuestionId) {
        return new NextResponse('Question reference required to author card', { status: 400 });
      }

      const newCard = await prisma.flashcard.create({
        data: {
          userId: session.user.id,
          qbankId: finalQbankId,
          questionId: finalQuestionId,
          front: sanitizedFront,
          back: sanitizedBack,
        }
      });
      targetCardId = newCard.id;
    }

    if (!targetCardId) {
      return new NextResponse('flashcardId or (front + back) is required', { status: 400 });
    }

    const highestCard = await prisma.deckCard.findFirst({
      where: { deckId: params.deckId },
      orderBy: { position: 'desc' },
      select: { position: true }
    });
    const nextPosition = (highestCard?.position ?? -1) + 1;

    const deckCard = await prisma.deckCard.upsert({
      where: {
        deckId_flashcardId: {
          deckId: params.deckId,
          flashcardId: targetCardId,
        }
      },
      create: {
        deckId: params.deckId,
        flashcardId: targetCardId,
        position: nextPosition,
      },
      update: {}
    });

    return NextResponse.json(deckCard, { status: 201 });
  } catch (error) {
    console.error('[DECK_CARDS_POST_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}