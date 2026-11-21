import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: Request, props: { params: Promise<{ sessionId: string }> }) {
  const params = await props.params;
  if (params.sessionId.startsWith('usmle-exam-')) {
    return NextResponse.json({
      sessionId: params.sessionId,
      mode: 'timed',
      status: 'completed',
    });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const testSession = await prisma.testSession.findUnique({
    where: { id: params.sessionId },
  });

  if (!testSession || testSession.userId !== session.user.id) {
    return new NextResponse('Not found', { status: 404 });
  }

  return NextResponse.json(testSession);
}
