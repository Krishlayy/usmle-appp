import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import UnblockButton from './UnblockButton';
import UserTable from '../components/UserTable';

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

      <UserTable users={users} type="admin" />
    </div>
  );
}
