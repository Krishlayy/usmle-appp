import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const purchaseStatusSchema = z.object({
  status: z.enum(['active', 'refunded']),
});

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const parsed = purchaseStatusSchema.safeParse(body);

    if (!parsed.success) {
      return new NextResponse('Invalid status', { status: 400 });
    }

    const purchase = await prisma.purchase.update({
      where: { id: params.id },
      data: { status: parsed.data.status },
    });

    return NextResponse.json(purchase);
  } catch (error) {
    console.error('[PURCHASE_UPDATE_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
