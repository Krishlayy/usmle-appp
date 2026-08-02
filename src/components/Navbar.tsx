'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0a0d14]/80 backdrop-blur-md border-b border-[rgba(255,255,255,0.08)]">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
        <Link className="flex items-center gap-2 group" href="/">
          <div className="bg-gradient-to-br from-[#8b5cf6] to-[#06b6d4] text-white rounded-md p-1.5 shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
            </svg>
          </div>
          <span className="font-bold text-xl tracking-tight text-white font-serif">
            Micro <span className="bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] bg-clip-text text-transparent">Q-Bank</span>
          </span>
        </Link>
        <nav className="flex items-center gap-6">
          {(!session || !['ADMIN', 'SUPERADMIN'].includes(session.user?.role)) && (
            <Link 
              href="/store" 
              className={`text-sm font-medium transition-colors hover:text-white ${pathname.startsWith('/store') ? 'text-white' : 'text-gray-400'}`}
            >
              Store
            </Link>
          )}
          
          {status === 'loading' ? (
            <div className="w-20 h-8 animate-pulse bg-white/5 rounded-md"></div>
          ) : session ? (
            <>
              <Link 
                href="/dashboard" 
                className={`text-sm font-medium transition-colors hover:text-white ${pathname.startsWith('/dashboard') ? 'text-white' : 'text-gray-400'}`}
              >
                Dashboard
              </Link>
              
              {['ADMIN', 'SUPERADMIN'].includes(session.user?.role) && (
                <Link 
                  href="/admin" 
                  className={`text-sm font-medium transition-colors hover:text-white ${pathname.startsWith('/admin') ? 'text-white' : 'text-gray-400'}`}
                >
                  Admin
                </Link>
              )}
              
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/login" 
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                Log In
              </Link>
              <Link 
                href="/signup" 
                className="text-sm font-medium bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] text-white px-4 py-2 hover:opacity-90 transition-opacity rounded-md shadow-md shadow-purple-500/10"
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
