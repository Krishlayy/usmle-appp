import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { isFeatureEnabled } from '@/lib/featureFlags';

export default async function CourseSlugPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const enabled = await isFeatureEnabled('VIDEO_LEARNING');
  if (!enabled) {
    redirect('/courses');
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
            select: { id: true },
          },
        },
      },
    },
  });

  if (!course) {
    notFound();
  }

  // Find first lesson
  const firstLessonId = course.modules[0]?.lessons[0]?.id;
  if (!firstLessonId) {
    notFound();
  }

  redirect(`/courses/${course.slug}/${firstLessonId}`);
}
