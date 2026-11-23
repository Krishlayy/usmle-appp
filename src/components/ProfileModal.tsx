'use client';

import React, { useState } from 'react';
import { X, User, Mail, Calendar, Clock, Award, CheckCircle2 } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  answeredCount?: number;
  accuracy?: number;
}

export function ProfileModal({ isOpen, onClose, answeredCount = 0, accuracy = 0 }: ProfileModalProps) {
  const { data: session, update } = useSession();
  const [name, setName] = useState(session?.user?.name || '');
  const [examDate, setExamDate] = useState('2026-12-15');
  const [targetScore, setTargetScore] = useState('250+');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (update) {
      void update({ name });
    }
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl md:p-8">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          aria-label="Close profile modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-teal-50 border border-teal-200 text-teal-700 font-serif text-xl font-bold">
            {name?.[0]?.toUpperCase() || session?.user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="font-serif text-xl font-medium text-slate-900">Student Profile & Settings</h2>
            <p className="text-xs text-slate-500">Manage your credentials, target exam date, and study stats</p>
          </div>
        </div>

        {/* Study Stats Overview */}
        <div className="my-6 grid grid-cols-3 gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
          <div>
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
              <Award className="h-3.5 w-3.5 text-teal-600" /> Accuracy
            </span>
            <p className="mt-1 font-mono text-xl font-semibold text-slate-900">{accuracy}%</p>
          </div>
          <div>
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
              <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" /> Solved
            </span>
            <p className="mt-1 font-mono text-xl font-semibold text-slate-900">{answeredCount} Qs</p>
          </div>
          <div>
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
              <Clock className="h-3.5 w-3.5 text-teal-600" /> Study Time
            </span>
            <p className="mt-1 font-mono text-xl font-semibold text-slate-900">14.2 hrs</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Student"
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                disabled
                value={session?.user?.email || 'student@medico.com'}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Target Exam Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Goal Score
              </label>
              <input
                type="text"
                value={targetScore}
                onChange={(e) => setTargetScore(e.target.value)}
                placeholder="Pass / 250+"
                className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-800 transition-colors shadow-sm"
            >
              {saved ? (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Saved!
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
