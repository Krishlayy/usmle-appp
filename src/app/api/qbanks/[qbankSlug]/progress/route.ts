import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ qbankSlug: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const params = await props.params;

  try {
    const qbank = await prisma.qBank.findUnique({
      where: { slug: params.qbankSlug },
      select: { id: true, title: true, totalQuestions: true },
    });

    if (!qbank) {
      return NextResponse.json({ error: 'QBank not found' }, { status: 404 });
    }

    // Get unique attempted questions
    const progress = await prisma.userProgress.findMany({
      where: {
        userId: session.user.id,
        qbankId: qbank.id,
        selectedAnswer: { not: null },
      },
      select: { questionId: true },
    });

    const completedQuestions = new Set(progress.map(p => p.questionId)).size;

    return NextResponse.json({
      title: qbank.title,
      totalQuestions: qbank.totalQuestions,
      completedQuestions,
    });
  } catch (error) {
    console.error('Failed to fetch progress:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
