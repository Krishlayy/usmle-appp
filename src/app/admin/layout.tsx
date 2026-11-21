import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AdminLogoutButton from '@/components/AdminLogoutButton';

// Admin pages read the DB per-request (auth + live data); never prerender them at build time.
export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !['ADMIN', 'SUPERADMIN'].includes(session.user.role)) {
    redirect('/dashboard');
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-white text-slate-800 flex-shrink-0 border-r border-slate-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center h-[72px]">
          <h2 className="text-sm font-black text-slate-900 tracking-[0.2em] uppercase">Admin</h2>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <a href="/admin" className="block px-4 py-2.5 rounded-lg hover:bg-slate-50 transition-colors text-[13px] font-bold text-slate-600 hover:text-slate-900">
            Dashboard Overview
          </a>
          <a href="/admin/qbanks" className="block px-4 py-2.5 rounded-lg hover:bg-slate-50 transition-colors text-[13px] font-bold text-slate-600 hover:text-slate-900">
            Manage QBanks
          </a>
          <a href="/admin/qbanks/upload" className="block px-4 py-2.5 rounded-lg bg-teal-50/70 text-teal-800 hover:bg-teal-100/70 transition-colors text-[13px] font-bold flex items-center justify-between border border-teal-200/50">
            <span>Upload QBank (.docx)</span>
            <span className="text-[10px] font-black uppercase tracking-wider bg-teal-600 text-white px-1.5 py-0.5 rounded">DOCX</span>
          </a>
          <a href="/admin/queue" className="block px-4 py-2.5 rounded-lg hover:bg-slate-50 transition-colors text-[13px] font-bold text-slate-600 hover:text-slate-900 flex items-center justify-between">
            <span>Review Queue</span>
          </a>
          <a href="/admin/students" className="block px-4 py-2.5 rounded-lg hover:bg-slate-50 transition-colors text-[13px] font-bold text-slate-600 hover:text-slate-900">
            Student Directory
          </a>
          <a href="/admin/users" className="block px-4 py-2.5 rounded-lg hover:bg-slate-50 transition-colors text-[13px] font-bold text-slate-600 hover:text-slate-900">
            User Directory
          </a>
          <a href="/admin/purchases" className="block px-4 py-2.5 rounded-lg hover:bg-slate-50 transition-colors text-[13px] font-bold text-slate-600 hover:text-slate-900">
            Purchases & Refunds
          </a>
        </nav>
        <div className="p-4 border-t border-slate-100 space-y-3 bg-slate-50/50">
          <Link href="/dashboard" className="block w-full px-4 py-2.5 text-center rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors text-[13px] font-bold text-slate-700 bg-white">
            Go to Dashboard
          </Link>
          <AdminLogoutButton />
        </div>
      </aside>

      {/* Admin Main Content */}
      <main className="flex-1 overflow-auto bg-slate-50 p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
