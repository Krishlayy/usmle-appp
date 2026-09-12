import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { isFeatureEnabled } from '@/lib/featureFlags';
import { calculateNextReview, FlashcardRating } from '@/lib/spacedRepetition';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const enabled = await isFeatureEnabled('READY_DECKS_V2');
    if (!enabled) {
      return new NextResponse('ReadyDecks feature is disabled', { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const deckId = searchParams.get('deckId');
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    const now = new Date();

    if (deckId) {
      const deck = await prisma.deck.findUnique({
        where: { id: deckId },
        select: { authorId: true, isPublished: true }
      });

      if (!deck) {
        return new NextResponse('Deck not found', { status: 404 });
      }

      const isAdmin = (session.user as any).role === 'ADMIN' || (session.user as any).role === 'SUPERADMIN';
      if (!deck.isPublished && deck.authorId !== session.user.id && !isAdmin) {
        return new NextResponse('Forbidden', { status: 403 });
      }

      // Get cards from specific deck
      const deckCards = await prisma.deckCard.findMany({
        where: { deckId },
        orderBy: { position: 'asc' },
        take: limit,
        include: {
          flashcard: {
            include: {
              question: {
                select: { qid: true, subtopic: true, questionText: true }
              }
            }
          }
        }
      });

      const cards = deckCards.map(dc => dc.flashcard);
      return NextResponse.json(cards);
    }

    // Default: daily review queue for user (due cards first, then new cards)
    const dueCards = await prisma.flashcard.findMany({
      where: {
        userId: session.user.id,
        nextReview: { lte: now },
      },
      orderBy: { nextReview: 'asc' },
      take: limit,
      include: {
        question: { select: { qid: true, subtopic: true, questionText: true } }
      }
    });

    return NextResponse.json(dueCards);
  } catch (error) {
    console.error('[READYDECKS_REVIEW_QUEUE_ERROR]', error);
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
      return new NextResponse('ReadyDecks feature is disabled', { status: 403 });
    }

    const body = await req.json();
    const { flashcardId, rating, deckId } = body;

    if (!flashcardId || !['AGAIN', 'GOOD', 'EASY'].includes(rating)) {
      return new NextResponse('Invalid review data. Rating must be AGAIN, GOOD, or EASY.', { status: 400 });
    }

    // Check flashcard existence
    const card = await prisma.flashcard.findUnique({
      where: { id: flashcardId }
    });

    if (!card) {
      return new NextResponse('Flashcard not found', { status: 404 });
    }

    const isAdmin = (session.user as any).role === 'ADMIN' || (session.user as any).role === 'SUPERADMIN';
    if (card.userId !== session.user.id && !isAdmin) {
      const inPublicDeck = await prisma.deckCard.findFirst({
        where: {
          flashcardId: card.id,
          deck: { isPublished: true }
        }
      });
      if (!inPublicDeck) {
        return new NextResponse('Forbidden: Cannot review another student\'s private flashcard', { status: 403 });
      }
    }

    // Calculate deterministic next review
    const calculation = calculateNextReview({
      previousInterval: card.interval,
      previousEaseFactor: card.easeFactor,
      rating: rating as FlashcardRating,
    });

    // Atomic update + audit log
    const [updatedCard, reviewRecord] = await prisma.$transaction([
      prisma.flashcard.update({
        where: { id: flashcardId },
        data: {
          interval: calculation.newInterval,
          easeFactor: calculation.newEaseFactor,
          nextReview: calculation.nextReview,
        }
      }),
      prisma.flashcardReview.create({
        data: {
          flashcardId,
          userId: session.user.id,
          rating,
          previousInterval: card.interval,
          newInterval: calculation.newInterval,
          previousEaseFactor: card.easeFactor,
          newEaseFactor: calculation.newEaseFactor,
          algorithmVersion: calculation.algorithmVersion,
        }
      })
    ]);

    // Cross-feature sync: If there is an active PlanTask of type FLASHCARD_REVIEW, update it!
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const matchingTask = await prisma.planTask.findFirst({
        where: {
          userId: session.user.id,
          taskType: 'FLASHCARD_REVIEW',
          isCompleted: false,
          scheduledDate: { gte: today, lt: tomorrow },
          ...(deckId ? { contentId: deckId } : {})
        }
      });

      if (matchingTask) {
        await prisma.planTask.update({
          where: { id: matchingTask.id },
          data: { isCompleted: true, completedAt: new Date() }
        });
      }
    } catch (e) {
      console.warn('[CROSS_FEATURE_PLANNER_SYNC_WARN]', e);
    }

    return NextResponse.json({
      success: true,
      card: updatedCard,
      review: reviewRecord,
    });
  } catch (error) {
    console.error('[READYDECKS_REVIEW_POST_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}