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
      className={`flex items-center gap-4 px-5 py-3 transition-colors ${isActive ? 'bg-[#293c52] text-white border-l-4 border-blue-400 font-bold' : 'text-[#a1b0cb] hover:bg-[#202f41] hover:text-white border-l-4 border-transparent font-semibold'}`}
    >
      <Icon className="w-5 h-5" strokeWidth={2} />
      <span className="text-[14px]">{label}</span>
    </Link>
  );

  return (
    <div className="w-[260px] bg-[#172331] text-white flex flex-col h-[calc(100vh-64px)] overflow-y-auto shrink-0 font-sans sticky top-[64px] border-r border-[#101924]">
      
      {/* Top Profile / Selector Area */}
      <div className="p-4 border-b border-[#24354a]">
        <div className="flex items-center gap-3 cursor-pointer hover:bg-[#202f41] p-2 rounded transition-colors">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white shrink-0">
            <span className="text-sm font-bold">MQ</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-bold truncate">Micro Q Bank</div>
          </div>
          <ChevronDown className="w-4 h-4 text-[#a1b0cb] shrink-0" />
        </div>
      </div>

      <nav className="flex-1 py-4 flex flex-col">
        {/* Performance Accordion */}
        <div className="flex flex-col mb-1">
          <button 
            onClick={() => setIsPerformanceOpen(!isPerformanceOpen)}
            className={`flex items-center gap-4 px-5 py-3 transition-colors hover:bg-[#202f41] hover:text-white w-full text-left font-semibold border-l-4 ${isPerformanceOpen || pathname.includes('/performance') ? 'border-blue-400 bg-[#293c52] text-white' : 'border-transparent text-[#a1b0cb]'}`}
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
        <NavItem href={`/dashboard/${qbankSlug}/flashcards`} icon={FileBarChart} label="Flashcards" isActive={isActive(`/dashboard/${qbankSlug}/flashcards`)} />
        <NavItem href={`/dashboard/${qbankSlug}/notebook`} icon={Activity} label="My Notebook" isActive={isActive(`/dashboard/${qbankSlug}/notebook`)} />
        <NavItem href={`/dashboard/${qbankSlug}/notes`} icon={FileText} label="Notes" isActive={isActive(`/dashboard/${qbankSlug}/notes`)} />
        <NavItem href={`/dashboard/${qbankSlug}/search`} icon={Search} label="Search" isActive={isActive(`/dashboard/${qbankSlug}/search`)} />
        <NavItem href={`/dashboard/${qbankSlug}/help`} icon={PlusCircle} label="Help" isActive={isActive(`/dashboard/${qbankSlug}/help`)} />
      </nav>
    </div>
  );
}
