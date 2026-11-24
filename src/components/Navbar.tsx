'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import {
  LogOut,
  ShieldAlert,
  ChevronDown,
  LayoutDashboard,
  Layers,
  BarChart3,
  HelpCircle,
  User,
  SlidersHorizontal,
} from 'lucide-react';
import { ProfileModal } from './ProfileModal';
import { SupportModal } from './SupportModal';
import { ResultsModal } from './ResultsModal';

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
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

  if (pathname === '/simulator') return null;

  const isAdmin = session?.user?.role === 'SUPERADMIN' || session?.user?.role === 'ADMIN';
  const shell = 'bg-white/95 border-slate-200/80 text-slate-900';
  const navTabClass = (isActive: boolean) =>
    `inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
      isActive
        ? 'bg-teal-50 text-teal-800 font-semibold shadow-2xs'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
    }`;

  return (
    <>
      <header className={`sticky top-0 z-40 w-full border-b backdrop-blur-xl ${shell}`}>
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 md:px-10">
          {/* Enterprise Brand Logo */}
          <Link href={session ? '/dashboard' : '/'} className="flex items-center gap-3 select-none group">
            <div className="relative grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-teal-700 to-teal-900 text-white shadow-xs border border-teal-600/30 transition-transform duration-300 group-hover:scale-105">
              <span className="font-mono text-sm font-bold tracking-tight text-white drop-shadow-xs">M</span>
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-[17px] font-semibold tracking-tight text-slate-950 leading-none">
                  MicroQBank
                </span>
                <span className="rounded-[4px] border border-teal-200 bg-teal-50 px-1 py-0.2 font-mono text-[8.5px] font-bold uppercase tracking-wider text-teal-800">
                  Step 1
                </span>
              </div>
              <span className="mt-0.5 font-mono text-[9px] uppercase tracking-widest text-slate-400 font-medium">
                Clinical Board Suite
              </span>
            </div>
          </Link>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 text-sm">
            <Link
              href={session ? '/dashboard' : '/#qbanks'}
              className={navTabClass(pathname === '/dashboard')}
            >
              <LayoutDashboard className="h-3.5 w-3.5 opacity-70" />
              <span>Your QBanks</span>
            </Link>

            <Link
              href="/#qbanks"
              className={navTabClass(pathname === '/' && typeof window !== 'undefined' && window.location.hash === '#qbanks')}
            >
              <Layers className="h-3.5 w-3.5 opacity-70" />
              <span>All Question Banks</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsResultsModalOpen(true)}
              className={navTabClass(false)}
            >
              <BarChart3 className="h-3.5 w-3.5 opacity-70" />
              <span>Results & Time</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSupportModalOpen(true)}
              className={navTabClass(false)}
            >
              <HelpCircle className="h-3.5 w-3.5 opacity-70" />
              <span>Support</span>
            </button>
          </nav>

          {/* Right Action Profile / Auth */}
          <div className="flex items-center gap-3">
            {status === 'loading' ? (
              <div className="h-7 w-20 animate-pulse rounded-md bg-slate-100" />
            ) : session ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen(!profileOpen)}
                  aria-haspopup="menu"
                  aria-expanded={profileOpen}
                  className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white p-1 pl-2 text-slate-700 shadow-2xs transition-all hover:border-slate-300 hover:shadow-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600"
                >
                  <span className="text-xs font-medium text-slate-700 pr-1">
                    {session.user?.name?.split(' ')[0] || 'Profile'}
                  </span>
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold">
                    {session.user?.name?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase() || 'U'}
                  </span>
                  <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-800 shadow-xl py-1 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="border-b border-slate-100 px-4 py-3 bg-slate-50/70">
                      <p className="font-semibold text-xs text-slate-900 truncate">{session.user?.name || 'Medical Student'}</p>
                      <p className="truncate text-[11px] text-slate-500">{session.user?.email}</p>
                      {isAdmin && (
                        <span className="mt-1.5 inline-block font-mono text-[9px] uppercase tracking-wider font-bold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                          Super Admin
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setProfileOpen(false);
                        setIsProfileModalOpen(true);
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-xs font-medium hover:bg-slate-50 transition-colors cursor-pointer text-slate-700"
                    >
                      <User className="h-4 w-4 text-teal-600" /> My Profile & Details
                    </button>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setProfileOpen(false);
                        setIsResultsModalOpen(true);
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-xs font-medium hover:bg-slate-50 transition-colors cursor-pointer text-slate-700"
                    >
                      <BarChart3 className="h-4 w-4 text-teal-600" /> Results & Analytics
                    </button>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setProfileOpen(false);
                        setIsSupportModalOpen(true);
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-xs font-medium hover:bg-slate-50 transition-colors cursor-pointer text-slate-700"
                    >
                      <HelpCircle className="h-4 w-4 text-teal-600" /> Help & Support
                    </button>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        role="menuitem"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium hover:bg-slate-50 transition-colors text-amber-700"
                      >
                        <ShieldAlert className="h-4 w-4" /> Admin Ingestor
                      </Link>
                    )}

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setProfileOpen(false);
                        signOut({ callbackUrl: '/' });
                      }}
                      className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/login"
                  className="rounded-md px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="rounded-lg bg-teal-700 px-4 py-1.5 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-teal-800"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Modals */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        accuracy={38}
        answeredCount={13}
      />
      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />
      <ResultsModal
        isOpen={isResultsModalOpen}
        onClose={() => setIsResultsModalOpen(false)}
        accuracy={38}
        totalAnswered={13}
      />
    </>
  );
}
