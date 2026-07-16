import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse('Forbidden in production', { status: 403 });
  }
  const { email } = await req.json();

  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    await prisma.purchase.deleteMany({ where: { userId: user.id } });
    await prisma.userProgress.deleteMany({ where: { userId: user.id } });
    await prisma.testSession.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
  }

  return NextResponse.json({ success: true });
}
