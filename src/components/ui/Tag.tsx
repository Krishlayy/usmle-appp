import React from 'react';

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'accent' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
}

export const Tag = React.forwardRef<HTMLSpanElement, TagProps>(
  ({ className = '', variant = 'neutral', size = 'sm', children, ...props }, ref) => {

    const baseStyles = 'inline-flex items-center justify-center rounded-sm border font-mono whitespace-nowrap';

    const variants = {
      neutral: 'border-white/15 text-slate-300',
      accent: 'border-teal-300/40 text-teal-300',
      success: 'border-teal-300/40 text-teal-300',
      warning: 'border-amber-300/40 text-amber-300',
      error: 'border-red-400/40 text-red-300',
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