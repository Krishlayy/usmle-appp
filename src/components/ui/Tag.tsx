import React from 'react';

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'accent' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
}

export const Tag = React.forwardRef<HTMLSpanElement, TagProps>(
  ({ className = '', variant = 'neutral', size = 'sm', children, ...props }, ref) => {
    
    const baseStyles = 'inline-flex items-center justify-center rounded-full font-semibold whitespace-nowrap';
    
    const variants = {
      neutral: 'bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]', // Slate 100/600/200
      accent: 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]',  // Blue 50/700/200
      success: 'bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]', // Green 50/700/200
      warning: 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]', // Amber 50/700/200
      error: 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]',   // Red 50/700/200
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-[11px] uppercase tracking-wider',
      md: 'px-2.5 py-1 text-[13px]',
    };

    const combinedClasses = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

    return (
      <span ref={ref} className={combinedClasses} {...props}>
        {children}
      </span>
    );
  }
);

Tag.displayName = 'Tag';
