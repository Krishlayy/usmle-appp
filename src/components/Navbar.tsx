'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Play } from 'lucide-react';

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/80">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
        <Link className="flex items-center gap-2 group" href="/">
          <div className="bg-gradient-to-br from-[#0f172a] to-[#0891b2] text-white rounded-md p-1.5 shadow-md shadow-cyan-500/10 group-hover:scale-105 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
            </svg>
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900 font-serif">
            Micro <span className="bg-gradient-to-r from-[#0f172a] to-[#0891b2] bg-clip-text text-transparent">Q-Bank</span>
          </span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link 
            href="/demo" 
            className={`text-sm font-semibold flex items-center gap-1.5 transition-all px-3 py-1.5 rounded-full ${pathname.startsWith('/demo') ? 'bg-teal-600 text-white shadow-sm' : 'text-teal-700 bg-teal-50 border border-teal-200/80 hover:bg-teal-100/70'}`}
          >
            <Play className={`w-3.5 h-3.5 ${pathname.startsWith('/demo') ? 'fill-white' : 'fill-teal-700'}`} />
            Test Player
          </Link>

          {(!session || !['ADMIN', 'SUPERADMIN'].includes(session.user?.role)) && (
            <Link 
              href="/store" 
              className={`text-sm font-medium transition-colors hover:text-slate-900 ${pathname.startsWith('/store') ? 'text-slate-900' : 'text-slate-500'}`}
            >
              Store
            </Link>
          )}
          
          {status === 'loading' ? (
            <div className="w-20 h-8 animate-pulse bg-slate-100 rounded-md"></div>
          ) : session ? (
            <>
              <Link 
                href="/dashboard" 
                className={`text-sm font-medium transition-colors hover:text-slate-900 ${pathname.startsWith('/dashboard') ? 'text-slate-900' : 'text-slate-500'}`}
              >
                Dashboard
              </Link>
              
              {['ADMIN', 'SUPERADMIN'].includes(session.user?.role) && (
                <Link 
                  href="/admin" 
                  className={`text-sm font-medium transition-colors hover:text-slate-900 ${pathname.startsWith('/admin') ? 'text-slate-900' : 'text-slate-500'}`}
                >
                  Admin
                </Link>
              )}
              
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/login" 
                className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
              >
                Log In
              </Link>
              <Link 
                href="/signup" 
                className="text-sm font-medium bg-slate-900 text-white px-4 py-2 hover:bg-slate-800 transition-colors rounded-md shadow-sm"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
