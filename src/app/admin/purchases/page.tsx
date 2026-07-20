import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import RefundToggle from './RefundToggle';

import PurchaseSearch from './PurchaseSearch';
import UnblockButton from '../users/UnblockButton';

export const dynamic = 'force-dynamic';

export default async function AdminPurchasesPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !['ADMIN', 'SUPERADMIN'].includes(session.user.role)) {
    redirect('/dashboard');
  }

  const search = typeof searchParams.search === 'string' ? searchParams.search : '';
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : 'date_desc';

  let orderBy: any = { purchasedAt: 'desc' };
  if (sort === 'date_asc') orderBy = { purchasedAt: 'asc' };
  if (sort === 'name_asc') orderBy = { user: { name: 'asc' } };
  if (sort === 'name_desc') orderBy = { user: { name: 'desc' } };

  const purchases = await prisma.purchase.findMany({
    where: search ? {
      OR: [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ]
    } : undefined,
    orderBy,
    include: {
      user: { select: { id: true, name: true, email: true, isBlocked: true } },
      qbank: { select: { title: true } },
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Purchases & Refunds</h1>
      </div>
      
      <PurchaseSearch />

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-600 uppercase tracking-wider">
              <th className="p-4">User</th>
              <th className="p-4">QBank</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Date</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {purchases.map((purchase) => (
              <tr key={purchase.id} className={`hover:bg-slate-50 transition-colors ${purchase.status === 'refunded' ? 'bg-red-50/50' : ''}`}>
                <td className="p-4">
                  <div className="font-semibold text-slate-900">{purchase.user.name || 'No Name'}</div>
                  <div className="text-sm text-slate-500">{purchase.user.email}</div>
                </td>
                <td className="p-4 text-slate-900 font-medium">
                  {purchase.qbank.title}
                </td>
                <td className="p-4 text-slate-600 font-mono">
                  ${(purchase.amountPaidCents / 100).toFixed(2)}
                </td>
                <td className="p-4 text-slate-600">
                  {new Date(purchase.purchasedAt).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    purchase.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {purchase.status.toUpperCase()}
                  </span>
                </td>
                <td className="p-4 text-slate-600">
                  <div className="flex gap-2 items-center">
                    <RefundToggle purchaseId={purchase.id} currentStatus={purchase.status} />
                    {purchase.user.isBlocked && <UnblockButton userId={purchase.user.id} />}
                  </div>
                </td>
              </tr>
            ))}
            {purchases.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
                  No purchases found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
