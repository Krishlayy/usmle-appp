'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type DataPoint = {
  subtopic: string;
  accuracy: number;
};

export function SubtopicChart({ data }: { data: DataPoint[] }) {
  if (data.length === 0) {
    return <div className="text-gray-500 text-sm py-10 text-center">Not enough data to display. Complete some questions first!</div>;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis 
            dataKey="subtopic" 
            tick={{ fontSize: 12, fill: '#6b7280' }} 
            tickLine={false}
            axisLine={false}
            dy={10}
            angle={-15}
            textAnchor="end"
            height={50}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#6b7280' }} 
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}%`}
            domain={[0, 100]}
          />
          <Tooltip 
            cursor={{ fill: '#f3f4f6' }}
            contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}
            formatter={(value) => [`${value}%`, 'Accuracy']}
          />
          <Bar 
            dataKey="accuracy" 
            fill="#2563eb" 
            radius={[4, 4, 0, 0]} 
            barSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
