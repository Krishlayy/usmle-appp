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
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#F3F4F6" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12, fill: '#94A3B8' }} 
            tickLine={false}
            axisLine={{ stroke: '#F3F4F6' }}
            dy={10}
          />
          <YAxis 
            type="number"
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: '#94A3B8' }} 
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}%`}
            dx={-10}
          />
          <Tooltip 
            cursor={{ fill: 'transparent' }}
            contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px -2px rgba(0,0,0,0.05)' }}
            formatter={(value: number) => [`${value.toFixed(1)}%`, 'Accuracy']}
            labelStyle={{ color: '#14161A', fontWeight: '600', marginBottom: '4px' }}
          />
          <Line 
            type="monotone" 
            dataKey="accuracy" 
            stroke="#0D9488" 
            strokeWidth={2}
            dot={{ r: 3, fill: '#0D9488', strokeWidth: 2, stroke: '#FFFFFF' }}
            activeDot={{ r: 5, fill: '#0F766E', strokeWidth: 2, stroke: '#FFFFFF' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
