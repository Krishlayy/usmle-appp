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
    <div className="min-h-screen flex flex-col items-center justify-center font-sans bg-[#0a0d14] px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[20%] left-[20%] w-[300px] h-[300px] rounded-full bg-purple-900/10 blur-[80px]"></div>
        <div className="absolute bottom-[20%] right-[20%] w-[350px] h-[350px] rounded-full bg-cyan-950/10 blur-[90px]"></div>
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
            <h2 className="text-xl font-bold text-white mb-2 font-serif">Welcome back</h2>
            <p className="text-sm text-gray-400">Log in to continue your board review.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 text-red-400 px-4 py-3 rounded-md text-sm border border-red-500/20">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
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
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-semibold text-gray-300" htmlFor="password">
                    Password
                  </label>
                  <a href="#" className="text-xs text-cyan-400 hover:underline font-medium">Forgot Password?</a>
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-md border border-white/10 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all bg-[#0a0d14] text-white text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full h-11 text-sm bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] border-none text-white hover:opacity-95"
              isLoading={loading}
            >
              Log In
            </Button>
          </form>

          <div className="mt-8 flex items-center justify-between">
            <span className="border-b border-white/10 w-[28%]"></span>
            <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">Or continue with</span>
            <span className="border-b border-white/10 w-[28%]"></span>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            className="mt-6 w-full h-11 text-sm gap-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white"
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

        <p className="mt-8 text-center text-sm text-gray-400">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-4">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
