import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { isFeatureEnabled } from '@/lib/featureFlags';

export const dynamic = 'force-dynamic';

export async function POST(
  req: Request,
  props: { params: Promise<{ slug: string }> }
) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const isAdmin = (session.user as any).role === 'ADMIN' || (session.user as any).role === 'SUPERADMIN';
    if (!isAdmin) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const enabled = await isFeatureEnabled('MEDICAL_LIBRARY');
    if (!enabled) {
      return new NextResponse('Medical Library is disabled', { status: 403 });
    }

    const article = await prisma.article.findUnique({
      where: { slug: params.slug },
      select: { id: true }
    });

    if (!article) {
      return new NextResponse('Article not found', { status: 404 });
    }

    const body = await req.json();
    const { questionId, action } = body; // action: 'add' | 'remove'

    if (!questionId) {
      return new NextResponse('questionId is required', { status: 400 });
    }

    if (action === 'remove') {
      await prisma.articleQuestion.deleteMany({
        where: {
          articleId: article.id,
          questionId: questionId,
        }
      });
      return NextResponse.json({ success: true, action: 'removed' });
    }

    const link = await prisma.articleQuestion.upsert({
      where: {
        articleId_questionId: {
          articleId: article.id,
          questionId: questionId,
        }
      },
      create: {
        articleId: article.id,
        questionId: questionId,
      },
      update: {}
    });

    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    console.error('[LIBRARY_QUESTION_LINK_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}