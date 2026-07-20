import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { verifyQbankAccess } from '@/lib/verifyQbankAccess';
import { getCachedOrFetch } from '@/lib/redis';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { qbankId, qbankSlug, mode } = await req.json();

    if ((!qbankId && !qbankSlug) || !mode) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    let resolvedQbankId = qbankId;
    if (!resolvedQbankId && qbankSlug) {
      const qbank = await prisma.qBank.findUnique({ where: { slug: qbankSlug } });
      if (!qbank) return new NextResponse('QBank not found', { status: 404 });
      resolvedQbankId = qbank.id;
    }

    // Verify access
    await verifyQbankAccess(session.user.id, resolvedQbankId);

    // Fetch all PUBLISHED questions for this QBank, cached for 1 hour
    const questions = await getCachedOrFetch(
      `qbank:${resolvedQbankId}:questions:published`,
      () => prisma.question.findMany({
        where: { qbankId: resolvedQbankId, status: 'PUBLISHED' },
        orderBy: { createdAt: 'asc' }
      }),
      3600
    );

    // Calculate duration for timed mode (e.g., 90 seconds per question)
    const durationSec = mode === 'timed' ? questions.length * 90 : null;

    // We also need to assign questions to this session. Let's create the session first.
    const testSession = await prisma.testSession.create({
      data: {
        userId: session.user.id,
        qbankId: resolvedQbankId,
        mode,
        durationSec,
        status: 'in_progress',
      },
    });

    // Create UserProgress entries for this session
    if (questions.length > 0) {
      const userProgressData = questions.map((q) => ({
        userId: session.user.id,
        qbankId: resolvedQbankId,
        questionId: q.id,
        testSessionId: testSession.id,
        flagged: false,
      }));
      await prisma.userProgress.createMany({
        data: userProgressData,
      });
    }

    return NextResponse.json({ sessionId: testSession.id });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'ForbiddenError') {
      return new NextResponse('Forbidden', { status: 403 });
    }
    console.error('[TEST_SESSION_CREATE_ERROR]', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
