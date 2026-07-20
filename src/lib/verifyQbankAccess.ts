import { prisma } from '@/lib/db';
import { Purchase } from '@prisma/client';

export class ForbiddenError extends Error {
  constructor(message = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export async function verifyQbankAccess(userId: string, qbankId: string): Promise<Purchase> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (user?.role === 'ADMIN' || user?.role === 'SUPERADMIN') {
    return {
      id: `admin_bypass_${qbankId}`,
      userId,
      qbankId,
      status: 'active',
      amountPaidCents: 0,
      stripeSessionId: null,
      purchasedAt: new Date(),
      expiresAt: null,
    } as unknown as Purchase;
  }

  const purchase = await prisma.purchase.findUnique({
    where: { userId_qbankId: { userId, qbankId } },
  });
  if (!purchase || purchase.status !== 'active') {
    throw new ForbiddenError();
  }
  return purchase;
}
