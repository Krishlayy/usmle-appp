'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  CheckCircle2,
  Circle,
  Play,
  Clock,
  HelpCircle,
  ExternalLink,
  RotateCcw,
  Sparkles,
  BookOpen,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CaptionTrack {
  language: string;
  label: string;
  url: string;
}

interface LessonData {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string;
  durationSec: number;
  relatedTopic: string | null;
  captions: CaptionTrack[];
}

interface SyllabusLesson {
  id: string;
  title: string;
  durationSec: number;
  isCompleted: boolean;
}

interface SyllabusModule {
  id: string;
  title: string;
  lessons: SyllabusLesson[];
}

interface CourseData {
  id: string;
  title: string;
  slug: string;
  specialty: string;
  modules: SyllabusModule[];
}

interface RecommendedQuestion {
  id: string;
  qid: string;
  stem: string;
  difficulty: string;
  subtopic: string | null;
  qbankSlug: string;
  qbankTitle: string;
}

interface Props {
  course: CourseData;
  currentLesson: LessonData;
  userProgress: {
    positionSec: number;
    percentComplete: number;
    isCompleted: boolean;
  };
  recommendedQuestions: RecommendedQuestion[];
  isLoggedIn: boolean;
}

export function VideoPlayerClient({
  course,
  currentLesson,
  userProgress,
  recommendedQuestions,
  isLoggedIn,
}: Props) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isCompleted, setIsCompleted] = useState<boolean>(userProgress.isCompleted);
  const [hasResumed, setHasResumed] = useState<boolean>(false);
  const [savedTimeNotice, setSavedTimeNotice] = useState<boolean>(false);

  // Resume saved position once video metadata loads
  const handleLoadedMetadata = () => {
    if (videoRef.current && userProgress.positionSec > 0 && !hasResumed) {
      // Don't resume if user was already at the end (> 95%)
      if (userProgress.percentComplete < 95) {
        videoRef.current.currentTime = userProgress.positionSec;
        setSavedTimeNotice(true);
        setTimeout(() => setSavedTimeNotice(false), 4000);
      }
      setHasResumed(true);
    }
  };

  // Synchronize playback speed
  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  // Sync progress to backend
  const saveProgress = async (completedOverride?: boolean) => {
    if (!isLoggedIn || !videoRef.current) return;

    const currentTime = videoRef.current.currentTime;
    const duration = videoRef.current.duration || currentLesson.durationSec || 1;
    const pct = Math.min(100, Math.round((currentTime / duration) * 100));
    const completed = completedOverride || pct >= 90 || isCompleted;

    if (completed && !isCompleted) {
      setIsCompleted(true);
    }

    try {
      await fetch('/api/videos/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: currentLesson.id,
          positionSec: Math.round(currentTime),
          percentComplete: pct,
          isCompleted: completed,
        }),
      });
    } catch (err) {
      console.error('Failed to auto-save video progress', err);
    }
  };

  // Periodic interval save (every 8 seconds while playing)
  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && !videoRef.current.paused) {
        saveProgress();
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [currentLesson.id, isCompleted]);

  // Find next lesson in the course
  let nextLesson: { id: string; title: string } | null = null;
  const allLessons = course.modules.flatMap((m) => m.lessons);
  const currentIndex = allLessons.findIndex((l) => l.id === currentLesson.id);
  if (currentIndex >= 0 && currentIndex < allLessons.length - 1) {
    nextLesson = allLessons[currentIndex + 1];
  }

  const handleEnded = () => {
    saveProgress(true);
    setIsCompleted(true);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navigation Bar */}
      <header className="h-14 bg-slate-950 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> All Courses
          </Link>
          <span className="text-slate-600">|</span>
          <span className="text-xs font-semibold text-slate-200 line-clamp-1">
            {course.title}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-900/60 text-indigo-300 border border-indigo-700/50">
            {course.specialty}
          </span>
        </div>
      </header>

      {/* Main Studio Layout: Video Column (Left) + Syllabus Column (Right) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12">
        {/* Left Column: Video Player & Details */}
        <div className="lg:col-span-8 xl:col-span-9 p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Video Container */}
          <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
            <video
              ref={videoRef}
              src={currentLesson.videoUrl}
              controls
              playsInline
              onLoadedMetadata={handleLoadedMetadata}
              onPause={() => saveProgress()}
              onEnded={handleEnded}
              className="w-full h-full object-contain"
            >
              {currentLesson.captions.map((cap, i) => (
                <track
                  key={cap.language}
                  kind="subtitles"
                  src={cap.url}
                  srcLang={cap.language}
                  label={cap.label}
                  default={i === 0}
                />
              ))}
              Your browser does not support HTML5 video playback.
            </video>

            {/* Resume Notice Toast */}
            {savedTimeNotice && (
              <div className="absolute top-4 left-4 bg-slate-900/90 text-white text-xs px-3 py-1.5 rounded-lg border border-slate-700 shadow-lg backdrop-blur-xs flex items-center gap-2 animate-fade-in">
                <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                Resumed from {Math.floor(userProgress.positionSec / 60)}:
                {String(userProgress.positionSec % 60).padStart(2, '0')}
              </div>
            )}
          </div>

          {/* Player Toolbar & Metadata */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-white">
                    {currentLesson.title}
                  </h1>
                  {isCompleted && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/50">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                    </span>
                  )}
                </div>
                {currentLesson.relatedTopic && (
                  <p className="text-xs text-indigo-400 font-medium">
                    Topic: {currentLesson.relatedTopic}
                  </p>
                )}
              </div>

              {/* Playback Speed Controls */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                {[1, 1.25, 1.5, 1.75, 2].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => changePlaybackRate(rate)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      playbackRate === rate
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>

            {currentLesson.description && (
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-2 border-t border-slate-800/60">
                {currentLesson.description}
              </p>
            )}

            {/* Next Lesson Jump Bar */}
            {nextLesson && (
              <div className="pt-2 flex justify-end">
                <Link
                  href={`/courses/${course.slug}/${nextLesson.id}`}
                  className="inline-flex items-center gap-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition-colors shadow-sm"
                >
                  Next Lesson: {nextLesson.title} →
                </Link>
              </div>
            )}
          </div>

          {/* Recommended Practice Questions (Cross-Feature Integration) */}
          {recommendedQuestions.length > 0 && (
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Sparkles className="w-4 h-4 text-cyan-400" /> Recommended USMLE Practice Questions
                </div>
                <span className="text-xs text-slate-400">
                  Reinforce lecture retention
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {recommendedQuestions.map((q) => (
                  <div
                    key={q.id}
                    className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white">{q.qid}</span>
                        <span
                          className={`text-[10px] uppercase font-semibold px-2 py-0.2 rounded ${
                            q.difficulty === 'hard'
                              ? 'bg-red-950 text-red-300'
                              : q.difficulty === 'medium'
                              ? 'bg-amber-950 text-amber-300'
                              : 'bg-emerald-950 text-emerald-300'
                          }`}
                        >
                          {q.difficulty}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                        {q.stem}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-slate-500">
                        {q.qbankTitle}
                      </span>
                      <Link
                        href={`/dashboard/${q.qbankSlug}`}
                        className="text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1 text-xs"
                      >
                        Practice <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Course Syllabus & Navigation */}
        <div className="lg:col-span-4 xl:col-span-3 bg-slate-950/80 border-t lg:border-t-0 lg:border-l border-slate-800 p-4 sm:p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" /> Course Syllabus
            </h2>
            <p className="text-xs text-slate-400">
              {course.modules.length} modules • {allLessons.length} lessons
            </p>
          </div>

          <div className="space-y-6">
            {course.modules.map((mod, modIdx) => (
              <div key={mod.id} className="space-y-2">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Module {modIdx + 1}: {mod.title}
                </div>

                <div className="space-y-1">
                  {mod.lessons.map((lesson) => {
                    const isActive = lesson.id === currentLesson.id;
                    return (
                      <Link
                        key={lesson.id}
                        href={`/courses/${course.slug}/${lesson.id}`}
                        className={`flex items-start gap-3 p-3 rounded-xl transition-all text-xs ${
                          isActive
                            ? 'bg-indigo-600/30 border border-indigo-500 text-white font-semibold'
                            : 'bg-slate-900/60 hover:bg-slate-900 text-slate-300 border border-transparent'
                        }`}
                      >
                        <div className="mt-0.5">
                          {lesson.isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : isActive ? (
                            <Play className="w-4 h-4 text-indigo-400 fill-indigo-400" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-600" />
                          )}
                        </div>

                        <div className="flex-1 space-y-1">
                          <div className="line-clamp-2">{lesson.title}</div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500">
                            <Clock className="w-3 h-3" />
                            {Math.floor(lesson.durationSec / 60)}:
                            {String(lesson.durationSec % 60).padStart(2, '0')}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
