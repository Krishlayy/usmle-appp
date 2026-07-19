import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AdminLogoutButton from '@/components/AdminLogoutButton';

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
