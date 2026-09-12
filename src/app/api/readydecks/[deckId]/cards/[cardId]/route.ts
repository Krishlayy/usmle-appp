import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { isFeatureEnabled } from '@/lib/featureFlags';
import DOMPurify from 'isomorphic-dompurify';

export const dynamic = 'force-dynamic';

export async function DELETE(
  req: Request,
  props: { params: Promise<{ deckId: string; cardId: string }> }
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
      select: { authorId: true }
    });

    if (!deck) {
      return new NextResponse('Deck not found', { status: 404 });
    }

    const isAdmin = (session.user as any).role === 'ADMIN' || (session.user as any).role === 'SUPERADMIN';
    if (deck.authorId !== session.user.id && !isAdmin) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Unlink the flashcard from this deck
    await prisma.deckCard.deleteMany({
      where: {
        deckId: params.deckId,
        flashcardId: params.cardId
      }
    });

    return NextResponse.json({ success: true, removedCardId: params.cardId });
  } catch (error) {
    console.error('[DECK_CARD_DELETE_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(
  req: Request,
  props: { params: Promise<{ deckId: string; cardId: string }> }
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

    const card = await prisma.flashcard.findUnique({
      where: { id: params.cardId },
      select: { userId: true }
    });

    if (!card) {
      return new NextResponse('Card not found', { status: 404 });
    }

    const isAdmin = (session.user as any).role === 'ADMIN' || (session.user as any).role === 'SUPERADMIN';
    if (card.userId !== session.user.id && !isAdmin) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const body = await req.json();
    const { front, back } = body;

    const updateData: any = {};
    if (front !== undefined) {
      const sanitizedFront = DOMPurify.sanitize(String(front).trim());
      if (sanitizedFront.length === 0 || sanitizedFront.length > 2000) {
        return new NextResponse('Front text must be between 1 and 2000 characters', { status: 400 });
      }
      updateData.front = sanitizedFront;
    }

    if (back !== undefined) {
      const sanitizedBack = DOMPurify.sanitize(String(back).trim());
      if (sanitizedBack.length === 0 || sanitizedBack.length > 5000) {
        return new NextResponse('Back text must be between 1 and 5000 characters', { status: 400 });
      }
      updateData.back = sanitizedBack;
    }

    const updatedCard = await prisma.flashcard.update({
      where: { id: params.cardId },
      data: updateData
    });

    return NextResponse.json(updatedCard);
  } catch (error) {
    console.error('[DECK_CARD_PUT_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}