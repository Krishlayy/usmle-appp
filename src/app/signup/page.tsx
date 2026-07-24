'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

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
    <div className="min-h-screen flex font-sans bg-white">
      {/* Left Pane - Branding (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[var(--color-primary)] flex-col justify-between p-16 relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-4 text-white hover:opacity-80 transition-opacity w-fit">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-2xl font-bold tracking-tight">Micro Q-Bank</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-bold text-white mb-6 leading-tight">Start your journey to board success.</h1>
          <p className="text-lg text-blue-100/80 font-medium">Create an account in seconds and get access to the most high-yield clinical scenarios available.</p>
          
          <div className="mt-12 flex items-center gap-4">
            <div className="flex -space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-200 border-2 border-[var(--color-primary)]"></div>
              <div className="w-10 h-10 rounded-full bg-blue-300 border-2 border-[var(--color-primary)]"></div>
              <div className="w-10 h-10 rounded-full bg-blue-400 border-2 border-[var(--color-primary)]"></div>
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border-2 border-[var(--color-primary)]">
                <span className="text-xs font-bold text-primary">+10k</span>
              </div>
            </div>
            <span className="text-sm text-blue-100 font-semibold">Medical Students</span>
          </div>
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24">
        <div className="w-full max-w-[400px] mx-auto">
          {/* Mobile Header (Only visible on small screens) */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <svg className="w-8 h-8 text-[var(--color-primary)]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xl font-bold text-[var(--color-primary)] tracking-tight">Micro Q-Bank</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[var(--color-primary)] mb-2 tracking-tight">Create your account</h2>
            <p className="text-base text-[var(--color-secondary)] font-medium">Join the platform trusted by top institutions.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-md text-sm border border-red-200 font-medium">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--color-primary)] mb-1.5" htmlFor="name">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-sm"
                  placeholder="Dr. John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-primary)] mb-1.5" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-sm"
                  placeholder="name@university.edu"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-primary)] mb-1.5" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-sm"
                  placeholder="Create a password (min 6 chars)"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full h-12 text-sm font-bold shadow-md hover:shadow-lg transition-all"
              isLoading={loading}
            >
              Sign Up
            </Button>
          </form>

          <p className="mt-10 text-center text-sm text-[var(--color-secondary)] font-medium">
            Already have an account?{' '}
            <Link href="/login" className="text-[var(--color-primary)] hover:text-[var(--color-accent)] font-bold underline underline-offset-4">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
