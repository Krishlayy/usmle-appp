import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { OnboardingForm } from './OnboardingForm';

export const metadata = {
  title: 'Candidate Profile Setup | Micro Q-Bank',
  description: 'Customize your USMLE board review telemetry and study plan.',
};

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      preferredName: true,
      onboardingCompleted: true,
      targetExam: true,
      examAttempt: true,
      targetDate: true,
      medicalSchool: true,
      graduationYear: true,
    },
  });

  if (user?.onboardingCompleted) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Ambient medical accent background */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-50 via-slate-50 to-white" />

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl px-4">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 font-mono text-xs uppercase tracking-wider text-teal-800 font-semibold mb-3">
            USMLE&reg; Candidate Onboarding
          </span>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-slate-900 sm:text-4xl">
            Tailor Your Board Review Experience
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
            Provide your examination timeline and training background to personalize question stems and performance analytics.
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10">
          <OnboardingForm
            initialName={user?.preferredName || user?.name || ''}
            userEmail={user?.email || ''}
          />
        </div>

        <p className="mt-6 text-center text-xs text-slate-500 font-mono">
          Micro Q-Bank Medical Assessment Engine &bull; Enterprise Telemetry
        </p>
      </div>
    </div>
  );
}
