'use client';
import React, { useEffect, useState } from 'react';

export interface ProgressBarProps {
  progress: number; // 0 to 100
  label?: string;
  showPercentage?: boolean;
  className?: string;
  barClassName?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  label,
  showPercentage = false,
  className = '',
  barClassName = ''
}) => {
  const [fill, setFill] = useState(0);

  useEffect(() => {
    // Animate fill on mount
    const timer = setTimeout(() => {
      setFill(Math.max(0, Math.min(100, progress)));
    }, 50);
    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <div className={`w-full flex flex-col gap-2 ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-end text-[13px]">
          {label && <span className="font-semibold text-primary">{label}</span>}
          {showPercentage && <span className="font-medium text-secondary">{Math.round(progress)}%</span>}
        </div>
      )}
      <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
        <div 
          className={`bg-[#2563EB] h-full rounded-full transition-all duration-700 ease-out ${barClassName}`}
          style={{ width: `${fill}%` }}
        />
      </div>
    </div>
  );
};
