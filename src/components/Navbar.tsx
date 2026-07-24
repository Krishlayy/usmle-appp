'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-[var(--color-border-subtle)] shadow-[0_4px_30px_rgba(0,0,0,0.02)] transition-all duration-300">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link className="flex items-center gap-3 group" href="/">
          <div className="w-9 h-9 relative rounded-lg overflow-hidden bg-white border border-[var(--color-border-subtle)] shadow-sm flex items-center justify-center transition-transform duration-300 group-hover:scale-105 group-hover:shadow-md">
            <img src="/logo.png" alt="Micro - Q bank logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-bold text-[22px] tracking-tight text-primary">Micro - Q bank</span>
        </Link>
        <nav className="flex items-center gap-6">
          {(!session || !['ADMIN', 'SUPERADMIN'].includes(session.user?.role)) && (
            <Link 
              href="/store" 
              className={`text-[15px] font-semibold transition-colors duration-200 hover:text-primary ${pathname.startsWith('/store') ? 'text-primary' : 'text-secondary'}`}
            >
              Store
            </Link>
          )}
          
          {status === 'loading' ? (
            <div className="w-24 h-10 animate-pulse bg-slate-100 rounded-md"></div>
          ) : session ? (
            <>
              <Link 
                href="/dashboard" 
                className={`text-[15px] font-semibold transition-colors duration-200 hover:text-primary ${pathname.startsWith('/dashboard') ? 'text-primary' : 'text-secondary'}`}
              >
                Dashboard
              </Link>
              
              {['ADMIN', 'SUPERADMIN'].includes(session.user?.role) && (
                <Link 
                  href="/admin" 
                  className={`text-[15px] font-semibold transition-colors duration-200 hover:text-primary ${pathname.startsWith('/admin') ? 'text-primary' : 'text-secondary'}`}
                >
                  Admin
                </Link>
              )}
              
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-[15px] font-semibold text-secondary hover:text-primary transition-colors duration-200"
              >
                Log Out
              </button>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link 
                href="/login" 
                className="text-[15px] font-semibold text-secondary hover:text-primary transition-colors duration-200"
              >
                Log In
              </Link>
              <Link 
                href="/signup" 
                className="text-[15px] font-semibold bg-primary text-white px-5 py-2.5 hover:bg-slate-800 transition-all duration-300 rounded-md shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                Sign Up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
