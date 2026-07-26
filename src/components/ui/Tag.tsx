import React from 'react';

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'accent' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
}

export const Tag = React.forwardRef<HTMLSpanElement, TagProps>(
  ({ className = '', variant = 'neutral', size = 'sm', children, ...props }, ref) => {
    
    const baseStyles = 'inline-flex items-center justify-center rounded font-medium whitespace-nowrap';
    
    const variants = {
      neutral: 'bg-gray-100 text-gray-700 border border-transparent',
      accent: 'bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-transparent',
      success: 'bg-[var(--color-success)]/10 text-[var(--color-success)] border border-transparent',
      warning: 'bg-[var(--color-warning)]/10 text-[var(--color-warning)] border border-transparent',
      error: 'bg-[var(--color-error)]/10 text-[var(--color-error)] border border-transparent',
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
