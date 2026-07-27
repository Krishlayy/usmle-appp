"use client";

import { useState, useEffect, Suspense, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import Link from "next/link";
import {
  Clock,
  GraduationCap,
  ChevronLeft,
  Target,
  Settings2,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  Flag,
  Lock,
  Filter,
  Minus,
  Plus,
  Trophy,
} from "lucide-react";

type ProgressData = {
  title: string;
  totalQuestions: number;
  completedQuestions: number;
  unusedCount: number;
  incorrectCount: number;
  flaggedCount: number;
  hasCompletedFirstTutorSession: boolean;
  subtopics: string[];
};

const QUESTION_PRESETS = [10, 20, 40];

function SetupTestForm({ qbankSlug, data }: { qbankSlug: string; data: ProgressData }) {
  const router = useRouter();
  const [mode, setMode] = useState("tutor");
  const [filter, setFilter] = useState("all");
  const [selectedSubtopics, setSelectedSubtopics] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState<number>(
    Math.min(40, data.totalQuestions)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const unlocked = data.hasCompletedFirstTutorSession;

  // Max available based on filter
  const filterMax =
    filter === "unused"
      ? data.unusedCount
      : filter === "incorrect"
      ? data.incorrectCount
      : filter === "flagged"
      ? data.flaggedCount
      : data.totalQuestions;

  const effectiveMax = filterMax > 0 ? filterMax : 1;

  useEffect(() => {
    setQuestionCount(Math.min(questionCount, effectiveMax));
  }, [filter, effectiveMax]);

  const toggleSubtopic = (s: string) => {
    setSelectedSubtopics((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleStart = async () => {
    if (filterMax === 0) {
      setError("No questions match this filter. Try a different one.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const body: Record<string, unknown> = { qbankSlug, mode };
      if (unlocked) {
        body.filter = filter;
        body.questionCount = questionCount;
        if (selectedSubtopics.length > 0) body.subtopics = selectedSubtopics;
      }
      const res = await fetch("/api/test-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to create session");
      router.push(`/dashboard/${qbankSlug}/test/${resData.sessionId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to start session");
      setLoading(false);
    }
  };

  const progressPct = Math.min(
    100,
    Math.round((data.completedQuestions / (data.totalQuestions || 1)) * 100)
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-[#111827] mb-2">Configure Practice Block</h1>
        <p className="text-[#6B7280]">
          Setting up a session for{" "}
          <span className="font-semibold text-[#111827]">{data.title}</span>
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Progress Card */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-[#F0FDF9] flex items-center justify-center border border-[#D1FAE5]">
            <Target className="w-4 h-4 text-[#0D9488]" />
          </div>
          <div>
            <h2 className="font-bold text-[#111827]">Overall Progress</h2>
            <p className="text-sm text-[#6B7280]">
              {data.completedQuestions} of {data.totalQuestions} questions answered
            </p>
          </div>
          <span className="ml-auto text-lg font-bold text-[#0D9488]">{progressPct}%</span>
        </div>
        <div className="w-full bg-[#E5E7EB] rounded-full h-2">
          <div
            className="bg-[#0D9488] h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Mode Selection */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-full bg-[#F0FDF9] flex items-center justify-center border border-[#D1FAE5]">
            <Settings2 className="w-4 h-4 text-[#0D9488]" />
          </div>
          <h2 className="font-bold text-[#111827]">Testing Mode</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              id: "tutor",
              icon: GraduationCap,
              label: "Tutor Mode",
              desc: "Explanations shown immediately after each answer. Best for learning.",
            },
            {
              id: "timed",
              icon: Clock,
              label: "Timed Mode",
              desc: "Simulates real exam conditions. Explanations shown at the end.",
              locked: !unlocked,
            },
          ].map(({ id, icon: Icon, label, desc, locked }) => (
            <button
              key={id}
              onClick={() => !locked && setMode(id)}
              disabled={locked}
              className={`relative text-left p-5 rounded-xl border-2 transition-all duration-200 ${
                locked
                  ? "border-[#E5E7EB] bg-gray-50 opacity-60 cursor-not-allowed"
                  : mode === id
                  ? "border-[#0D9488] bg-[#0D9488]/5"
                  : "border-[#E5E7EB] hover:border-[#0D9488]/40 bg-white"
              }`}
            >
              {locked && (
                <div className="absolute top-3 right-3">
                  <Lock className="w-4 h-4 text-gray-400" />
                </div>
              )}
              <div className="flex items-center gap-3 mb-2">
                <Icon className={`w-5 h-5 ${mode === id && !locked ? "text-[#0D9488]" : "text-[#6B7280]"}`} />
                <span className={`font-bold ${mode === id && !locked ? "text-[#0D9488]" : "text-[#111827]"}`}>
                  {label}
                </span>
              </div>
              <p className="text-sm text-[#6B7280]">{desc}</p>
              {locked && (
                <p className="text-xs text-amber-600 mt-2 font-medium">
                  Complete your first Tutor session to unlock
                </p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Filters -- locked until first tutor session */}
      <div className={`bg-white rounded-xl border shadow-sm p-6 transition-all ${unlocked ? "border-[#E5E7EB]" : "border-[#E5E7EB] opacity-70"}`}>
        <div className="flex items-center gap-3 mb-1">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center border ${unlocked ? "bg-[#F0FDF9] border-[#D1FAE5]" : "bg-gray-100 border-gray-200"}`}>
            <Filter className={`w-4 h-4 ${unlocked ? "text-[#0D9488]" : "text-gray-400"}`} />
          </div>
          <div>
            <h2 className={`font-bold ${unlocked ? "text-[#111827]" : "text-gray-400"}`}>
              Advanced Filters
              {!unlocked && <Lock className="inline ml-2 w-3.5 h-3.5 text-amber-500" />}
            </h2>
            <p className="text-xs text-[#6B7280]">
              {unlocked
                ? "Filter questions by status and topic"
                : "Complete your first Tutor Mode session to unlock filters"}
            </p>
          </div>
          {!unlocked && (
            <span className="ml-auto text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
              Locked
            </span>
          )}
        </div>

        {!unlocked && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <Trophy className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800 text-sm">Complete one Tutor session first</p>
              <p className="text-xs text-amber-700 mt-1">
                Filters like Unused Only, Incorrect, Flagged, and Topic selection unlock after your first completed Tutor Mode session.
              </p>
            </div>
          </div>
        )}

        {unlocked && (
          <div className="mt-5 space-y-5">
            {/* Question Status Filter */}
            <div>
              <p className="text-sm font-semibold text-[#374151] mb-3">Question Status</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: "all", icon: BookOpen, label: "All", count: data.totalQuestions, color: "text-blue-600 bg-blue-50 border-blue-200" },
                  { id: "unused", icon: BookOpen, label: "Unused", count: data.unusedCount, color: "text-gray-600 bg-gray-50 border-gray-200" },
                  { id: "incorrect", icon: AlertCircle, label: "Incorrect", count: data.incorrectCount, color: "text-red-600 bg-red-50 border-red-200" },
                  { id: "flagged", icon: Flag, label: "Flagged", count: data.flaggedCount, color: "text-amber-600 bg-amber-50 border-amber-200" },
                ].map(({ id, icon: Icon, label, count, color }) => (
                  <button
                    key={id}
                    onClick={() => setFilter(id)}
                    disabled={count === 0 && id !== "all"}
                    className={`text-left p-3 rounded-xl border-2 transition-all duration-150 ${
                      count === 0 && id !== "all"
                        ? "opacity-40 cursor-not-allowed border-[#E5E7EB] bg-white"
                        : filter === id
                        ? "border-[#0D9488] bg-[#0D9488]/5"
                        : "border-[#E5E7EB] hover:border-[#0D9488]/30 bg-white"
                    }`}
                  >
                    <div className={`inline-flex items-center gap-1.5 text-xs font-bold rounded-full px-2 py-0.5 mb-2 ${color}`}>
                      <Icon className="w-3 h-3" />
                      {label}
                    </div>
                    <p className={`text-xl font-extrabold ${filter === id ? "text-[#0D9488]" : "text-[#111827]"}`}>
                      {count}
                    </p>
                    <p className="text-xs text-[#6B7280]">questions</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Question Count */}
            <div>
              <p className="text-sm font-semibold text-[#374151] mb-3">
                Number of Questions <span className="text-[#6B7280] font-normal">(max {effectiveMax})</span>
              </p>
              <div className="flex items-center gap-3 mb-3">
                <button
                  onClick={() => setQuestionCount(Math.max(1, questionCount - 5))}
                  className="w-9 h-9 rounded-xl border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:border-[#0D9488] hover:text-[#0D9488] transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="flex-1 bg-[#F8FAF9] rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-center">
                  <span className="text-xl font-bold text-[#0D9488]">{questionCount}</span>
                  <span className="text-sm text-[#6B7280] ml-1">questions</span>
                </div>
                <button
                  onClick={() => setQuestionCount(Math.min(effectiveMax, questionCount + 5))}
                  className="w-9 h-9 rounded-xl border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:border-[#0D9488] hover:text-[#0D9488] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-2">
                {QUESTION_PRESETS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setQuestionCount(Math.min(p, effectiveMax))}
                    disabled={p > effectiveMax}
                    className={`flex-1 py-1.5 text-sm font-semibold rounded-lg border transition-colors ${
                      questionCount === p
                        ? "border-[#0D9488] bg-[#0D9488]/10 text-[#0D9488]"
                        : p > effectiveMax
                        ? "border-gray-200 text-gray-300 cursor-not-allowed"
                        : "border-[#E5E7EB] text-[#6B7280] hover:border-[#0D9488]/40"
                    }`}
                  >
                    {p}Q
                  </button>
                ))}
                <button
                  onClick={() => setQuestionCount(effectiveMax)}
                  className={`flex-1 py-1.5 text-sm font-semibold rounded-lg border transition-colors ${
                    questionCount === effectiveMax
                      ? "border-[#0D9488] bg-[#0D9488]/10 text-[#0D9488]"
                      : "border-[#E5E7EB] text-[#6B7280] hover:border-[#0D9488]/40"
                  }`}
                >
                  All
                </button>
              </div>
            </div>

            {/* Subtopic Filter */}
            {data.subtopics.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-[#374151]">
                    Topics <span className="text-[#6B7280] font-normal">(optional)</span>
                  </p>
                  {selectedSubtopics.length > 0 && (
                    <button
                      onClick={() => setSelectedSubtopics([])}
                      className="text-xs text-[#0D9488] hover:underline"
                    >
                      Clear ({selectedSubtopics.length})
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
                  {data.subtopics.map((s) => (
                    <button
                      key={s}
                      onClick={() => toggleSubtopic(s)}
                      className={`px-3 py-1.5 text-sm rounded-full border font-medium transition-all ${
                        selectedSubtopics.includes(s)
                          ? "border-[#0D9488] bg-[#0D9488] text-white"
                          : "border-[#E5E7EB] text-[#374151] hover:border-[#0D9488]/50"
                      }`}
                    >
                      {selectedSubtopics.includes(s) && <CheckCircle2 className="inline w-3 h-3 mr-1" />}
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Start Button */}
      <div className="flex justify-end pt-2 pb-8">
        <Button
          size="lg"
          className="w-full sm:w-auto px-10 bg-[#0D9488] hover:bg-[#0a7d6f] text-white font-bold rounded-xl transition-colors border-0 h-12"
          onClick={handleStart}
          isLoading={loading}
        >
          Start Block {unlocked ? `(${questionCount}Q)` : ""}
        </Button>
      </div>
    </div>
  );
}

function SetupTestWrapper({ qbankSlug }: { qbankSlug: string }) {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/qbanks/${qbankSlug}/progress`)
      .then((res) => res.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [qbankSlug]);

  if (loading) return <div className="flex justify-center items-center h-64"><Loader size="lg" /></div>;
  if (!data) return <div className="text-red-500 font-semibold text-center mt-12">Failed to load QBank data.</div>;

  return <SetupTestForm qbankSlug={qbankSlug} data={data} />;
}

export default function SetupTestPage(props: { params: Promise<{ qbankSlug: string }> }) {
  const params = use(props.params);
  return (
    <div className="min-h-screen bg-[#F8FAF9] font-sans">
      <div className="bg-white border-b border-[#E5E7EB] sticky top-0 z-10">
        <div className="container mx-auto px-4 md:px-8 h-16 flex items-center gap-4 max-w-5xl">
          <Link
            href={`/dashboard/${params.qbankSlug}`}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:text-[#111827] hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <span className="text-sm font-bold text-[#111827]">Test Setup</span>
        </div>
      </div>
      <div className="container mx-auto py-10 px-4 md:px-8 max-w-5xl">
        <Suspense fallback={<div className="flex justify-center items-center h-64"><Loader size="lg" /></div>}>
          <SetupTestWrapper qbankSlug={params.qbankSlug} />
        </Suspense>
      </div>
    </div>
  );
}
