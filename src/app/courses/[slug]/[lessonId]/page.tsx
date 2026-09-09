import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { isFeatureEnabled } from '@/lib/featureFlags';
import { VideoPlayerClient } from './VideoPlayerClient';

export default async function LessonPage(props: {
  params: Promise<{ slug: string; lessonId: string }>;
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
            include: {
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
  });

  if (!course) {
    notFound();
  }

  // Find target lesson
  let targetLesson: any = null;
  for (const mod of course.modules) {
    const found = mod.lessons.find((l) => l.id === params.lessonId);
    if (found) {
      targetLesson = found;
      break;
    }
  }

  if (!targetLesson) {
    notFound();
  }

  // Fetch captions for the target lesson
  const captions = await prisma.lessonCaption.findMany({
    where: { lessonId: targetLesson.id },
    select: {
      id: true,
      language: true,
      label: true,
      fileUrl: true,
    },
  });

  // Fetch user progress for this lesson
  let userProgress = { positionSec: 0, percentComplete: 0, isCompleted: false };
  if (userId) {
    const p = await prisma.courseVideoProgress.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId: targetLesson.id,
        },
      },
    });
    if (p) {
      userProgress = {
        positionSec: p.positionSec,
        percentComplete: p.percentComplete,
        isCompleted: p.isCompleted,
      };
    }
  }

  // Find recommended questions for this lesson's topic or specialty
  const recommendedQuestions = await prisma.question.findMany({
    where: {
      status: 'PUBLISHED',
      OR: [
        ...(targetLesson.relatedTopic
          ? [{ subtopic: { contains: targetLesson.relatedTopic, mode: 'insensitive' as const } }]
          : []),
        { qbank: { specialtyTag: { contains: course.specialty, mode: 'insensitive' as const } } },
      ],
    },
    select: {
      id: true,
      qid: true,
      questionText: true,
      difficulty: true,
      subtopic: true,
      qbank: { select: { slug: true, title: true } },
    },
    take: 3,
  });

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <VideoPlayerClient
        course={{
          id: course.id,
          title: course.title,
          slug: course.slug,
          specialty: course.specialty,
          modules: course.modules.map((m) => ({
            id: m.id,
            title: m.title,
            lessons: m.lessons.map((l) => ({
              id: l.id,
              title: l.title,
              durationSec: l.durationSec,
              isCompleted:
                l.progress && (l.progress as any[]).length > 0
                  ? (l.progress as any[])[0].isCompleted
                  : false,
            })),
          })),
        }}
        currentLesson={{
          id: targetLesson.id,
          title: targetLesson.title,
          description: targetLesson.description,
          videoUrl: targetLesson.videoUrl,
          durationSec: targetLesson.durationSec,
          relatedTopic: targetLesson.relatedTopic,
          captions: captions.map((c) => ({
            language: c.language,
            label: c.label,
            url: `/api/videos/captions/${targetLesson.id}/${c.language}`,
          })),
        }}
        userProgress={userProgress}
        recommendedQuestions={recommendedQuestions.map((q) => ({
          id: q.id,
          qid: q.qid,
          stem: q.questionText,
          difficulty: q.difficulty,
          subtopic: q.subtopic,
          qbankSlug: q.qbank.slug,
          qbankTitle: q.qbank.title,
        }))}
        isLoggedIn={Boolean(userId)}
      />
    </div>
  );
}
