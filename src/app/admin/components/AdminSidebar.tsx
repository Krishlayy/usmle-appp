'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  UploadCloud,
  ClipboardCheck,
  GraduationCap,
  Users,
  CreditCard,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import AdminLogoutButton from '@/components/AdminLogoutButton';

const NAV_ITEMS = [
  { label: 'Dashboard Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Manage QBanks', href: '/admin/qbanks', icon: BookOpen },
  {
    label: 'Upload & Ingest QBank',
    href: '/admin/qbanks/upload',
    icon: UploadCloud,
    badge: 'DOCX + Videos',
  },
  { label: 'Review Queue', href: '/admin/queue', icon: ClipboardCheck },
  { label: 'Student Directory', href: '/admin/students', icon: GraduationCap },
  { label: 'User Directory', href: '/admin/users', icon: Users },
  { label: 'Purchases & Refunds', href: '/admin/purchases', icon: CreditCard },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white text-slate-800 flex-shrink-0 border-r border-slate-200 hidden md:flex flex-col select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between h-16">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-teal-700 text-white shadow-xs">
            <span className="font-mono text-sm font-bold">M</span>
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900 tracking-wider uppercase font-mono">
              Admin Portal
            </h2>
            <span className="font-mono text-[9px] uppercase tracking-widest text-teal-700 font-semibold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse"></span>
              Clinical Board Suite
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-teal-50 text-teal-900 border border-teal-200/80 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`h-4 w-4 ${
                    isActive ? 'text-teal-700' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[9.5px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded font-bold ${
                    isActive
                      ? 'bg-teal-600 text-white'
                      : 'bg-teal-50 text-teal-700 border border-teal-200'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-100 space-y-2 bg-slate-50/50">
        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-xs font-bold text-slate-700 shadow-2xs"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-slate-500" />
          <span>Exit to Student Dashboard</span>
        </Link>
        <AdminLogoutButton />
      </div>
    </aside>
  );
}
