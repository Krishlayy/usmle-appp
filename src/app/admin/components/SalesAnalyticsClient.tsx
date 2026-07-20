'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

export function SalesAnalyticsClient({ 
  revenueData, 
  qbankData 
}: { 
  revenueData: { date: string, revenue: number, subscriptions: number }[],
  qbankData: { name: string, sales: number }[]
}) {
  return (
    <div className="space-y-8 mt-12">
      <h2 className="text-2xl font-bold text-slate-800 border-b pb-4">Advanced Sales Analytics</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Revenue Over Time */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">Revenue Over Time (Past 30 Days)</h3>
          <div className="h-[300px] w-full">
            {revenueData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-slate-400">No revenue data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{fill: '#64748b', fontSize: 12}} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    tick={{fill: '#64748b', fontSize: 12}} 
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Popular QBanks */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">Sales by QBank</h3>
          <div className="h-[300px] w-full">
            {qbankData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-slate-400">No sales data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={qbankData} layout="vertical" margin={{ top: 0, right: 0, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={false} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={{fill: '#475569', fontSize: 12, fontWeight: 600}} 
                    tickLine={false}
                    axisLine={false}
                    width={100}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    cursor={{fill: '#f8fafc'}}
                  />
                  <Bar dataKey="sales" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}
