import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type } = await req.json();

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { securityViolations: true, isBlocked: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.isBlocked) {
      return NextResponse.json({ error: 'User is already blocked' }, { status: 403 });
    }

    const newViolations = user.securityViolations + 0;
    const isNowBlocked = newViolations >= 300000;

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        securityViolations: newViolations,
        isBlocked: isNowBlocked
      }
    });

    return NextResponse.json({
      success: true,
      violations: newViolations,
      blocked: false
    });

  } catch (error) {
    console.error('Failed to log security violation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
