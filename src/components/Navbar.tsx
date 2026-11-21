'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { 
  LogOut, 
  BookOpen, 
  ShieldAlert, 
  User, 
  ChevronDown, 
  LayoutDashboard,
  Settings
} from 'lucide-react';

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // In simulator full exam mode, give full edge-to-edge view to the authentic board exam header
  if (pathname === '/simulator') {
    return null;
  }

  const isAdmin = session?.user?.role === 'SUPERADMIN' || session?.user?.role === 'ADMIN';

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left: Clinical Brand Logo */}
        <Link href={session ? "/dashboard" : "/"} className="flex items-center gap-2.5 group select-none">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-slate-900 via-teal-900 to-teal-600 flex items-center justify-center shadow-md shadow-teal-950/20 group-hover:scale-105 transition-all p-1.5 border border-teal-500/20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-white">
              <path d="M12 3v4m0 10v4" />
              <path d="M3 12h4m10 0h4" />
              <path d="M7 12l2.5-3 2.5 6 2.5-5 2.5 2" stroke="url(#logoGlow)" strokeWidth="2.4" />
              <defs>
                <linearGradient id="logoGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#2dd4bf" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-teal-400 border border-white" />
          </div>

          <div className="flex items-center gap-2">
            <span className="font-sans text-xl font-black tracking-tight text-slate-900 leading-none">
              Micro<span className="text-teal-600">QBank</span>
            </span>
            <span className="text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200/70 font-mono leading-none">
              USMLE®
            </span>
          </div>
        </Link>

        {/* Center: Question Banks Primary Navigation */}
        <nav className="flex items-center">
          <Link 
            href={session ? "/dashboard" : "/#qbanks"} 
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              pathname === '/dashboard' || pathname === '/#qbanks'
                ? 'bg-teal-50 text-teal-900 border border-teal-200 shadow-2xs' 
                : 'text-slate-700 hover:text-teal-700 hover:bg-slate-50 border border-transparent'
            }`}
          >
            <BookOpen className="w-4 h-4 text-teal-600" />
            <span>Question Banks</span>
          </Link>
        </nav>

        {/* Right: User Profile Dropdown & Auth Area */}
        <div className="flex items-center gap-3">
          {status === 'loading' ? (
            <div className="w-20 h-8 animate-pulse bg-slate-100 rounded-lg" />
          ) : session ? (
            /* Logged In User Profile Dropdown */
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-100/80 transition-all border border-transparent hover:border-slate-200 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {session.user?.name?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="hidden sm:flex flex-col text-left leading-none">
                  <span className="text-xs font-bold text-slate-800">
                    {session.user?.name || session.user?.email?.split('@')[0]}
                  </span>
                  {isAdmin && (
                    <span className="text-[10px] font-semibold text-amber-700 mt-0.5">
                      Admin
                    </span>
                  )}
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown Menu */}
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* User Info Header */}
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">Signed in as</p>
                    <p className="text-sm font-bold text-slate-900 truncate mt-0.5">{session.user?.email}</p>
                    {isAdmin && (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-mono font-bold">
                        ADMIN PRIVILEGES
                      </span>
                    )}
                  </div>

                  {/* Menu Options */}
                  <div className="py-1">
                    <Link
                      href="/dashboard"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-teal-700 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-slate-500" />
                      <span>Dashboard &amp; Q-Banks</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-amber-800 hover:bg-amber-50 transition-colors"
                      >
                        <ShieldAlert className="w-4 h-4 text-amber-600" />
                        <span>Admin Control Center</span>
                      </Link>
                    )}
                  </div>

                  {/* Sign Out CTA */}
                  <div className="border-t border-slate-100 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        signOut({ callbackUrl: '/' });
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Logged Out State: Login & Sign Up */
            <div className="flex items-center gap-2.5">
              <Link
                href="/login"
                className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-teal-700 px-3.5 py-2 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="text-xs sm:text-sm font-bold text-white bg-teal-600 hover:bg-teal-500 px-4 py-2 rounded-xl shadow-xs transition-all hover:scale-105"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
