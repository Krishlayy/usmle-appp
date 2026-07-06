'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <Link className="flex items-center gap-2" href="/">
          <div className="bg-blue-600 text-white rounded p-1.5 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
            </svg>
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800">U-Micro</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link 
            href="/store" 
            className={`text-sm font-medium transition-colors hover:text-blue-600 ${pathname.startsWith('/store') ? 'text-blue-600' : 'text-slate-600'}`}
          >
            Store
          </Link>
          
          {status === 'loading' ? (
            <div className="w-20 h-8 animate-pulse bg-slate-200 rounded"></div>
          ) : session ? (
            <>
              <Link 
                href="/dashboard" 
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${pathname.startsWith('/dashboard') ? 'text-blue-600' : 'text-slate-600'}`}
              >
                Dashboard
              </Link>
              
              {session.user?.role === 'ADMIN' && (
                <Link 
                  href="/admin" 
                  className={`text-sm font-medium transition-colors hover:text-blue-600 ${pathname.startsWith('/admin') ? 'text-blue-600' : 'text-slate-600'}`}
                >
                  Admin
                </Link>
              )}
              
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-sm font-medium text-slate-600 hover:text-red-600 transition-colors"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/login" 
                className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
              >
                Log In
              </Link>
              <Link 
                href="/signup" 
                className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
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
