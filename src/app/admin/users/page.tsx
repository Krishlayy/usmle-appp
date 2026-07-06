import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import RoleSelector from './RoleSelector';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const users = await prisma.user.findMany({
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
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-600 uppercase tracking-wider">
              <th className="p-4">Name / Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Joined</th>
              <th className="p-4">Purchases</th>
              <th className="p-4">Sessions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <div className="font-semibold text-slate-900">{user.name || 'No Name'}</div>
                  <div className="text-sm text-slate-500">{user.email}</div>
                </td>
                <td className="p-4">
                  <RoleSelector 
                    userId={user.id} 
                    currentRole={user.role} 
                    disabled={user.id === session.user.id} 
                  />
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
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">
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
