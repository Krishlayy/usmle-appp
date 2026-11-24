'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, GraduationCap, Calendar, ShieldCheck, Stethoscope } from 'lucide-react';

interface OnboardingFormProps {
  initialName: string;
  userEmail: string;
}

const EXAM_OPTIONS = [
  { id: 'USMLE_STEP_1', label: 'USMLE Step 1', desc: 'Pre-clinical sciences & organ system pathology' },
  { id: 'USMLE_STEP_2_CK', label: 'USMLE Step 2 CK', desc: 'Clinical diagnosis, internal medicine & surgery' },
  { id: 'USMLE_STEP_3', label: 'USMLE Step 3', desc: 'Inpatient management, ambulatory care & CCS' },
  { id: 'COMLEX', label: 'COMLEX-USA (Level 1/2)', desc: 'Osteopathic clinical and foundational medicine' },
];

const ATTEMPT_OPTIONS = [
  { id: 'FIRST', label: 'First Attempt', sub: 'Initial exam testing cycle' },
  { id: 'RETAKE', label: 'Retake / Second Attempt', sub: 'Targeted remediation & score enhancement' },
];

const TIMELINE_OPTIONS = [
  'Within 1-3 Months (Dedicated Phase)',
  '3-6 Months',
  '6-12 Months',
  'Flexible / Pre-dedicated',
];

const STAGE_OPTIONS = [
  'MS1 (First Year Medical Student)',
  'MS2 (Pre-clinical Candidate)',
  'MS3 (Clinical Clerkships)',
  'MS4 (Senior / Residency Applicant)',
  'International Medical Graduate (IMG)',
  'Resident Physician / Fellow',
];

export function OnboardingForm({ initialName, userEmail }: OnboardingFormProps) {
  const router = useRouter();
  const [preferredName, setPreferredName] = useState(initialName);
  const [targetExam, setTargetExam] = useState('USMLE_STEP_1');
  const [examAttempt, setExamAttempt] = useState('FIRST');
  const [targetDate, setTargetDate] = useState('Within 1-3 Months (Dedicated Phase)');
  const [medicalSchool, setMedicalSchool] = useState('');
  const [graduationYear, setGraduationYear] = useState('MS2 (Pre-clinical Candidate)');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferredName,
          targetExam,
          examAttempt,
          targetDate,
          medicalSchool,
          graduationYear,
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Failed to complete profile onboarding.');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      console.error('Onboarding submission error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* 1. Name & Email */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <Stethoscope className="h-4 w-4 text-teal-700" />
          <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-700">
            1. Candidate Identification
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="preferredName" className="block text-xs font-medium text-slate-700 mb-1">
              Full or Preferred Name
            </label>
            <input
              id="preferredName"
              type="text"
              required
              value={preferredName}
              onChange={(e) => setPreferredName(e.target.value)}
              placeholder="e.g. Dr. Alex Mercer"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 shadow-2xs focus:border-teal-600 focus:outline-hidden focus:ring-1 focus:ring-teal-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Registered Email (Verified)
            </label>
            <input
              type="email"
              disabled
              value={userEmail}
              className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3.5 py-2 text-sm text-slate-500 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* 2. Target Examination */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <GraduationCap className="h-4 w-4 text-teal-700" />
          <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-700">
            2. Target Examination Track
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {EXAM_OPTIONS.map((exam) => (
            <label
              key={exam.id}
              className={`relative flex cursor-pointer flex-col rounded-xl border p-4 transition-all ${
                targetExam === exam.id
                  ? 'border-teal-700 bg-teal-50/60 ring-1 ring-teal-700'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <input
                type="radio"
                name="targetExam"
                value={exam.id}
                checked={targetExam === exam.id}
                onChange={() => setTargetExam(exam.id)}
                className="sr-only"
              />
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900">{exam.label}</span>
                {targetExam === exam.id && (
                  <CheckCircle2 className="h-4 w-4 text-teal-700 shrink-0" />
                )}
              </div>
              <p className="mt-1 text-xs text-slate-500">{exam.desc}</p>
            </label>
          ))}
        </div>
      </div>

      {/* 3. Attempt & Preparation Phase */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <Calendar className="h-4 w-4 text-teal-700" />
          <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-700">
            3. Attempt & Study Timeline
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {ATTEMPT_OPTIONS.map((attempt) => (
            <label
              key={attempt.id}
              className={`relative flex cursor-pointer flex-col rounded-xl border p-4 transition-all ${
                examAttempt === attempt.id
                  ? 'border-teal-700 bg-teal-50/60 ring-1 ring-teal-700'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <input
                type="radio"
                name="examAttempt"
                value={attempt.id}
                checked={examAttempt === attempt.id}
                onChange={() => setExamAttempt(attempt.id)}
                className="sr-only"
              />
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900">{attempt.label}</span>
                {examAttempt === attempt.id && (
                  <CheckCircle2 className="h-4 w-4 text-teal-700 shrink-0" />
                )}
              </div>
              <p className="mt-1 text-xs text-slate-500">{attempt.sub}</p>
            </label>
          ))}
        </div>

        <div className="pt-2">
          <label htmlFor="targetDate" className="block text-xs font-medium text-slate-700 mb-1">
            Target Test Date / Dedicated Period
          </label>
          <select
            id="targetDate"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs focus:border-teal-600 focus:outline-hidden focus:ring-1 focus:ring-teal-600"
          >
            {TIMELINE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Training Background */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <ShieldCheck className="h-4 w-4 text-teal-700" />
          <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-700">
            4. Academic Institution & Current Status
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="medicalSchool" className="block text-xs font-medium text-slate-700 mb-1">
              Medical School / Hospital (Optional)
            </label>
            <input
              id="medicalSchool"
              type="text"
              value={medicalSchool}
              onChange={(e) => setMedicalSchool(e.target.value)}
              placeholder="e.g. Johns Hopkins SOM, AIIMS, St. George's"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 shadow-2xs focus:border-teal-600 focus:outline-hidden focus:ring-1 focus:ring-teal-600"
            />
          </div>

          <div>
            <label htmlFor="graduationYear" className="block text-xs font-medium text-slate-700 mb-1">
              Current Medical Training Stage
            </label>
            <select
              id="graduationYear"
              value={graduationYear}
              onChange={(e) => setGraduationYear(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-2xs focus:border-teal-600 focus:outline-hidden focus:ring-1 focus:ring-teal-600"
            >
              {STAGE_OPTIONS.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <Button
          type="submit"
          variant="primary"
          isLoading={loading}
          className="w-full h-12 text-sm font-semibold rounded-lg shadow-sm"
        >
          {loading ? 'Configuring Study Engine...' : 'Complete Setup & Launch Dashboard'}
        </Button>
      </div>
    </form>
  );
}
