import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { isFeatureEnabled } from '@/lib/featureFlags';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const enabled = await isFeatureEnabled('VIDEO_LEARNING');
    if (!enabled) {
      return NextResponse.json({
        enabled: false,
        courses: [],
        specialties: [],
      });
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const { searchParams } = new URL(req.url);
    const specialty = searchParams.get('specialty');

    const where: any = { status: 'PUBLISHED' };
    if (specialty) {
      where.specialty = { equals: specialty, mode: 'insensitive' };
    }

    const courses = await prisma.course.findMany({
      where,
      include: {
        modules: {
          orderBy: { position: 'asc' },
          include: {
            lessons: {
              orderBy: { position: 'asc' },
              select: {
                id: true,
                title: true,
                durationSec: true,
                progress: userId
                  ? {
                      where: { userId },
                      select: {
                        isCompleted: true,
                        percentComplete: true,
                        positionSec: true,
                      },
                    }
                  : false,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedCourses = courses.map((course) => {
      let totalLessons = 0;
      let totalDurationSec = 0;
      let completedLessons = 0;

      course.modules.forEach((mod) => {
        mod.lessons.forEach((lesson) => {
          totalLessons += 1;
          totalDurationSec += lesson.durationSec;
          if (lesson.progress && (lesson.progress as any[]).length > 0) {
            if ((lesson.progress as any[])[0].isCompleted) {
              completedLessons += 1;
            }
          }
        });
      });

      const percentComplete = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      return {
        id: course.id,
        title: course.title,
        slug: course.slug,
        description: course.description,
        specialty: course.specialty,
        thumbnailUrl: course.thumbnailUrl,
        totalLessons,
        totalDurationSec,
        completedLessons,
        percentComplete,
        modulesCount: course.modules.length,
      };
    });

    const allCourses = await prisma.course.findMany({
      where: { status: 'PUBLISHED' },
      select: { specialty: true },
    });
    const specialties = Array.from(new Set(allCourses.map((c) => c.specialty).filter(Boolean)));

    return NextResponse.json({
      enabled: true,
      courses: formattedCourses,
      specialties,
    });
  } catch (error) {
    console.error('[COURSES_GET_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
