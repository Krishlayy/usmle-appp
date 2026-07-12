'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
    <div className="min-h-screen flex font-sans bg-white">
      {/* Left side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 sm:p-12 lg:p-24 relative z-10">
        <div className="w-full max-w-md">
          {/* Logo Placeholder */}
          <div className="mb-12 flex items-center gap-3 text-[#003b5c]">
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14h-2v-4H8v-2h2V9h2v2h2v2h-2v4z"/>
            </svg>
            <span className="text-2xl font-black tracking-tight">MedPrep</span>
          </div>

          <h2 className="text-3xl font-bold text-slate-800 mb-2">Welcome back</h2>
          <p className="text-slate-500 mb-8 font-medium">Log in to your account to continue your board review.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-md text-sm font-medium border border-red-200">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-md border border-slate-300 focus:ring-2 focus:ring-[#003b5c] focus:border-[#003b5c] outline-none transition-all bg-slate-50 focus:bg-white text-slate-800 font-medium"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-bold text-slate-700" htmlFor="password">
                    Password
                  </label>
                  <a href="#" className="text-sm font-bold text-blue-600 hover:text-blue-700">Forgot Password?</a>
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-md border border-slate-300 focus:ring-2 focus:ring-[#003b5c] focus:border-[#003b5c] outline-none transition-all bg-slate-50 focus:bg-white text-slate-800 font-medium"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#003b5c] hover:bg-[#002b44] text-white font-bold py-3.5 px-4 rounded-md transition-colors shadow-sm disabled:opacity-70 flex justify-center items-center h-12"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Log In'
              )}
            </button>
          </form>

          <div className="mt-8 flex items-center justify-between">
            <span className="border-b border-slate-200 w-1/5 lg:w-1/4"></span>
            <span className="text-xs text-center text-slate-500 uppercase font-bold tracking-wider">Or log in with</span>
            <span className="border-b border-slate-200 w-1/5 lg:w-1/4"></span>
          </div>

          <button
            type="button"
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            className="mt-6 w-full flex items-center justify-center gap-3 py-3 px-4 border border-slate-300 rounded-md bg-white hover:bg-slate-50 text-slate-700 font-bold transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </button>

          <p className="mt-12 text-center text-slate-500 font-medium">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-bold">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Image/Branding */}
      <div className="hidden lg:flex w-1/2 bg-[#003b5c] relative overflow-hidden flex-col justify-center items-center">
        {/* Abstract background pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20 -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500 rounded-full blur-3xl opacity-20 -ml-20 -mb-20"></div>
        
        <div className="relative z-10 text-white max-w-lg p-12 text-center">
          <h1 className="text-5xl font-extrabold mb-6 leading-tight tracking-tight">Master Your Medical Boards</h1>
          <p className="text-xl text-blue-100 font-medium leading-relaxed mb-12">
            Join thousands of medical students preparing for their exams with our industry-leading question bank and performance analytics.
          </p>
          
          <div className="grid grid-cols-2 gap-6 text-left">
            <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm border border-white/10">
              <div className="text-3xl font-black text-emerald-400 mb-2">5K+</div>
              <div className="text-sm font-medium text-blue-100">Peer-Reviewed Questions</div>
            </div>
            <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm border border-white/10">
              <div className="text-3xl font-black text-blue-400 mb-2">99%</div>
              <div className="text-sm font-medium text-blue-100">Pass Rate for Students</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
