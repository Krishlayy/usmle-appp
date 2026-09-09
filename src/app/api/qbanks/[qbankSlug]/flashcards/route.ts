import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: Request, props: { params: Promise<{ qbankSlug: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const qbank = await prisma.qBank.findUnique({
      where: { slug: params.qbankSlug }
    });

    if (!qbank) {
      return new NextResponse('QBank not found', { status: 404 });
    }

    const body = await req.json();
    const { questionId, front, back, deckId } = body;

    if (!questionId || !front || !back) {
      return new NextResponse('Invalid request', { status: 400 });
    }

    const flashcard = await prisma.flashcard.create({
      data: {
        userId: session.user.id,
        qbankId: qbank.id,
        questionId,
        front,
        back
      }
    });

    if (deckId) {
      const highest = await prisma.deckCard.findFirst({
        where: { deckId },
        orderBy: { position: 'desc' },
        select: { position: true }
      });
      await prisma.deckCard.create({
        data: {
          deckId,
          flashcardId: flashcard.id,
          position: (highest?.position ?? -1) + 1,
        }
      }).catch(e => console.warn('Could not link card to deck:', e));
    }

    return NextResponse.json(flashcard);
  } catch (error) {
    console.error('[FLASHCARD_CREATE_ERROR]', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
