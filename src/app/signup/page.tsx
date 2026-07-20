'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader } from '@/components/ui/Loader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      router.push('/login?registered=true');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
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
            <h2 className="text-scale-lg text-primary mb-2">Create an account</h2>
            <p className="text-scale-sm text-secondary">Join thousands of medical students today.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-md text-scale-sm border border-red-200">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-scale-sm font-semibold text-primary mb-1.5" htmlFor="name">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-md border border-[var(--color-border-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] outline-none transition-all bg-[var(--color-surface-subtle)] focus:bg-white text-primary text-scale-sm"
                  placeholder="John Doe"
                />
              </div>

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
                <label className="block text-scale-sm font-semibold text-primary mb-1.5" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-md border border-[var(--color-border-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] outline-none transition-all bg-[var(--color-surface-subtle)] focus:bg-white text-primary text-scale-sm"
                  placeholder="Create a password (min 6 chars)"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full h-11 text-scale-sm"
              isLoading={loading}
            >
              Sign Up
            </Button>
          </form>
        </Card>

        <p className="mt-8 text-center text-scale-sm text-secondary">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:text-accent font-semibold underline underline-offset-4">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
