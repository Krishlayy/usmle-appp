import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { verifyQbankAccess } from '@/lib/verifyQbankAccess';

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

    // Verify access
    await verifyQbankAccess(session.user.id, qbank.id);

    const body = await req.json();
    const { questionId, front, back } = body;

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

    return NextResponse.json(flashcard);
  } catch (error: any) {
    if (error?.name === 'ForbiddenError') {
      return new NextResponse('Forbidden: Question bank is locked.', { status: 403 });
    }
    console.error('[FLASHCARD_CREATE_ERROR]', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
