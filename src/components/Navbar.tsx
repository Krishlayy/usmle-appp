'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
        <Link className="flex items-center gap-2" href="/">
          <div className="bg-black text-white rounded-sm p-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
            </svg>
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800">Micro Q Bank</span>
        </Link>
        <nav className="flex items-center gap-6">
          {(!session || !['ADMIN', 'SUPERADMIN'].includes(session.user?.role)) && (
            <Link 
              href="/store" 
              className={`text-sm font-medium transition-colors hover:text-black ${pathname.startsWith('/store') ? 'text-black' : 'text-gray-500'}`}
            >
              Store
            </Link>
          )}
          
          {status === 'loading' ? (
            <div className="w-20 h-8 animate-pulse bg-gray-100 rounded-none"></div>
          ) : session ? (
            <>
              <Link 
                href="/dashboard" 
                className={`text-sm font-medium transition-colors hover:text-black ${pathname.startsWith('/dashboard') ? 'text-black' : 'text-gray-500'}`}
              >
                Dashboard
              </Link>
              
              {['ADMIN', 'SUPERADMIN'].includes(session.user?.role) && (
                <Link 
                  href="/admin" 
                  className={`text-sm font-medium transition-colors hover:text-black ${pathname.startsWith('/admin') ? 'text-black' : 'text-gray-500'}`}
                >
                  Admin
                </Link>
              )}
              
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-sm font-medium text-gray-500 hover:text-black transition-colors"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/login" 
                className="text-sm font-medium text-gray-500 hover:text-black transition-colors"
              >
                Log In
              </Link>
              <Link 
                href="/signup" 
                className="text-sm font-medium bg-black text-white px-4 py-2 hover:bg-gray-800 transition-colors rounded-none"
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
