import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !['ADMIN', 'SUPERADMIN'].includes(session.user.role)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { userId, qbankId } = await req.json();

    if (!userId || !qbankId) {
      return new NextResponse('Missing userId or qbankId', { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return new NextResponse('User not found', { status: 404 });

    const qbank = await prisma.qBank.findUnique({ where: { id: qbankId } });
    if (!qbank) return new NextResponse('QBank not found', { status: 404 });

    const purchase = await prisma.purchase.upsert({
      where: {
        userId_qbankId: { userId, qbankId },
      },
      create: {
        userId,
        qbankId,
        amountPaidCents: 0,
        stripeSessionId: `admin_granted_${Date.now()}`,
        status: 'active',
        expiresAt: null,
      },
      update: {
        status: 'active',
        purchasedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, purchase });
  } catch (error) {
    console.error('Failed to grant qbank access:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
