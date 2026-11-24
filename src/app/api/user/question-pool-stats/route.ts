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
    const isStaff = ['ADMIN', 'SUPERADMIN'].includes(session.user.role);

    // 1. Get all active QBanks
    const qbanks = await prisma.qBank.findMany({
      where: { isActive: true },
      select: {
        id: true,
        title: true,
        slug: true,
        qbankCode: true,
        specialtyTag: true,
        description: true,
        price: true,
        currency: true,
        totalQuestions: true,
        _count: {
          select: { questions: { where: { status: 'PUBLISHED' } } }
        }
      },
      orderBy: { title: 'asc' }
    });

    // 2. Fetch user's active purchases
    const purchases = await prisma.purchase.findMany({
      where: { userId: session.user.id, status: 'active' },
      select: { qbankId: true }
    });
    const purchasedQBankIds = new Set(
      isStaff ? qbanks.map(q => q.id) : purchases.map(p => p.qbankId)
    );

    // 3. Fetch user's previous progress
    const userProgress = await prisma.userProgress.findMany({
      where: { userId: session.user.id },
      select: {
        qbankId: true,
        questionId: true,
        selectedAnswer: true,
        isCorrect: true,
        flagged: true
      }
    });

    // 4. Aggregate per QBank
    const poolStats = qbanks.map(q => {
      const qProgress = userProgress.filter(p => p.qbankId === q.id);
      const answeredSet = new Set(qProgress.filter(p => p.selectedAnswer).map(p => p.questionId));
      const incorrectSet = new Set(qProgress.filter(p => p.isCorrect === false).map(p => p.questionId));
      const flaggedSet = new Set(qProgress.filter(p => p.flagged === true).map(p => p.questionId));

      const totalPublished = q._count.questions;
      const unusedCount = Math.max(0, totalPublished - answeredSet.size);

      return {
        id: q.id,
        title: q.title,
        slug: q.slug,
        qbankCode: q.qbankCode,
        specialtyTag: q.specialtyTag,
        description: q.description,
        price: q.price,
        currency: q.currency,
        total: totalPublished,
        unused: unusedCount,
        incorrect: incorrectSet.size,
        flagged: flaggedSet.size,
        isPurchased: purchasedQBankIds.has(q.id),
      };
    });

    return NextResponse.json({ qbanks: poolStats });
  } catch (error) {
    console.error('Error fetching question pool stats:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
