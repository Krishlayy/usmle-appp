import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const roleSchema = z.object({
  role: z.enum(['STUDENT', 'ADMIN']),
});

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !['ADMIN', 'SUPERADMIN'].includes(session.user.role)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (session.user.id === params.id) {
      return new NextResponse('You cannot change your own role', { status: 400 });
    }

    const body = await req.json();
    const parsed = roleSchema.safeParse(body);

    if (!parsed.success) {
      return new NextResponse('Invalid role', { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: { role: parsed.data.role },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('[USER_ROLE_UPDATE_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
