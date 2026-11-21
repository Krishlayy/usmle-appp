import React from 'react';
import { Card } from './Card';

export interface StatBlockProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: React.ReactNode;
}

export const StatBlock: React.FC<StatBlockProps> = ({ label, value, subValue, icon }) => {
  return (
    <Card elevation="subtle" className="flex h-full flex-col p-6">
      <div className="mb-3 flex items-start justify-between">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-400">{label}</h3>
        {icon && <div className="text-slate-500">{icon}</div>}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-3xl font-medium tabular-nums tracking-tight text-white">{value}</span>
        {subValue && <span className="text-sm text-slate-500">{subValue}</span>}
      </div>
    </Card>
  );
};