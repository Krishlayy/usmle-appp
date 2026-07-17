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
    <Card elevation="subtle" className="p-6">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-[14px] font-medium text-secondary">{label}</h3>
        {icon && <div className="text-muted">{icon}</div>}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-[28px] font-bold text-primary tracking-tight">{value}</span>
        {subValue && <span className="text-[14px] font-medium text-muted">{subValue}</span>}
      </div>
    </Card>
  );
};
