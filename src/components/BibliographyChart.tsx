'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type DataPoint = {
  tag: string;
  accuracy: number;
};

export function BibliographyChart({ data }: { data: DataPoint[] }) {
  if (data.length === 0) {
    return <div className="text-secondary text-sm py-10 text-center flex h-full items-center justify-center">Not enough data to display. Complete some questions first!</div>;
  }

  // Only show the top 10 tags to keep the dashboard card compact and readable
  const chartData = data.slice(0, 10);

  return (
    <div className="w-full h-full min-h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
          <XAxis 
            type="number"
            tick={{ fontSize: 12, fill: '#64748B' }} 
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}%`}
            domain={[0, 100]}
          />
          <YAxis 
            type="category"
            dataKey="tag" 
            tick={{ fontSize: 12, fill: '#64748B' }} 
            tickLine={false}
            axisLine={false}
            width={140}
            tickFormatter={(value) => value.length > 20 ? `${value.substring(0, 18)}...` : value}
          />
          <Tooltip 
            cursor={{ fill: '#F8FAFC' }}
            contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
            formatter={(value) => [`${value}%`, 'Accuracy']}
          />
          <Bar 
            dataKey="accuracy" 
            fill="#10B981" // Emerald green to contrast with the blue subtopics
            radius={[0, 4, 4, 0]} 
            barSize={16}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
