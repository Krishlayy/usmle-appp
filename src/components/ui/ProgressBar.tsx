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
    <div className={`flex w-full flex-col gap-2 ${className}`}>
      {(label || showPercentage) && (
        <div className="flex items-end justify-between text-xs">
          {label && <span className="text-slate-700">{label}</span>}
          {showPercentage && <span className="font-mono tabular-nums text-slate-500">{Math.round(progress)}%</span>}
        </div>
      )}
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
        aria-valuenow={Math.round(Math.max(0, Math.min(100, progress)))}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progress'}
      >
        <div
          className={`h-full rounded-full bg-teal-600 transition-[width] duration-700 ease-out ${barClassName}`}
          style={{ width: `${fill}%` }}
        />
      </div>
    </div>
  );
};