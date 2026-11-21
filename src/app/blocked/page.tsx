import { Mail } from 'lucide-react';
import Link from 'next/link';
import { AuthShell } from '@/components/ui/AuthShell';

export default function BlockedPage() {
  return (
    <AuthShell eyebrow="Security" title="Account Suspended">
      <p className="mb-6 text-sm leading-relaxed text-slate-600">
        Your account has been temporarily blocked due to repeated violations of our Anti-Cheat Security System. We enforce strict policies against copying, pasting, and navigating away from the test window to protect the integrity of our questions.
      </p>

      <div className="mb-8 rounded-md border border-slate-200 p-4 text-left">
        <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-700">How to restore access</p>
        <p className="text-sm leading-relaxed text-slate-600">
          Please submit a formal email explaining the situation and confirming your adherence to our testing policies moving forward.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <a
          href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@microqbank.com'}?subject=Account%20Suspension%20Appeal`}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-teal-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600"
        >
          <Mail className="h-4 w-4" />
          Email Administration
        </a>
        <Link
          href="/login"
          className="py-2 text-center text-sm text-slate-600 transition-colors hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600"
        >
          Return to Login
        </Link>
      </div>
    </AuthShell>
  );
}