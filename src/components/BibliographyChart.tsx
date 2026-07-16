'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type DataPoint = {
  tag: string;
  accuracy: number;
};

export function BibliographyChart({ data }: { data: DataPoint[] }) {
  if (data.length === 0) {
    return <div className="text-gray-500 text-sm py-10 text-center">Not enough data to display. Complete some questions first!</div>;
  }

  // Calculate height dynamically based on number of tags to ensure bars don't get squished
  const chartHeight = Math.max(250, data.length * 45);

  return (
    <div className="w-full" style={{ height: `${chartHeight}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
          <XAxis 
            type="number"
            tick={{ fontSize: 12, fill: '#6b7280' }} 
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}%`}
            domain={[0, 100]}
          />
          <YAxis 
            type="category"
            dataKey="tag" 
            tick={{ fontSize: 12, fill: '#6b7280' }} 
            tickLine={false}
            axisLine={false}
            width={120} // fixed width for long tags
          />
          <Tooltip 
            cursor={{ fill: '#f3f4f6' }}
            contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}
            formatter={(value) => [`${value}%`, 'Accuracy']}
          />
          <Bar 
            dataKey="accuracy" 
            fill="#10b981" // Emerald green for tags
            radius={[0, 4, 4, 0]} 
            barSize={20}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
