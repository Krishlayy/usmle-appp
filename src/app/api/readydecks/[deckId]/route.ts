import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { isFeatureEnabled } from '@/lib/featureFlags';

export const dynamic = 'force-dynamic';

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

    const enabled = await isFeatureEnabled('READY_DECKS_V2');
    if (!enabled) {
      return new NextResponse('ReadyDecks feature is disabled', { status: 403 });
    }

    const deck = await prisma.deck.findUnique({
      where: { id: params.deckId },
      include: {
        author: { select: { id: true, name: true, email: true } },
        cards: {
          orderBy: { position: 'asc' },
          include: {
            flashcard: {
              include: {
                question: {
                  select: { qid: true, subtopic: true, questionText: true }
                }
              }
            }
          }
        },
      }
    });

    if (!deck) {
      return new NextResponse('Deck not found', { status: 404 });
    }

    const isAdmin = (session.user as any).role === 'ADMIN' || (session.user as any).role === 'SUPERADMIN';
    if (!deck.isPublished && deck.authorId !== session.user.id && !isAdmin) {
      return new NextResponse('Access denied to unpublished deck', { status: 403 });
    }

    return NextResponse.json(deck);
  } catch (error) {
    console.error('[READYDECK_GET_DETAIL_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(
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
      where: { id: params.deckId }
    });

    if (!deck) {
      return new NextResponse('Deck not found', { status: 404 });
    }

    const isAdmin = (session.user as any).role === 'ADMIN' || (session.user as any).role === 'SUPERADMIN';
    if (deck.authorId !== session.user.id && !isAdmin) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const body = await req.json();
    const { title, description, subject, tags, isPublished } = body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = String(title).trim();
    if (description !== undefined) updateData.description = String(description).trim();
    if (subject !== undefined) updateData.subject = String(subject).trim();
    if (tags !== undefined && Array.isArray(tags)) updateData.tags = tags.map(t => String(t).trim());
    if (isPublished !== undefined && isAdmin) updateData.isPublished = Boolean(isPublished);

    const updated = await prisma.deck.update({
      where: { id: params.deckId },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[READYDECK_PUT_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  props: { params: Promise<{ deckId: string }> }
) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const deck = await prisma.deck.findUnique({
      where: { id: params.deckId }
    });

    if (!deck) {
      return new NextResponse('Deck not found', { status: 404 });
    }

    const isAdmin = (session.user as any).role === 'ADMIN' || (session.user as any).role === 'SUPERADMIN';
    if (deck.authorId !== session.user.id && !isAdmin) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    await prisma.deck.delete({
      where: { id: params.deckId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[READYDECK_DELETE_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}