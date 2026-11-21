'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import {
  AuthShell,
  authInputClass,
  authLabelClass,
  authErrorClass,
  authLinkClass,
} from '@/components/ui/AuthShell';

// Shown only when NEXT_PUBLIC_DEMO_MODE=true (never on a real deployment). Mirrors prisma/seed-demo-users.ts.
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
const DEMO_ACCOUNTS = [
  { role: 'Student', email: 'student@mqb.demo', password: 'Student#Demo2026' },
  { role: 'Admin', email: 'admin@mqb.demo', password: 'Admin#Demo2026' },
  { role: 'Superadmin', email: 'superadmin@mqb.demo', password: 'Super#Demo2026' },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError('Invalid email or password');
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <AuthShell
      eyebrow="Log in"
      title="Welcome back"
      subtitle="Log in to continue your board review."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link href="/signup" className={authLinkClass}>
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div role="alert" className={authErrorClass}>
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className={authLabelClass} htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={authInputClass}
              placeholder="name@university.edu"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block font-mono text-[11px] uppercase tracking-[0.18em] text-slate-600" htmlFor="password">
                Password
              </label>
              <Link href="/forgot-password" className="text-xs text-slate-600 transition-colors hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600">
                Forgot Password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={authInputClass}
              placeholder="Your password"
            />
          </div>
        </div>

        <Button type="submit" variant="primary" className="h-11 w-full text-sm" isLoading={loading}>
          Log In
        </Button>
      </form>

      <div className="my-6 flex items-center gap-4" aria-hidden>
        <span className="h-px flex-1 bg-slate-200" />
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">Or</span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <Button
        type="button"
        variant="secondary"
        onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
        className="h-11 w-full gap-3 text-sm text-slate-900"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09zM12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23zM5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62zM12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Google
      </Button>

      {DEMO_MODE && (
        <div className="mt-6 rounded-md border border-teal-200 bg-teal-50 p-4">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-teal-700">Demo accounts</p>
          <div className="grid grid-cols-3 gap-2">
            {DEMO_ACCOUNTS.map((a) => (
              <button
                key={a.role}
                type="button"
                onClick={() => {
                  setEmail(a.email);
                  setPassword(a.password);
                }}
                className="rounded-md border border-teal-200 bg-white px-2 py-2 text-xs font-medium text-teal-800 transition-colors hover:border-teal-400 hover:bg-teal-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600"
              >
                {a.role}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-600">Click a role to fill the form, then press Log In.</p>
        </div>
      )}
    </AuthShell>
  );
}