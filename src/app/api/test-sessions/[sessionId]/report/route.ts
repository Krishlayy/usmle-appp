import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const reportSchema = z.object({
  questionId: z.string().min(1),
  issueType: z.enum(['TYPO', 'OUTDATED', 'INCORRECT', 'OTHER']),
  description: z.string().min(1).max(1000),
});

export async function POST(req: Request, props: { params: Promise<{ sessionId: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Verify session belongs to user
    const testSession = await prisma.testSession.findUnique({
      where: { id: params.sessionId }
    });

    if (!testSession || testSession.userId !== session.user.id) {
      return new NextResponse('Session not found', { status: 404 });
    }

    const body = await req.json();
    const parsed = reportSchema.safeParse(body);

    if (!parsed.success) {
      return new NextResponse('Invalid request data', { status: 400 });
    }

    const { questionId, issueType, description } = parsed.data;

    // Create the issue report
    const issue = await prisma.questionIssue.create({
      data: {
        questionId,
        userId: session.user.id,
        issueType,
        description,
        status: 'OPEN'
      }
    });

    return NextResponse.json(issue);
  } catch (error) {
    console.error('[REPORT_CREATE_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
