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
    const enabled = await isFeatureEnabled('VIDEO_LEARNING');
    if (!enabled) {
      return new NextResponse('Video Learning Hub is disabled', { status: 403 });
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const course = await prisma.course.findUnique({
      where: { slug: params.slug },
      include: {
        modules: {
          orderBy: { position: 'asc' },
          include: {
            lessons: {
              orderBy: { position: 'asc' },
              include: {
                captions: {
                  select: {
                    id: true,
                    language: true,
                    label: true,
                    fileUrl: true,
                  },
                },
                progress: userId
                  ? {
                      where: { userId },
                      select: {
                        positionSec: true,
                        percentComplete: true,
                        isCompleted: true,
                      },
                    }
                  : false,
              },
            },
          },
        },
      },
    });

    if (!course) {
      return new NextResponse('Course not found', { status: 404 });
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error('[COURSE_DETAIL_GET_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
