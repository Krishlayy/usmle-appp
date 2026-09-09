import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = (session?.user as any)?.role === 'ADMIN' || (session?.user as any)?.role === 'SUPERADMIN';
    if (!isAdmin) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const courses = await prisma.course.findMany({
      include: {
        modules: {
          orderBy: { position: 'asc' },
          include: {
            lessons: {
              orderBy: { position: 'asc' },
              include: { captions: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error('[ADMIN_COURSES_GET_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = (session?.user as any)?.role === 'ADMIN' || (session?.user as any)?.role === 'SUPERADMIN';
    if (!isAdmin) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const body = await req.json();
    const { title, slug, description, specialty, thumbnailUrl, status } = body;

    if (!title || !slug || !specialty) {
      return new NextResponse('Missing title, slug, or specialty', { status: 400 });
    }

    const cleanSlug = String(slug).toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');

    const course = await prisma.course.create({
      data: {
        title: String(title).trim(),
        slug: cleanSlug,
        description: description ? String(description).trim() : '',
        specialty: String(specialty).trim(),
        thumbnailUrl: thumbnailUrl || null,
        status: status === 'DRAFT' ? 'DRAFT' : 'PUBLISHED',
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return new NextResponse('A course with this slug already exists', { status: 409 });
    }
    console.error('[ADMIN_COURSES_POST_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
