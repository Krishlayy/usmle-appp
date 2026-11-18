import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const flashcards = await prisma.flashcard.findMany({
      where: { userId: session.user.id },
      include: {
        question: {
          select: {
            qid: true,
            subtopic: true,
            videoUrl: true,
          },
        },
      },
      orderBy: { nextReview: 'asc' },
    });

    const now = new Date();
    const dueCount = flashcards.filter(f => new Date(f.nextReview) <= now).length;

    return NextResponse.json({ flashcards, dueCount, totalCount: flashcards.length });
  } catch (error) {
    console.error('Error fetching all flashcards:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

// SM-2 Spaced Repetition Rating
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { flashcardId, rating } = await req.json(); // rating: 1 (Again), 2 (Hard), 3 (Good), 4 (Easy)

    if (!flashcardId || !rating) {
      return new NextResponse('Missing parameters', { status: 400 });
    }

    const card = await prisma.flashcard.findFirst({
      where: { id: flashcardId, userId: session.user.id },
    });

    if (!card) {
      return new NextResponse('Flashcard not found', { status: 404 });
    }

    let interval = card.interval;
    let easeFactor = card.easeFactor;

    if (rating === 1) {
      // Again
      interval = 1;
      easeFactor = Math.max(1.3, easeFactor - 0.2);
    } else if (rating === 2) {
      // Hard
      interval = interval <= 1 ? 1 : Math.round(interval * 1.2);
      easeFactor = Math.max(1.3, easeFactor - 0.15);
    } else if (rating === 3) {
      // Good
      interval = interval === 0 ? 1 : interval === 1 ? 3 : Math.round(interval * easeFactor);
    } else if (rating === 4) {
      // Easy
      interval = interval === 0 ? 2 : interval === 1 ? 4 : Math.round(interval * easeFactor * 1.3);
      easeFactor = easeFactor + 0.15;
    }

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);

    const updated = await prisma.flashcard.update({
      where: { id: card.id },
      data: {
        interval,
        easeFactor,
        nextReview,
      },
    });

    return NextResponse.json({ updated });
  } catch (error) {
    console.error('Error reviewing flashcard:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
