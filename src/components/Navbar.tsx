'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { LogOut, ShieldAlert, ChevronDown, LayoutDashboard } from 'lucide-react';

// Every consumer route uses the dark MQB language; only the admin panel (which hides this nav) is light.
const LIGHT_PREFIXES = ['/admin'];

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // NOTE: this early return must stay AFTER all hooks (it used to precede useEffect,
  // which changes the hook count when navigating to/from /simulator and crashes React).
  if (pathname === '/simulator') return null;

  const isAdmin = session?.user?.role === 'SUPERADMIN' || session?.user?.role === 'ADMIN';
  const dark = !pathname || !LIGHT_PREFIXES.some((p) => pathname.startsWith(p));

  const shell = dark
    ? 'bg-[#070a0f]/60 border-white/10 text-slate-100'
    : 'bg-white/90 border-slate-200 text-slate-900';
  const muted = dark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900';
  const menu = dark
    ? 'bg-[#0d1219] border-white/10 text-slate-200'
    : 'bg-white border-slate-200 text-slate-800';
  const menuItem = dark ? 'hover:bg-white/5' : 'hover:bg-slate-50';

  return (
    <header className={`sticky top-0 z-50 w-full border-b backdrop-blur-xl ${shell}`}>
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 md:px-10">
        <Link href={session ? '/dashboard' : '/'} className="flex items-center gap-2.5 select-none">
          <span className="grid h-6 w-6 place-items-center rounded-[5px] bg-teal-300 font-mono text-[11px] font-bold text-slate-950">
            M
          </span>
          <span className="text-[15px] font-semibold tracking-tight">MicroQBank</span>
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link href={session ? '/dashboard' : '/#qbanks'} className={`transition-colors ${muted}`}>
            Question banks
          </Link>

          {status === 'loading' ? (
            <div className={`h-7 w-20 animate-pulse rounded-md ${dark ? 'bg-white/10' : 'bg-slate-100'}`} />
          ) : session ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                aria-haspopup="menu"
                aria-expanded={profileOpen}
                className="flex cursor-pointer items-center gap-2 rounded-md py-1 pl-1 pr-2 transition-colors hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full border border-current/20 text-xs font-semibold">
                  {session.user?.name?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase() || 'U'}
                </span>
                <ChevronDown className={`h-3.5 w-3.5 opacity-60 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileOpen && (
                <div role="menu" className={`absolute right-0 mt-2 w-60 overflow-hidden rounded-lg border py-1 ${menu}`}>
                  <div className="border-b border-current/10 px-4 py-3">
                    <p className="truncate text-sm">{session.user?.email}</p>
                    {isAdmin && <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-amber-400">Admin</p>}
                  </div>
                  <Link
                    href="/dashboard"
                    role="menuitem"
                    onClick={() => setProfileOpen(false)}
                    className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${menuItem}`}
                  >
                    <LayoutDashboard className="h-4 w-4 opacity-60" /> Dashboard
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      role="menuitem"
                      onClick={() => setProfileOpen(false)}
                      className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${menuItem}`}
                    >
                      <ShieldAlert className="h-4 w-4 opacity-60" /> Admin
                    </Link>
                  )}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setProfileOpen(false);
                      signOut({ callbackUrl: '/' });
                    }}
                    className={`flex w-full cursor-pointer items-center gap-2.5 border-t border-current/10 px-4 py-2.5 text-left text-sm text-rose-400 transition-colors ${menuItem}`}
                  >
                    <LogOut className="h-4 w-4" /> Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login" className={`transition-colors ${muted}`}>
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-teal-300 px-3.5 py-1.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-teal-200"
              >
                Sign up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
