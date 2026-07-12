'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface QBankSidebarProps {
  qbankSlug: string;
}

export function QBankSidebar({ qbankSlug }: QBankSidebarProps) {
  const pathname = usePathname();
  const [isPerformanceOpen, setIsPerformanceOpen] = useState(pathname.includes('/performance'));

  // Hide sidebar on the actual test player and results screens
  if (pathname.includes('/test/') || pathname.includes('/session/')) {
    return null;
  }

  const isActive = (path: string) => pathname === path;

  return (
    <div className="w-64 bg-[#2b3e50] text-slate-300 flex flex-col h-[calc(100vh-64px)] overflow-y-auto shrink-0 font-sans sticky top-[64px]">
      <div className="p-4 flex items-center gap-3 text-white border-b border-[#3b4e60]">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"></path></svg>
        <h2 className="text-xl font-bold tracking-wide">QBank</h2>
        <svg className="w-4 h-4 ml-auto text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>

      <nav className="flex-1 py-4 flex flex-col gap-1">
        <Link 
          href={`/dashboard/${qbankSlug}`}
          className={`flex items-center gap-3 px-6 py-2.5 transition-colors ${isActive(`/dashboard/${qbankSlug}`) ? 'bg-[#1e2e3d] text-white border-l-4 border-blue-400 pl-5' : 'hover:bg-[#34495e] hover:text-white pl-6'}`}
        >
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
          <span className="text-[15px] font-medium">Create Test</span>
        </Link>

        <Link 
          href={`/dashboard/${qbankSlug}/previous`}
          className={`flex items-center gap-3 px-6 py-2.5 transition-colors ${isActive(`/dashboard/${qbankSlug}/previous`) ? 'bg-[#1e2e3d] text-white border-l-4 border-blue-400 pl-5' : 'hover:bg-[#34495e] hover:text-white pl-6'}`}
        >
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
          <span className="text-[15px] font-medium">Previous Tests</span>
        </Link>

        {/* Performance Accordion */}
        <div className="flex flex-col mt-2">
          <button 
            onClick={() => setIsPerformanceOpen(!isPerformanceOpen)}
            className={`flex items-center gap-3 px-6 py-2.5 transition-colors hover:bg-[#34495e] hover:text-white pl-6 text-[15px] font-medium w-full text-left`}
          >
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            <span>Performance</span>
            <svg className={`w-4 h-4 ml-auto transition-transform ${isPerformanceOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>
          
          <div className={`overflow-hidden transition-all duration-200 ${isPerformanceOpen ? 'max-h-40' : 'max-h-0'}`}>
            <Link 
              href={`/dashboard/${qbankSlug}/performance`}
              className={`flex items-center gap-3 px-12 py-2 transition-colors ${isActive(`/dashboard/${qbankSlug}/performance`) ? 'text-white font-bold' : 'text-slate-400 hover:text-white'} text-[14px]`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
              <span>Overall</span>
            </Link>
            <Link 
              href={`/dashboard/${qbankSlug}/performance/reports`}
              className={`flex items-center gap-3 px-12 py-2 transition-colors ${isActive(`/dashboard/${qbankSlug}/performance/reports`) ? 'text-white font-bold' : 'text-slate-400 hover:text-white'} text-[14px]`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path></svg>
              <span>Reports</span>
            </Link>
            <Link 
              href={`/dashboard/${qbankSlug}/performance/graphs`}
              className={`flex items-center gap-3 px-12 py-2 transition-colors ${isActive(`/dashboard/${qbankSlug}/performance/graphs`) ? 'text-white font-bold' : 'text-slate-400 hover:text-white'} text-[14px]`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path></svg>
              <span>Graphs</span>
            </Link>
          </div>
        </div>

        <Link 
          href={`/dashboard/${qbankSlug}/search`}
          className={`flex items-center gap-3 px-6 py-2.5 mt-2 transition-colors ${isActive(`/dashboard/${qbankSlug}/search`) ? 'bg-[#1e2e3d] text-white border-l-4 border-blue-400 pl-5' : 'hover:bg-[#34495e] hover:text-white pl-6'}`}
        >
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <span className="text-[15px] font-medium">Search</span>
        </Link>
        <Link 
          href={`/dashboard/${qbankSlug}/notes`}
          className={`flex items-center gap-3 px-6 py-2.5 transition-colors ${isActive(`/dashboard/${qbankSlug}/notes`) ? 'bg-[#1e2e3d] text-white border-l-4 border-blue-400 pl-5' : 'hover:bg-[#34495e] hover:text-white pl-6'}`}
        >
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          <span className="text-[15px] font-medium">Notes</span>
        </Link>
      </nav>
    </div>
  );
}
