import { prisma } from '@/lib/db';
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export default async function AdminQBanksPage() {
  const session = await getServerSession(authOptions);
  const isSuperadmin = session?.user?.role === 'SUPERADMIN';

  const qbanks = await prisma.qBank.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { questions: true, purchases: true }
      },
      lastEditedBy: { select: { name: true, email: true } }
    }
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Manage QBanks</h1>
        <Link href="/admin/qbanks/new" className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors shadow-sm">
          + Create New QBank
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-600 uppercase tracking-wider">
              <th className="p-4">Title</th>
              <th className="p-4">Status</th>
              <th className="p-4">Price</th>
              <th className="p-4">Questions</th>
              <th className="p-4">Sales</th>
              <th className="p-4">Last Edited</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {qbanks.map((qbank) => (
              <tr key={qbank.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <div className="font-bold text-slate-900">{qbank.title}</div>
                  <div className="text-sm text-slate-500">{qbank.specialtyTag}</div>
                </td>
                <td className="p-4">
                  {qbank.isActive ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                      Draft
                    </span>
                  )}
                </td>
                <td className="p-4 font-medium text-slate-900">
                  ${(qbank.price / 100).toFixed(2)}
                </td>
                <td className="p-4 text-slate-600">
                  {qbank._count.questions} / {qbank.totalQuestions}
                </td>
                <td className="p-4 text-slate-600">
                  {qbank._count.purchases}
                </td>
                <td className="p-4 text-slate-600 text-sm">
                  {qbank.lastEditedBy ? (
                    <div>
                      <div>{qbank.lastEditedBy.name || qbank.lastEditedBy.email}</div>
                      <div className="text-xs text-slate-400">{qbank.lastEditedAt?.toLocaleDateString()}</div>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">None</span>
                  )}
                </td>
                <td className="p-4 text-right">
                  <Link href={`/admin/qbanks/${qbank.id}/edit`} className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                    Edit &rarr;
                  </Link>
                </td>
              </tr>
            ))}
            
            {qbanks.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  No Question Banks found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
