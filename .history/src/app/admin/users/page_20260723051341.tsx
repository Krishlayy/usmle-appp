import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import UnblockButton from './UnblockButton';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !['ADMIN', 'SUPERADMIN'].includes(session.user.role)) {
    redirect('/dashboard');
  }

  const users = await prisma.user.findMany({
    where: {
      role: { in: ['ADMIN', 'SUPERADMIN'] }
    },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { purchases: true, testSessions: true },
      },
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">User Directory</h1>
        {session.user.role === 'SUPERADMIN' && (
          <Link href="/admin/users/new" className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors shadow-sm">
            + Create Admin
          </Link>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-600 uppercase tracking-wider">
              <th className='p-4'>S.No</th>
              <th className='p-4'>ID</th>
              <th className="p-4">Name / Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Joined</th>
              <th className="p-4">Purchases</th>
              <th className="p-4">Sessions</th>
              <th className="p-4">Security</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user, index) => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-slate-600">
                  {index + 1}
                </td>
                <td className="p-4">
                  <span >
                    {user?.user_id}
                  </span>
                </td>
                <td className="p-4">
                  <div className="font-semibold text-slate-900">{user.name || 'No Name'}</div>
                  <div className="text-sm text-slate-500">{user.email}</div>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    user.role === 'SUPERADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4 text-slate-600">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4 text-slate-600">
                  {user._count.purchases}
                </td>
                <td className="p-4 text-slate-600">
                  {user._count.testSessions}
                </td>
                <td className="p-4">
                  <div className="flex flex-col gap-2 items-start">
                    {user.securityViolations > 0 && (
                      <span className="text-xs font-semibold bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        {user.securityViolations} Violations
                      </span>
                    )}
                    {user.isBlocked && <UnblockButton userId={user.id} />}
                    {!user.isBlocked && user.securityViolations === 0 && (
                      <span className="text-xs text-slate-400">Clean</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
