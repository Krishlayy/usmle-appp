import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0 border-r border-slate-700 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-lg font-bold text-slate-100 uppercase tracking-widest">Admin Control</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <a href="/admin" className="block px-4 py-3 rounded-md hover:bg-slate-800 transition-colors text-sm font-medium text-slate-300 hover:text-white">
            Dashboard Overview
          </a>
          <a href="/admin/qbanks" className="block px-4 py-3 rounded-md hover:bg-slate-800 transition-colors text-sm font-medium text-slate-300 hover:text-white">
            Manage QBanks
          </a>
          <a href="/admin/users" className="block px-4 py-3 rounded-md hover:bg-slate-800 transition-colors text-sm font-medium text-slate-300 hover:text-white">
            User Directory
          </a>
          <a href="/admin/purchases" className="block px-4 py-3 rounded-md hover:bg-slate-800 transition-colors text-sm font-medium text-slate-300 hover:text-white">
            Purchases & Refunds
          </a>
        </nav>
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
