import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import UnblockButton from '../users/UnblockButton';
import PurchaseSearch from '../purchases/PurchaseSearch';

export const dynamic = 'force-dynamic';

export default async function AdminStudentsPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !['ADMIN', 'SUPERADMIN'].includes(session.user.role)) {
    redirect('/dashboard');
  }

  const search = typeof searchParams.search === 'string' ? searchParams.search : '';
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : 'date_desc';

  let orderBy: any = { createdAt: 'desc' };
  if (sort === 'date_asc') orderBy = { createdAt: 'asc' };
  if (sort === 'name_asc') orderBy = { name: 'asc' };
  if (sort === 'name_desc') orderBy = { name: 'desc' };

  const students = await prisma.user.findMany({
    where: {
      role: 'STUDENT',
      ...(search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ]
      } : {})
    },
    orderBy,
    include: {
      _count: {
        select: { purchases: true, testSessions: true },
      },
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Student Directory</h1>
      </div>

      <PurchaseSearch />

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-600 uppercase tracking-wider">
              <th className="p-4">Name / Email</th>
              <th className="p-4">Joined</th>
              <th className="p-4">Purchases</th>
              <th className="p-4">Sessions</th>
              <th className="p-4">Security</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <div className="font-semibold text-slate-900">{student.name || 'No Name'}</div>
                  <div className="text-sm text-slate-500">{student.email}</div>
                </td>
                <td className="p-4 text-slate-600">
                  {new Date(student.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4 text-slate-600">
                  {student._count.purchases}
                </td>
                <td className="p-4 text-slate-600">
                  {student._count.testSessions}
                </td>
                <td className="p-4">
                  <div className="flex flex-col gap-2 items-start">
                    {student.securityViolations > 0 && (
                      <span className="text-xs font-semibold bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        {student.securityViolations} Violations
                      </span>
                    )}
                    {student.isBlocked && <UnblockButton userId={student.id} />}
                    {!student.isBlocked && student.securityViolations === 0 && (
                      <span className="text-xs text-slate-400">Clean</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
