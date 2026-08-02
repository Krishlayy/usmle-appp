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
    <div className="min-h-screen flex flex-col items-center justify-center font-sans bg-[#0a0d14] px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[20%] right-[20%] w-[300px] h-[300px] rounded-full bg-purple-900/10 blur-[80px]"></div>
        <div className="absolute bottom-[20%] left-[20%] w-[350px] h-[350px] rounded-full bg-cyan-950/10 blur-[90px]"></div>
      </div>

      <div className="w-full max-w-[440px] flex flex-col items-center z-10">
        {/* Brand Header */}
        <Link href="/" className="mb-8 flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="bg-gradient-to-br from-[#8b5cf6] to-[#06b6d4] text-white rounded-md p-1.5 shadow-md shadow-purple-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
            </svg>
          </div>
          <span className="text-2xl font-bold tracking-tight text-white font-serif">
            Micro <span className="bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] bg-clip-text text-transparent">Q-Bank</span>
          </span>
        </Link>

        <Card elevation="elevated" className="w-full p-8 sm:p-10 bg-[#111524]/85 border border-white/10 shadow-2xl backdrop-blur-md">
          <div className="mb-8 text-center">
            <h2 className="text-xl font-bold text-white mb-2 font-serif">Create an account</h2>
            <p className="text-sm text-gray-400">Join thousands of medical students today.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 text-red-400 px-4 py-3 rounded-md text-sm border border-red-500/20">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1.5" htmlFor="name">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-md border border-white/10 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all bg-[#0a0d14] text-white text-sm"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1.5" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-md border border-white/10 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all bg-[#0a0d14] text-white text-sm"
                  placeholder="name@university.edu"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1.5" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-md border border-white/10 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all bg-[#0a0d14] text-white text-sm"
                  placeholder="Create a password (min 6 chars)"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full h-11 text-sm bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] border-none text-white hover:opacity-95"
              isLoading={loading}
            >
              Sign Up
            </Button>
          </form>
        </Card>

        <p className="mt-8 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-4">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
