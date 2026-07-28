import { expect, test, vi, describe, beforeEach } from 'vitest';
import { verifyQbankAccess, ForbiddenError } from '../src/lib/verifyQbankAccess';
import { prisma } from '../src/lib/db';

vi.mock('../src/lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn().mockResolvedValue(null), // default: not an admin
    },
    purchase: {
      findUnique: vi.fn(),
    },
  },
}));

describe('verifyQbankAccess', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('should return purchase if active', async () => {
    const mockPurchase = { id: 'p1', userId: 'u1', qbankId: 'q1', status: 'active' };
    vi.mocked(prisma.purchase.findUnique).mockResolvedValue(mockPurchase as any);

    const result = await verifyQbankAccess('u1', 'q1');
    expect(result).toEqual(mockPurchase);
    expect(prisma.purchase.findUnique).toHaveBeenCalledWith({
      where: { userId_qbankId: { userId: 'u1', qbankId: 'q1' } },
    });
  });

  test('should throw ForbiddenError if purchase not found', async () => {
    vi.mocked(prisma.purchase.findUnique).mockResolvedValue(null);

    await expect(verifyQbankAccess('u1', 'q1')).rejects.toThrow(ForbiddenError);
  });

  test('should throw ForbiddenError if purchase status is not active', async () => {
    const mockPurchase = { id: 'p1', userId: 'u1', qbankId: 'q1', status: 'cancelled' };
    vi.mocked(prisma.purchase.findUnique).mockResolvedValue(mockPurchase as any);

    await expect(verifyQbankAccess('u1', 'q1')).rejects.toThrow(ForbiddenError);
  });
});
