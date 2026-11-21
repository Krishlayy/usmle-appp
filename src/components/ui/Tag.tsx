import React from 'react';

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'accent' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
}

export const Tag = React.forwardRef<HTMLSpanElement, TagProps>(
  ({ className = '', variant = 'neutral', size = 'sm', children, ...props }, ref) => {

    const baseStyles = 'inline-flex items-center justify-center rounded-sm border font-mono whitespace-nowrap';

    const variants = {
      neutral: 'border-slate-300 bg-slate-50 text-slate-700',
      accent: 'border-teal-600/30 bg-teal-50 text-teal-700',
      success: 'border-emerald-600/30 bg-emerald-50 text-emerald-700',
      warning: 'border-amber-600/30 bg-amber-50 text-amber-700',
      error: 'border-red-600/30 bg-red-50 text-red-700',
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-[11px] uppercase tracking-[0.18em]',
      md: 'px-2.5 py-1 text-xs',
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