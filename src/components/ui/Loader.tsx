import React from 'react';

export interface LoaderProps {
  size?: 'sm' | 'lg';
  className?: string;
}

export const Loader: React.FC<LoaderProps> = ({ size = 'sm', className = '' }) => {
  const sizeClasses = size === 'sm' ? 'w-10 h-10' : 'w-32 h-32';
  
  return (
    <div className={`inline-flex items-center justify-center text-accent ${sizeClasses} ${className}`}>
      <svg viewBox="0 0 120 120" className="w-full h-full">
        <path
          d="M15,85 C30,55 40,95 55,60 C65,38 75,80 90,45 C98,28 100,50 105,35"
          fill="none"
          stroke="currentColor"
          strokeWidth={size === 'sm' ? 8 : 4}
          strokeLinecap="round"
          strokeDasharray="220"
          strokeDashoffset="220"
        >
          <animate
            attributeName="stroke-dashoffset"
            values="220;0;0;220"
            keyTimes="0;0.55;0.85;1"
            dur="2.2s"
            repeatCount="indefinite"
          />
        </path>
        <circle r={size === 'sm' ? 8 : 4} fill="currentColor">
          <animateMotion
            dur="2.2s"
            repeatCount="indefinite"
            path="M15,85 C30,55 40,95 55,60 C65,38 75,80 90,45 C98,28 100,50 105,35"
            keyPoints="0;1;1;0"
            keyTimes="0;0.55;0.85;1"
            calcMode="linear"
          />
        </circle>
      </svg>
    </div>
  );
};
