'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader } from '@/components/ui/Loader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

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
    <div className="min-h-screen flex flex-col items-center justify-center font-sans bg-[var(--background)] px-4 py-12 sm:px-6 lg:px-8">
      
      <div className="w-full max-w-[440px] flex flex-col items-center">
        {/* Brand Header */}
        <Link href="/" className="mb-8 flex flex-col items-center gap-4 hover:opacity-80 transition-opacity">
          <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-scale-xl text-primary m-0 tracking-tight">Micro Q-Bank</span>
        </Link>

        <Card elevation="elevated" className="w-full p-8 sm:p-10 bg-white">
          <div className="mb-8 text-center">
            <h2 className="text-scale-lg text-primary mb-2">Welcome back</h2>
            <p className="text-scale-sm text-secondary">Log in to continue your board review.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-md text-scale-sm border border-red-200">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-scale-sm font-semibold text-primary mb-1.5" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-md border border-[var(--color-border-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] outline-none transition-all bg-[var(--color-surface-subtle)] focus:bg-white text-primary text-scale-sm"
                  placeholder="name@university.edu"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-scale-sm font-semibold text-primary" htmlFor="password">
                    Password
                  </label>
                  <a href="#" className="text-scale-xs text-[var(--color-accent)] hover:underline font-medium">Forgot Password?</a>
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-md border border-[var(--color-border-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] outline-none transition-all bg-[var(--color-surface-subtle)] focus:bg-white text-primary text-scale-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full h-11 text-scale-sm"
              isLoading={loading}
            >
              Log In
            </Button>
          </form>

          <div className="mt-8 flex items-center justify-between">
            <span className="border-b border-[var(--color-border-subtle)] w-[28%]"></span>
            <span className="text-scale-xs text-muted uppercase font-semibold tracking-wider">Or continue with</span>
            <span className="border-b border-[var(--color-border-subtle)] w-[28%]"></span>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            className="mt-6 w-full h-11 text-scale-sm gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </Button>
        </Card>

        <p className="mt-8 text-center text-scale-sm text-secondary">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-primary hover:text-accent font-semibold underline underline-offset-4">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
