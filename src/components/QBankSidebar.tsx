'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { History, FileText, ChevronDown, PieChart, HelpCircle } from 'lucide-react';

interface QBankSidebarProps {
  qbankSlug: string;
}

const focusRing = 'focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-teal-600';

export function QBankSidebar({ qbankSlug }: QBankSidebarProps) {
  const pathname = usePathname();
  const [isPerformanceOpen, setIsPerformanceOpen] = useState(pathname.includes('/performance'));

  if (pathname.includes('/test/') || pathname.includes('/session/')) {
    return null;
  }

  const isActive = (path: string) => pathname === path;

  const NavItem = ({ href, icon: Icon, label, isActive }: { href: string, icon: any, label: string, isActive: boolean }) => (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={`flex items-center gap-3 border-l px-5 py-3 text-sm transition-colors ${focusRing} ${isActive ? 'border-teal-600 bg-white text-slate-900' : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
    >
      <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
      <span>{label}</span>
    </Link>
  );

  const subLink = (path: string) =>
    `block py-2 pl-12 pr-4 text-[13px] transition-colors hover:text-slate-900 ${focusRing} ${isActive(path) ? 'text-slate-900' : 'text-slate-500'}`;

  return (
    <aside
      aria-label="Question bank navigation"
      className="sticky top-14 flex h-[calc(100vh-56px)] w-[240px] shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-slate-100 text-slate-800 backdrop-blur-xl"
    >
      <div className="border-b border-slate-200 px-5 py-4">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-teal-700">
          Q-Bank Navigation
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 pb-4 pt-4">
        <div className="flex flex-col">
          <button
            type="button"
            onClick={() => setIsPerformanceOpen(!isPerformanceOpen)}
            aria-expanded={isPerformanceOpen}
            className={`flex w-full items-center gap-3 border-l px-5 py-3 text-left text-sm transition-colors hover:bg-slate-50 hover:text-slate-900 ${focusRing} ${pathname.includes('/performance') ? 'border-teal-600 text-slate-900' : 'border-transparent text-slate-600'}`}
          >
            <PieChart className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            <span className="flex-1">Performance</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isPerformanceOpen ? 'rotate-180' : ''}`} aria-hidden />
          </button>

          <div className={`overflow-hidden transition-all duration-200 ${isPerformanceOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`} hidden={!isPerformanceOpen}>
            <div className="flex flex-col py-1">
              <Link href={`/dashboard/${qbankSlug}/performance`} className={subLink(`/dashboard/${qbankSlug}/performance`)}>Overall</Link>
              <Link href={`/dashboard/${qbankSlug}/performance/reports`} className={subLink(`/dashboard/${qbankSlug}/performance/reports`)}>Reports</Link>
              <Link href={`/dashboard/${qbankSlug}/performance/graphs`} className={subLink(`/dashboard/${qbankSlug}/performance/graphs`)}>Graphs</Link>
            </div>
          </div>
        </div>

        <NavItem href={`/dashboard/${qbankSlug}`} icon={FileText} label="Create Test" isActive={isActive(`/dashboard/${qbankSlug}`)} />
        <NavItem href={`/dashboard/${qbankSlug}/previous`} icon={History} label="Previous Tests" isActive={isActive(`/dashboard/${qbankSlug}/previous`)} />
        <NavItem href={`/dashboard/${qbankSlug}/notes`} icon={FileText} label="Notes" isActive={isActive(`/dashboard/${qbankSlug}/notes`)} />
        <NavItem href={`/dashboard/${qbankSlug}/help`} icon={HelpCircle} label="Help" isActive={isActive(`/dashboard/${qbankSlug}/help`)} />
      </nav>
    </aside>
  );
}