import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { isFeatureEnabled } from '@/lib/featureFlags';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  props: { params: Promise<{ slug: string }> }
) {
  try {
    const params = await props.params;
    const enabled = await isFeatureEnabled('MEDICAL_LIBRARY');
    if (!enabled) {
      return new NextResponse('Medical Library is disabled', { status: 403 });
    }

    const session = await getServerSession(authOptions);
    const isAdmin = (session?.user as any)?.role === 'ADMIN' || (session?.user as any)?.role === 'SUPERADMIN';

    const article = await prisma.article.findUnique({
      where: { slug: params.slug },
      include: {
        author: { select: { id: true, name: true, email: true } },
        revisions: {
          orderBy: { editedAt: 'desc' },
          take: 5,
          include: { editor: { select: { name: true } } },
        },
        questions: {
          include: {
            question: {
              select: {
                id: true,
                qid: true,
                questionText: true,
                difficulty: true,
                subtopic: true,
                qbank: { select: { slug: true, title: true } },
              }
            }
          }
        },
        bookmarks: session?.user?.id ? {
          where: { userId: session.user.id },
          select: { id: true },
        } : false,
      }
    });

    if (!article) {
      return new NextResponse('Article not found', { status: 404 });
    }

    if (article.status !== 'PUBLISHED' && !isAdmin) {
      return new NextResponse('Article is in draft mode', { status: 403 });
    }

    // Increment view count asynchronously (non-blocking)
    prisma.article.update({
      where: { id: article.id },
      data: {
        viewsCount: { increment: 1 },
      }
    }).catch(e => console.warn('Could not increment article view:', e));

    prisma.articleView.create({
      data: {
        articleId: article.id,
        userId: session?.user?.id || null,
      }
    }).catch(() => {});

    const isBookmarked = Boolean(article.bookmarks && (article.bookmarks as any[]).length > 0);

    return NextResponse.json({
      ...article,
      isBookmarked,
    });
  } catch (error) {
    console.error('[LIBRARY_ARTICLE_GET_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(
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
      return new NextResponse('Forbidden. Admin access required.', { status: 403 });
    }

    const article = await prisma.article.findUnique({
      where: { slug: params.slug },
    });

    if (!article) {
      return new NextResponse('Article not found', { status: 404 });
    }

    const body = await req.json();
    const { title, summary, body: content, specialty, system, tags, status, changeDescription } = body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = String(title).trim();
    if (summary !== undefined) updateData.summary = String(summary).trim();
    if (content !== undefined) updateData.body = String(content);
    if (specialty !== undefined) updateData.specialty = String(specialty).trim();
    if (system !== undefined) updateData.system = system ? String(system).trim() : null;
    if (tags !== undefined && Array.isArray(tags)) updateData.tags = tags.map(t => String(t).trim());
    if (status !== undefined) updateData.status = status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT';

    const [updatedArticle] = await prisma.$transaction([
      prisma.article.update({
        where: { id: article.id },
        data: updateData,
      }),
      prisma.articleRevision.create({
        data: {
          articleId: article.id,
          editorId: session.user.id,
          body: content || article.body,
          summary: summary || article.summary,
          changeDescription: changeDescription || 'Updated article content',
        }
      })
    ]);

    return NextResponse.json(updatedArticle);
  } catch (error) {
    console.error('[LIBRARY_ARTICLE_PUT_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
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

    await prisma.article.delete({
      where: { slug: params.slug }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[LIBRARY_ARTICLE_DELETE_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}