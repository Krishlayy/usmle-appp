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

    const existing = await prisma.articleBookmark.findUnique({
      where: {
        articleId_userId: {
          articleId: article.id,
          userId: session.user.id,
        }
      }
    });

    if (existing) {
      await prisma.articleBookmark.delete({
        where: { id: existing.id }
      });
      return NextResponse.json({ bookmarked: false });
    } else {
      await prisma.articleBookmark.create({
        data: {
          articleId: article.id,
          userId: session.user.id,
        }
      });
      return NextResponse.json({ bookmarked: true });
    }
  } catch (error) {
    console.error('[LIBRARY_BOOKMARK_TOGGLE_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}