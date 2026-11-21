'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { PlusCircle, History, BarChart2, Search, FileText, ChevronDown, ChevronRight, Activity, FileBarChart, PieChart } from 'lucide-react';

interface QBankSidebarProps {
  qbankSlug: string;
}

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
      className={`flex items-center gap-3 px-5 py-3.5 transition-colors ${isActive ? 'bg-[#293c52] text-white border-l-4 border-blue-400 font-bold' : 'text-[#a1b0cb] hover:bg-[#202f41] hover:text-white border-l-4 border-transparent font-semibold'}`}
    >
      <Icon className="w-5 h-5" strokeWidth={2} />
      <span className="text-[14px]">{label}</span>
    </Link>
  );

  return (
    <div className="w-[240px] bg-[#0f172a] text-slate-200 flex flex-col h-[calc(100vh-64px)] overflow-y-auto shrink-0 font-sans sticky top-[64px] border-r border-slate-800">
      
      {/* Top QBank Section Label */}
      <div className="px-5 py-4 border-b border-slate-800/80">
        <span className="text-[11px] font-bold tracking-wider uppercase text-teal-400 font-mono">
          Q-Bank Navigation
        </span>
      </div>

      <nav className="flex-1 pt-6 pb-4 flex flex-col gap-1">
        {/* Performance Accordion */}
        <div className="flex flex-col mb-1">
          <button 
            onClick={() => setIsPerformanceOpen(!isPerformanceOpen)}
            className={`flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-[#202f41] hover:text-white w-full text-left font-semibold border-l-4 ${isPerformanceOpen || pathname.includes('/performance') ? 'border-blue-400 bg-[#293c52] text-white' : 'border-transparent text-[#a1b0cb]'}`}
          >
            <PieChart className="w-5 h-5" strokeWidth={2} />
            <span className="text-[14px] flex-1">Performance</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isPerformanceOpen ? 'rotate-180' : ''}`} />
          </button>
          
          <div className={`overflow-hidden transition-all duration-200 bg-[#121c27] ${isPerformanceOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="flex flex-col py-2">
              <Link href={`/dashboard/${qbankSlug}/performance`} className={`pl-14 pr-4 py-2 text-[13px] hover:text-white transition-colors ${isActive(`/dashboard/${qbankSlug}/performance`) ? 'text-white font-bold' : 'text-[#a1b0cb]'}`}>Overall</Link>
              <Link href={`/dashboard/${qbankSlug}/performance/reports`} className={`pl-14 pr-4 py-2 text-[13px] hover:text-white transition-colors ${isActive(`/dashboard/${qbankSlug}/performance/reports`) ? 'text-white font-bold' : 'text-[#a1b0cb]'}`}>Reports</Link>
              <Link href={`/dashboard/${qbankSlug}/performance/graphs`} className={`pl-14 pr-4 py-2 text-[13px] hover:text-white transition-colors ${isActive(`/dashboard/${qbankSlug}/performance/graphs`) ? 'text-white font-bold' : 'text-[#a1b0cb]'}`}>Graphs</Link>
            </div>
          </div>
        </div>

        <NavItem href={`/dashboard/${qbankSlug}`} icon={FileText} label="Create Test" isActive={isActive(`/dashboard/${qbankSlug}`)} />
        <NavItem href={`/dashboard/${qbankSlug}/previous`} icon={History} label="Previous Tests" isActive={isActive(`/dashboard/${qbankSlug}/previous`)} />
        <NavItem href={`/dashboard/${qbankSlug}/notes`} icon={FileText} label="Notes" isActive={isActive(`/dashboard/${qbankSlug}/notes`)} />
        <NavItem href={`/dashboard/${qbankSlug}/help`} icon={PlusCircle} label="Help" isActive={isActive(`/dashboard/${qbankSlug}/help`)} />
      </nav>
    </div>
  );
}
