'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type DataPoint = {
  name: string;
  accuracy: number;
};

export function PerformanceChart({ data }: { data: DataPoint[] }) {
  if (data.length === 0) {
    return <div className="text-secondary text-sm py-10 text-center flex h-full items-center justify-center">Not enough data to display. Complete some tests first!</div>;
  }

  return (
    <div className="w-full h-full min-h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 10, bottom: 25 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12, fill: '#64748B' }} 
            tickLine={false}
            axisLine={{ stroke: '#E5E7EB' }}
            dy={10}
          />
          <YAxis 
            type="number"
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: '#64748B' }} 
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}%`}
            dx={-10}
          />
          <Tooltip 
            cursor={{ fill: 'transparent' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(value: number) => [`${value.toFixed(1)}%`, 'Accuracy']}
            labelStyle={{ color: '#0f172a', fontWeight: 'bold', marginBottom: '4px' }}
          />
          <Line 
            type="monotone" 
            dataKey="accuracy" 
            stroke="#2563EB" 
            strokeWidth={3}
            dot={{ r: 4, fill: '#2563EB', strokeWidth: 2, stroke: '#FFFFFF' }}
            activeDot={{ r: 6, fill: '#1E40AF', strokeWidth: 2, stroke: '#FFFFFF' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
