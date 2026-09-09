'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Circle,
  Clock,
  Download,
  PlusCircle,
  HelpCircle,
  BookOpen,
  Video,
  Layers,
  Sparkles,
  ExternalLink,
  Trash2,
  Edit3,
  Flame,
  Target,
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string | null;
  scheduledDate: string;
  taskType: 'QUESTION_BLOCK' | 'FLASHCARD_REVIEW' | 'VIDEO_LESSON' | 'READING' | 'CUSTOM';
  isCompleted: boolean;
  contentType: string | null;
  contentId: string | null;
}

interface PlanData {
  id: string;
  title: string;
  targetExamDate: string | null;
  dailyGoalQuestions: number;
  weeklyGoalQuestions: number;
  daysRemaining: number | null;
  todayAttempts: number;
  weekAttempts: number;
  tasks: Task[];
}

interface Props {
  initialPlan: PlanData | null;
}

export function PlannerClient({ initialPlan }: Props) {
  const [plan, setPlan] = useState<PlanData | null>(initialPlan);
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states for Plan Modal
  const [planTitle, setPlanTitle] = useState(plan?.title || 'USMLE Step 1 Comprehensive Prep');
  const [examDate, setExamDate] = useState(
    plan?.targetExamDate ? plan.targetExamDate.split('T')[0] : ''
  );
  const [dailyGoal, setDailyGoal] = useState(plan?.dailyGoalQuestions || 40);
  const [weeklyGoal, setWeeklyGoal] = useState(plan?.weeklyGoalQuestions || 200);

  // Form states for Custom Task Modal
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskType, setNewTaskType] = useState<Task['taskType']>('QUESTION_BLOCK');
  const [newTaskDate, setNewTaskDate] = useState(selectedDateStr);

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: planTitle,
          targetExamDate: examDate || null,
          dailyGoalQuestions: Number(dailyGoal),
          weeklyGoalQuestions: Number(weeklyGoal),
        }),
      });

      if (res.ok) {
        // Refresh page to load generated template schedule
        window.location.reload();
      }
    } catch (err) {
      console.error('Failed to save study plan', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskCompletion = async (taskId: string, currentStatus: boolean) => {
    if (!plan) return;

    // Optimistic UI update
    setPlan({
      ...plan,
      tasks: plan.tasks.map((t) =>
        t.id === taskId ? { ...t, isCompleted: !currentStatus } : t
      ),
    });

    try {
      await fetch('/api/planner/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          isCompleted: !currentStatus,
        }),
      });
    } catch (err) {
      console.error('Failed to update task completion', err);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/planner/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan?.id,
          title: newTaskTitle.trim(),
          description: newTaskDesc.trim() || null,
          scheduledDate: `${newTaskDate}T09:00:00Z`,
          taskType: newTaskType,
        }),
      });

      if (res.ok) {
        const createdTask: Task = await res.json();
        if (plan) {
          setPlan({
            ...plan,
            tasks: [...plan.tasks, createdTask],
          });
        }
        setShowTaskModal(false);
        setNewTaskTitle('');
        setNewTaskDesc('');
      }
    } catch (err) {
      console.error('Failed to add custom task', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!plan) return;

    setPlan({
      ...plan,
      tasks: plan.tasks.filter((t) => t.id !== taskId),
    });

    try {
      await fetch(`/api/planner/tasks?taskId=${taskId}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Failed to delete task', err);
    }
  };

  // If no plan configured yet, render Setup Callout
  if (!plan) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 text-center max-w-xl mx-auto space-y-6 shadow-sm">
        <div className="w-16 h-16 bg-teal-50 text-teal-700 rounded-2xl flex items-center justify-center mx-auto">
          <CalendarIcon className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 font-serif">
            Create Your Custom USMLE Study Schedule
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Set your target exam date and daily question targets. We will automatically map out your practice blocks, spaced repetition flashcard reviews, and video lectures.
          </p>
        </div>

        <form onSubmit={handleSavePlan} className="space-y-4 text-left max-w-sm mx-auto pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Exam Date
            </label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Daily Question Goal
            </label>
            <input
              type="number"
              min={10}
              max={160}
              value={dailyGoal}
              onChange={(e) => setDailyGoal(Number(e.target.value))}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full text-xs bg-teal-700 hover:bg-teal-800 mt-2"
          >
            {loading ? 'Generating Schedule...' : 'Generate My Study Schedule'}
          </Button>
        </form>
      </div>
    );
  }

  // Generate 7 day navigation dates
  const today = new Date();
  const dayOptions: { dateStr: string; label: string; dayName: string; isToday: boolean }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const isCurrent = i === 0;
    dayOptions.push({
      dateStr,
      label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      dayName: isCurrent ? 'Today' : d.toLocaleDateString(undefined, { weekday: 'short' }),
      isToday: isCurrent,
    });
  }

  // Filter tasks for selected day
  const currentDayTasks = plan.tasks.filter((t) => {
    const tDate = t.scheduledDate.split('T')[0];
    return tDate === selectedDateStr;
  });

  const dailyPct = Math.min(100, Math.round((plan.todayAttempts / plan.dailyGoalQuestions) * 100));
  const weeklyPct = Math.min(100, Math.round((plan.weekAttempts / plan.weeklyGoalQuestions) * 100));

  return (
    <div className="space-y-8">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Exam Countdown */}
        <Card className="p-5 bg-white border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider">Exam Countdown</span>
            <Target className="w-4 h-4 text-teal-600" />
          </div>
          <div className="py-3">
            <div className="text-3xl font-bold text-slate-900 font-serif">
              {plan.daysRemaining !== null ? `${plan.daysRemaining} days` : 'Not set'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Target: {plan.targetExamDate ? new Date(plan.targetExamDate).toLocaleDateString() : 'Set your exam date'}
            </div>
          </div>
          <button
            onClick={() => setShowPlanModal(true)}
            className="text-xs text-teal-700 font-semibold hover:underline inline-flex items-center gap-1"
          >
            Adjust Target <Edit3 className="w-3 h-3" />
          </button>
        </Card>

        {/* Daily Goal Gauge */}
        <Card className="p-5 bg-white border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider">Today&apos;s Target</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="py-3 space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold text-slate-900">
                {plan.todayAttempts}
              </span>
              <span className="text-xs text-slate-500">
                of {plan.dailyGoalQuestions} questions
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all"
                style={{ width: `${dailyPct}%` }}
              />
            </div>
          </div>
          <span className="text-[11px] text-slate-500">
            {dailyPct >= 100 ? '🎉 Daily target completed!' : `${plan.dailyGoalQuestions - plan.todayAttempts} questions remaining today`}
          </span>
        </Card>

        {/* Weekly Goal Gauge */}
        <Card className="p-5 bg-white border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider">Weekly Pace</span>
            <Sparkles className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="py-3 space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold text-slate-900">
                {plan.weekAttempts}
              </span>
              <span className="text-xs text-slate-500">
                of {plan.weeklyGoalQuestions} weekly
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all"
                style={{ width: `${weeklyPct}%` }}
              />
            </div>
          </div>
          <span className="text-[11px] text-slate-500">
            {weeklyPct >= 100 ? 'Goal reached!' : `${weeklyPct}% of weekly quota`}
          </span>
        </Card>

        {/* Action Panel */}
        <Card className="p-5 bg-gradient-to-br from-slate-900 to-teal-950 text-white shadow-md flex flex-col justify-between">
          <div className="text-xs font-semibold uppercase tracking-wider text-teal-300">
            Calendar Integration
          </div>
          <div className="space-y-1 py-1">
            <div className="text-sm font-bold text-white">
              Sync with Your Calendar
            </div>
            <p className="text-[11px] text-slate-300">
              Export study blocks to Apple Calendar, Google Calendar, or Outlook (.ics).
            </p>
          </div>
          <a
            href="/api/planner/export.ics"
            download="usmle-study-schedule.ics"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export Calendar (.ics)
          </a>
        </Card>
      </div>

      {/* Calendar Day Selector Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {dayOptions.map((day) => {
            const isSelected = selectedDateStr === day.dateStr;
            const dayTasks = plan.tasks.filter((t) => t.scheduledDate.split('T')[0] === day.dateStr);
            const allDone = dayTasks.length > 0 && dayTasks.every((t) => t.isCompleted);

            return (
              <button
                key={day.dateStr}
                onClick={() => setSelectedDateStr(day.dateStr)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex flex-col items-center gap-0.5 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span className="text-[10px] uppercase font-bold opacity-80">
                  {day.dayName}
                </span>
                <span className="text-sm">{day.label}</span>
                {dayTasks.length > 0 && (
                  <span
                    className={`text-[10px] mt-0.5 ${
                      isSelected
                        ? allDone
                          ? 'text-emerald-400'
                          : 'text-teal-300'
                        : allDone
                        ? 'text-emerald-600 font-bold'
                        : 'text-slate-500'
                    }`}
                  >
                    {dayTasks.filter((t) => t.isCompleted).length}/{dayTasks.length} done
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setNewTaskDate(selectedDateStr);
              setShowTaskModal(true);
            }}
            className="flex items-center gap-1.5 text-xs"
          >
            <PlusCircle className="w-3.5 h-3.5 text-teal-700" /> Add Custom Task
          </Button>
        </div>
      </div>

      {/* Daily Tasks List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-600" /> Tasks Scheduled for {selectedDateStr}
          </h2>
          <span className="text-xs text-slate-500">
            {currentDayTasks.filter((t) => t.isCompleted).length} of {currentDayTasks.length} tasks completed
          </span>
        </div>

        {currentDayTasks.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center max-w-md mx-auto space-y-3">
            <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-800">No study tasks for this day</h3>
            <p className="text-xs text-slate-500">
              Take a well-deserved rest day or add a custom study block.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setNewTaskDate(selectedDateStr);
                setShowTaskModal(true);
              }}
              className="text-xs"
            >
              Add Task for this Day
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {currentDayTasks.map((task) => {
              // Task type details
              const typeConfig = {
                QUESTION_BLOCK: {
                  badge: 'QBank Block',
                  badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
                  actionText: 'Start Block',
                  actionUrl: '/dashboard/cardiology',
                  icon: HelpCircle,
                },
                FLASHCARD_REVIEW: {
                  badge: 'Spaced Repetition',
                  badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                  actionText: 'Review Cards',
                  actionUrl: '/dashboard/cardiology/flashcards/review',
                  icon: Layers,
                },
                VIDEO_LESSON: {
                  badge: 'Video Lecture',
                  badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
                  actionText: 'Watch Video',
                  actionUrl: '/courses',
                  icon: Video,
                },
                READING: {
                  badge: 'Medical Library',
                  badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
                  actionText: 'Read Topic',
                  actionUrl: '/library',
                  icon: BookOpen,
                },
                CUSTOM: {
                  badge: 'Custom Task',
                  badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
                  actionText: 'Open',
                  actionUrl: '/dashboard/cardiology',
                  icon: Sparkles,
                },
              }[task.taskType];

              const Icon = typeConfig.icon;

              return (
                <Card
                  key={task.id}
                  className={`p-4 bg-white border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    task.isCompleted
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : 'border-slate-200 hover:border-teal-300'
                  }`}
                >
                  <div className="flex items-start gap-3.5 flex-1">
                    <button
                      onClick={() => toggleTaskCompletion(task.id, task.isCompleted)}
                      className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors"
                    >
                      {task.isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300" />
                      )}
                    </button>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${typeConfig.badgeColor}`}
                        >
                          {typeConfig.badge}
                        </span>
                        <h3
                          className={`text-sm font-bold ${
                            task.isCompleted
                              ? 'text-slate-500 line-through'
                              : 'text-slate-900'
                          }`}
                        >
                          {task.title}
                        </h3>
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    <Link
                      href={typeConfig.actionUrl}
                      className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 transition-colors"
                    >
                      {typeConfig.actionText} <ExternalLink className="w-3 h-3" />
                    </Link>

                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      title="Delete task"
                      className="p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-slate-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Plan Settings Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-teal-600" /> Edit Study Plan Targets
              </h3>
              <button
                onClick={() => setShowPlanModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Plan Title
                </label>
                <input
                  type="text"
                  value={planTitle}
                  onChange={(e) => setPlanTitle(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Exam Date
                </label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Daily Question Target
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={200}
                    value={dailyGoal}
                    onChange={(e) => setDailyGoal(Number(e.target.value))}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Weekly Question Target
                  </label>
                  <input
                    type="number"
                    min={50}
                    max={1000}
                    value={weeklyGoal}
                    onChange={(e) => setWeeklyGoal(Number(e.target.value))}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowPlanModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={loading}
                  className="bg-teal-700 hover:bg-teal-800"
                >
                  {loading ? 'Saving...' : 'Save Goals'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Custom Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-teal-600" /> Add Custom Study Task
              </h3>
              <button
                onClick={() => setShowTaskModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Review First Aid Pharmacology Section"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description / Specific Topics
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g., Autonomic receptors, adrenergic antagonists"
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Scheduled Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newTaskDate}
                    onChange={(e) => setNewTaskDate(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Task Type
                  </label>
                  <select
                    value={newTaskType}
                    onChange={(e) => setNewTaskType(e.target.value as any)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  >
                    <option value="QUESTION_BLOCK">QBank Block</option>
                    <option value="FLASHCARD_REVIEW">Spaced Repetition</option>
                    <option value="VIDEO_LESSON">Video Lecture</option>
                    <option value="READING">Medical Library</option>
                    <option value="CUSTOM">Custom Task</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowTaskModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={loading}
                  className="bg-teal-700 hover:bg-teal-800"
                >
                  {loading ? 'Adding...' : 'Schedule Task'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
