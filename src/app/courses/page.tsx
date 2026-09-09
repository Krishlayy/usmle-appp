import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { isFeatureEnabled } from '@/lib/featureFlags';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import {
  Video,
  Play,
  Clock,
  BookOpen,
  CheckCircle2,
  Sparkles,
  Layers,
  ChevronRight,
} from 'lucide-react';

export const metadata = {
  title: 'Video Learning Hub | Micro Q-Bank',
  description: 'Expert-led video lectures, visual pathophysiology, and board exam high-yield walk-throughs.',
};

export default async function CoursesPage() {
  const enabled = await isFeatureEnabled('VIDEO_LEARNING');
  const session = await getServerSession(authOptions);

  if (!enabled) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="w-14 h-14 bg-indigo-100 text-indigo-800 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Video className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Video Learning Early Access</h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Our high-yield visual lecture series is currently in final post-production. Complete video courses with closed captions and integrated board questions will be available soon.
          </p>
          <Link href="/dashboard">
            <Button variant="secondary" className="mt-4">
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const userId = session?.user?.id;

  const courses = await prisma.course.findMany({
    where: { status: 'PUBLISHED' },
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
                    select: { isCompleted: true },
                  }
                : false,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide uppercase border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5" /> Video Lecture Hub
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-serif tracking-tight">
              Master Medicine Visually
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Concise, high-yield video courses breaking down complex medical concepts, dynamic murmurs, and hemodynamic diagrams directly targeted for the USMLE.
            </p>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Video className="w-5 h-5 text-indigo-600" /> Available Courses ({courses.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
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

              const totalMinutes = Math.round(totalDurationSec / 60);
              const percentComplete =
                totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

              const firstLessonId = course.modules[0]?.lessons[0]?.id;

              return (
                <Card
                  key={course.id}
                  className="group flex flex-col justify-between hover:shadow-lg hover:border-indigo-300 transition-all duration-200 bg-white overflow-hidden"
                >
                  <div className="relative aspect-video bg-slate-800 overflow-hidden">
                    {course.thumbnailUrl ? (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-900 to-slate-900">
                        <Video className="w-12 h-12 text-indigo-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                      <span className="px-2 py-0.5 rounded bg-indigo-600/80 backdrop-blur-xs font-semibold">
                        {course.specialty}
                      </span>
                      <span className="flex items-center gap-1 font-medium bg-black/50 px-2 py-0.5 rounded">
                        <Clock className="w-3 h-3" /> {totalMinutes} mins
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-indigo-900 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {course.description}
                      </p>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{course.modules.length} modules • {totalLessons} lessons</span>
                        {userId && (
                          <span className="font-semibold text-slate-700">
                            {percentComplete}% completed
                          </span>
                        )}
                      </div>

                      {userId && totalLessons > 0 && (
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full rounded-full transition-all"
                            style={{ width: `${percentComplete}%` }}
                          />
                        </div>
                      )}

                      <Link
                        href={firstLessonId ? `/courses/${course.slug}/${firstLessonId}` : `/courses/${course.slug}`}
                        className="block pt-1"
                      >
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full flex items-center justify-center gap-2 text-xs bg-indigo-700 hover:bg-indigo-800"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          {percentComplete > 0 ? 'Continue Course' : 'Start Watching'}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
