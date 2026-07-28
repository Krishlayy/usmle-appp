'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader } from '@/components/ui/Loader';
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
      setError(res.error !== 'CredentialsSignin' ? res.error : 'Invalid email or password');
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-[#F8FAF9]">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0D4F47] flex-col justify-between p-12 text-white">
        <div>
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity w-fit">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-2xl font-bold tracking-tight">Micro Q-Bank</span>
          </Link>
        </div>
        
        <div className="space-y-6 max-w-md">
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight">Master Medicine.<br/>Ace the Boards.</h1>
          <ul className="space-y-4 text-lg text-teal-50">
            <li className="flex items-center gap-3">
              <svg className="w-6 h-6 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              2,000+ High-Yield Questions
            </li>
            <li className="flex items-center gap-3">
              <svg className="w-6 h-6 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              Detailed Explanations
            </li>
            <li className="flex items-center gap-3">
              <svg className="w-6 h-6 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              Track Your Progress
            </li>
          </ul>
        </div>
        
        <div className="text-sm text-teal-100/70">
          © {new Date().getFullYear()} Micro Q-Bank. All rights reserved.
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-32 relative">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Header */}
          <Link href="/" className="lg:hidden mb-8 flex items-center gap-3 w-fit mx-auto">
            <svg className="w-10 h-10 text-[#0D9488]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-2xl font-bold text-[#111827] tracking-tight">Micro Q-Bank</span>
          </Link>

          <Card className="p-8 shadow-sm rounded-xl border-[#E5E7EB] bg-white">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#111827] mb-2">Welcome back</h2>
              <p className="text-[#6B7280]">Log in to continue your board review.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-[#EF4444]/10 text-[#EF4444] px-4 py-3 rounded-lg text-sm border border-[#EF4444]/20 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-1.5" htmlFor="email">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#E5E7EB] focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all bg-[#F8FAF9] focus:bg-white text-[#111827] text-sm"
                    placeholder="name@university.edu"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-sm font-medium text-[#111827]" htmlFor="password">
                      Password
                    </label>
                    <a href="#" className="text-sm text-[#0D9488] hover:text-[#0a7d6f] font-medium transition-colors">Forgot Password?</a>
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#E5E7EB] focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none transition-all bg-[#F8FAF9] focus:bg-white text-[#111827] text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-[#0D9488] hover:bg-[#0a7d6f] text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
              >
                {loading ? <Loader className="w-5 h-5" /> : 'Log In'}
              </button>
            </form>

            <div className="mt-8 flex items-center justify-between">
              <span className="border-b border-[#E5E7EB] flex-1"></span>
              <span className="text-xs text-[#6B7280] uppercase font-semibold tracking-wider px-4">Or continue with</span>
              <span className="border-b border-[#E5E7EB] flex-1"></span>
            </div>

            <button
              type="button"
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              className="mt-6 w-full h-11 bg-white hover:bg-gray-50 text-[#111827] border border-[#E5E7EB] rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-3 shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
          </Card>

          <p className="mt-8 text-center text-sm text-[#6B7280]">
            Don't have an account?{' '}
            <Link href="/signup" className="text-[#0D9488] hover:text-[#0a7d6f] font-semibold transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
