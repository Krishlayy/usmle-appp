import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { isFeatureEnabled } from '@/lib/featureFlags';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Calendar, Sparkles } from 'lucide-react';
import { PlannerClient } from './PlannerClient';

export const metadata = {
  title: 'Study Planner & Learning Schedule | Micro Q-Bank',
  description: 'Track daily board targets, organize spaced repetition review, and sync with your calendar.',
};

export default async function PlannerPage() {
  const enabled = await isFeatureEnabled('STUDY_PLANNER');
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    redirect('/login?callbackUrl=/planner');
  }

  if (!enabled) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Calendar className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Study Planner Early Access</h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            The intelligent study planner and exam calendar synchronization module is currently in beta. Scheduled study blocks, daily goals, and iCalendar export will be enabled shortly.
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

  const userId = session.user.id;

  // Fetch active plan
  const plan = await prisma.studyPlan.findFirst({
    where: { userId, isActive: true },
    include: {
      tasks: {
        orderBy: [{ scheduledDate: 'asc' }, { order: 'asc' }],
      },
    },
  });

  // Calculate today's stats
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const dayOfWeek = now.getDay() || 7;
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfToday.getDate() - (dayOfWeek - 1));

  const [todayAttempts, weekAttempts] = await Promise.all([
    prisma.userProgress.count({
      where: {
        userId,
        attemptedAt: { gte: startOfToday, lte: endOfToday },
      },
    }),
    prisma.userProgress.count({
      where: {
        userId,
        attemptedAt: { gte: startOfWeek },
      },
    }),
  ]);

  const daysRemaining = plan?.targetExamDate
    ? Math.max(0, Math.ceil((new Date(plan.targetExamDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white rounded-2xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold tracking-wide uppercase border border-teal-500/30">
              <Sparkles className="w-3.5 h-3.5" /> Adaptive Schedule
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-serif tracking-tight">
              Study Planner & Milestones
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Plan your path to Step 1 & 2 excellence. Track daily target question volumes, schedule high-yield video lessons, and export your personal calendar.
            </p>
          </div>
        </div>

        {/* Client Interactive Planner Component */}
        <PlannerClient
          initialPlan={
            plan
              ? {
                  id: plan.id,
                  title: plan.title,
                  targetExamDate: plan.targetExamDate?.toISOString() || null,
                  dailyGoalQuestions: plan.dailyGoalQuestions,
                  weeklyGoalQuestions: plan.weeklyGoalQuestions,
                  daysRemaining,
                  todayAttempts,
                  weekAttempts,
                  tasks: plan.tasks.map((t) => ({
                    id: t.id,
                    title: t.title,
                    description: t.description,
                    scheduledDate: t.scheduledDate.toISOString(),
                    taskType: t.taskType,
                    isCompleted: t.isCompleted,
                    contentType: t.contentType,
                    contentId: t.contentId,
                  })),
                }
              : null
          }
        />
      </div>
    </div>
  );
}
