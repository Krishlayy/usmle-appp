import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import UnblockButton from './UnblockButton';
import { UserRoleButton } from '../components/UserRoleButton';
import { GrantAccessModal } from '../components/GrantAccessModal';
import { Users, Shield, GraduationCap, Search } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage(
  props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }
) {
  const searchParams = await props.searchParams;
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !['ADMIN', 'SUPERADMIN'].includes(session.user.role)) {
    redirect('/dashboard');
  }

  const search = typeof searchParams.search === 'string' ? searchParams.search.trim() : '';
  const roleFilter = typeof searchParams.role === 'string' ? searchParams.role : 'ALL';

  const whereClause: any = {};
  if (roleFilter !== 'ALL') {
    whereClause.role = roleFilter;
  }
  if (search) {
    whereClause.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { preferredName: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [users, qbanks, totalUsersCount, totalAdminsCount, totalStudentsCount] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { purchases: true, testSessions: true },
        },
        purchases: {
          select: { qbank: { select: { slug: true, title: true } } },
        },
      },
    }),
    prisma.qBank.findMany({
      where: { isActive: true },
      select: { id: true, title: true, slug: true },
      orderBy: { title: 'asc' },
    }),
    prisma.user.count(),
    prisma.user.count({ where: { role: { in: ['ADMIN', 'SUPERADMIN'] } } }),
    prisma.user.count({ where: { role: 'STUDENT' } }),
  ]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">User & Role Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage permissions, grant administrator status to registered team members, and license question banks.
          </p>
        </div>
        {session.user.role === 'SUPERADMIN' && (
          <Link
            href="/admin/users/new"
            className="inline-flex items-center gap-2 bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-800 transition-colors shadow-sm"
          >
            <Shield className="h-4 w-4" />
            + Create Admin Direct
          </Link>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/admin/users?role=ALL"
          className={`p-5 rounded-xl border transition-all ${
            roleFilter === 'ALL' ? 'border-teal-600 bg-teal-50/30 ring-1 ring-teal-600' : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-500">All Registered Accounts</span>
            <Users className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900">{totalUsersCount}</div>
        </Link>
        <Link
          href="/admin/users?role=STUDENT"
          className={`p-5 rounded-xl border transition-all ${
            roleFilter === 'STUDENT' ? 'border-teal-600 bg-teal-50/30 ring-1 ring-teal-600' : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-500">Candidate Students</span>
            <GraduationCap className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900">{totalStudentsCount}</div>
        </Link>
        <Link
          href="/admin/users?role=ADMIN"
          className={`p-5 rounded-xl border transition-all ${
            roleFilter === 'ADMIN' ? 'border-teal-600 bg-teal-50/30 ring-1 ring-teal-600' : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-500">Administrators</span>
            <Shield className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900">{totalAdminsCount}</div>
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <form method="GET" action="/admin/users" className="relative flex-1 w-full">
          {roleFilter !== 'ALL' && <input type="hidden" name="role" value={roleFilter} />}
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search candidate by name, email, or preferred name..."
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-teal-600"
          />
        </form>
        {search && (
          <Link
            href={`/admin/users${roleFilter !== 'ALL' ? `?role=${roleFilter}` : ''}`}
            className="text-xs font-mono text-slate-500 hover:text-slate-800"
          >
            Clear Search
          </Link>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-mono font-semibold text-slate-600 uppercase tracking-wider">
              <th className="p-4">Candidate / User</th>
              <th className="p-4">Role</th>
              <th className="p-4">Role Permission</th>
              <th className="p-4">Unlocked Banks</th>
              <th className="p-4">Test Sessions</th>
              <th className="p-4">Joined</th>
              <th className="p-4">License Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-4">
                  <div className="font-semibold text-slate-900">{user.preferredName || user.name || 'Unnamed Candidate'}</div>
                  <div className="text-xs text-slate-500 font-mono">{user.email}</div>
                  {user.medicalSchool && (
                    <div className="text-[11px] text-teal-700 mt-0.5">{user.medicalSchool} &bull; {user.targetExam || 'USMLE'}</div>
                  )}
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    user.role === 'SUPERADMIN'
                      ? 'bg-purple-100 text-purple-800'
                      : user.role === 'ADMIN'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4">
                  <UserRoleButton
                    userId={user.id}
                    currentRole={user.role}
                    userEmail={user.email}
                  />
                </td>
                <td className="p-4">
                  {user.role === 'ADMIN' || user.role === 'SUPERADMIN' ? (
                    <span className="text-xs font-mono text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      All Banks (Admin Bypass)
                    </span>
                  ) : user._count.purchases > 0 ? (
                    <span className="text-xs font-mono text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {user._count.purchases} Bank(s) Unlocked
                    </span>
                  ) : (
                    <span className="text-xs font-mono text-slate-400">0 Banks (Locked)</span>
                  )}
                </td>
                <td className="p-4 font-mono text-xs text-slate-600">
                  {user._count.testSessions}
                </td>
                <td className="p-4 text-xs text-slate-500 font-mono">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <GrantAccessModal
                      userId={user.id}
                      userEmail={user.email}
                      qbanks={qbanks}
                    />
                    {user.isBlocked && <UnblockButton userId={user.id} />}
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={7} className="p-10 text-center text-slate-500">
                  No users found matching current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
