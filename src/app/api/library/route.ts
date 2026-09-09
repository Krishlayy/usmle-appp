import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { isFeatureEnabled } from '@/lib/featureFlags';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const enabled = await isFeatureEnabled('MEDICAL_LIBRARY');
    if (!enabled) {
      return NextResponse.json({
        enabled: false,
        articles: [],
        specialties: [],
      });
    }

    const session = await getServerSession(authOptions);
    const isAdmin = (session?.user as any)?.role === 'ADMIN' || (session?.user as any)?.role === 'SUPERADMIN';

    const { searchParams } = new URL(req.url);
    const specialty = searchParams.get('specialty');
    const system = searchParams.get('system');
    const query = searchParams.get('q');
    const includeDrafts = searchParams.get('includeDrafts') === 'true' && isAdmin;

    const where: any = {};
    if (!includeDrafts) {
      where.status = 'PUBLISHED';
    }
    if (specialty) {
      where.specialty = { equals: specialty, mode: 'insensitive' };
    }
    if (system) {
      where.system = { equals: system, mode: 'insensitive' };
    }
    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { summary: { contains: query, mode: 'insensitive' } },
        { tags: { has: query } },
      ];
    }

    const articles = await prisma.article.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        summary: true,
        specialty: true,
        system: true,
        tags: true,
        status: true,
        viewsCount: true,
        updatedAt: true,
        author: { select: { name: true } },
        _count: { select: { questions: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    });

    // Aggregate distinct specialties and systems for browsing filters
    const allArticles = await prisma.article.findMany({
      where: includeDrafts ? {} : { status: 'PUBLISHED' },
      select: { specialty: true, system: true },
    });

    const specialties = Array.from(new Set(allArticles.map(a => a.specialty).filter(Boolean)));
    const systems = Array.from(new Set(allArticles.map(a => a.system).filter(Boolean))) as string[];

    return NextResponse.json({
      enabled: true,
      articles,
      specialties,
      systems,
    });
  } catch (error) {
    console.error('[LIBRARY_GET_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const isAdmin = (session.user as any).role === 'ADMIN' || (session.user as any).role === 'SUPERADMIN';
    if (!isAdmin) {
      return new NextResponse('Forbidden. Admin access required.', { status: 403 });
    }

    const enabled = await isFeatureEnabled('MEDICAL_LIBRARY');
    if (!enabled) {
      return new NextResponse('Medical Library is disabled', { status: 403 });
    }

    const body = await req.json();
    const { title, slug, summary, body: content, specialty, system, tags, status } = body;

    if (!title || !slug || !summary || !content || !specialty) {
      return new NextResponse('Missing required article fields (title, slug, summary, body, specialty)', { status: 400 });
    }

    const cleanSlug = String(slug).toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');

    const article = await prisma.article.create({
      data: {
        title: String(title).trim(),
        slug: cleanSlug,
        summary: String(summary).trim(),
        body: String(content),
        specialty: String(specialty).trim(),
        system: system ? String(system).trim() : null,
        tags: Array.isArray(tags) ? tags.map(t => String(t).trim()) : [],
        status: status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
        authorId: session.user.id,
        revisions: {
          create: {
            editorId: session.user.id,
            body: String(content),
            summary: String(summary).trim(),
            changeDescription: 'Initial article creation',
          }
        }
      },
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return new NextResponse('An article with this slug already exists', { status: 409 });
    }
    console.error('[LIBRARY_POST_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}