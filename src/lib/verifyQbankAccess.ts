import { prisma } from '@/lib/db';
import { Purchase } from '@prisma/client';

export class ForbiddenError extends Error {
  constructor(message = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export async function verifyQbankAccess(userId: string, qbankId: string): Promise<Purchase> {
  const purchase = await prisma.purchase.findUnique({
    where: { userId_qbankId: { userId, qbankId } },
  });
  if (!purchase || purchase.status !== 'active') {
    throw new ForbiddenError();
  }
  return purchase;
}
