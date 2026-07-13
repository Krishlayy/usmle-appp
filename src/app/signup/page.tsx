'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
      {/* Left side - Signup Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 sm:p-12 lg:p-24 relative z-10">
        <div className="w-full max-w-md">
          {/* Logo Placeholder */}
          <Link href="/" className="mb-12 flex items-center gap-3 text-[#003b5c] hover:opacity-80 transition-opacity w-fit">
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14h-2v-4H8v-2h2V9h2v2h2v2h-2v4z"/>
            </svg>
            <span className="text-2xl font-black tracking-tight">MedPrep</span>
          </Link>

          <h2 className="text-3xl font-bold text-slate-800 mb-2">Create an account</h2>
          <p className="text-slate-500 mb-8 font-medium">Join the thousands of medical students who trust MedPrep.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-md text-sm font-medium border border-red-200">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5" htmlFor="name">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-md border border-slate-300 focus:ring-2 focus:ring-[#003b5c] focus:border-[#003b5c] outline-none transition-all bg-slate-50 focus:bg-white text-slate-800 font-medium"
                  placeholder="Enter your full name"
                />
              </div>

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
                <label className="block text-sm font-bold text-slate-700 mb-1.5" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-md border border-slate-300 focus:ring-2 focus:ring-[#003b5c] focus:border-[#003b5c] outline-none transition-all bg-slate-50 focus:bg-white text-slate-800 font-medium"
                  placeholder="Create a password (min 6 characters)"
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
                'Sign Up'
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-slate-500 font-medium">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-bold">
              Log in
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
          <h1 className="text-5xl font-extrabold mb-6 leading-tight tracking-tight">Your Journey Starts Here</h1>
          <p className="text-xl text-blue-100 font-medium leading-relaxed mb-12">
            Create an account today to access thousands of high-yield questions, detailed explanations, and performance tracking.
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
