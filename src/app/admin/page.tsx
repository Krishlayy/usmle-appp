import { prisma } from '@/lib/db';

export default async function AdminDashboardPage() {
  const userCount = await prisma.user.count();
  const qbankCount = await prisma.qBank.count();
  const purchaseCount = await prisma.purchase.count({ where: { status: 'active' } });
  
  const purchases = await prisma.purchase.findMany({
    where: { status: 'active' },
    select: { amountPaidCents: true, purchasedAt: true, qbankId: true, qbank: { select: { title: true } } },
  });
  
  const totalRevenueCents = purchases.reduce((sum, p) => sum + p.amountPaidCents, 0);

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const recentPurchases = purchases.filter(p => p.purchasedAt >= oneWeekAgo).length;

  const qbankSales: Record<string, { title: string, count: number }> = {};
  purchases.forEach(p => {
    if (!qbankSales[p.qbankId]) {
      qbankSales[p.qbankId] = { title: p.qbank.title, count: 0 };
    }
    qbankSales[p.qbankId].count++;
  });

  let topSellingQbank = 'None';
  let maxSales = 0;
  Object.values(qbankSales).forEach(q => {
    if (q.count > maxSales) {
      maxSales = q.count;
      topSellingQbank = q.title;
    }
  });

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Platform Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Total Users</span>
          <span className="text-4xl font-extrabold text-slate-900">{userCount}</span>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Active QBanks</span>
          <span className="text-4xl font-extrabold text-blue-600">{qbankCount}</span>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Total Sales</span>
          <span className="text-4xl font-extrabold text-emerald-600">{purchaseCount}</span>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Revenue (USD)</span>
          <span className="text-4xl font-extrabold text-slate-900">${(totalRevenueCents / 100).toFixed(2)}</span>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Purchases (7d)</span>
          <span className="text-4xl font-extrabold text-slate-900">{recentPurchases}</span>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:col-span-2 lg:col-span-1">
          <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Top Selling</span>
          <span className="text-2xl font-bold text-slate-900 truncate" title={topSellingQbank}>{topSellingQbank}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
        </div>
        <div className="p-8 text-center text-slate-500">
          No recent activity to display.
        </div>
      </div>
    </div>
  );
}
