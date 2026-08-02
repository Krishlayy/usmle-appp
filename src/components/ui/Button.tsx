import React from 'react';
import { Loader } from './Loader';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    
    const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-200 ease-out rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] hover:-translate-y-[1px] hover:shadow-md active:translate-y-0 active:shadow-sm',
      secondary: 'bg-white/5 border border-white/10 text-white hover:border-white/20 hover:bg-white/10',
      tertiary: 'bg-transparent text-[var(--color-text-secondary)] hover:text-white underline-offset-4 hover:underline',
      ghost: 'bg-transparent text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-white',
    };

    const sizes = {
      sm: 'h-8 px-4 text-scale-xs',
      md: 'h-10 px-5 text-scale-sm',
      lg: 'h-12 px-8 text-scale-base',
      icon: 'h-10 w-10',
    };

    const combinedClasses = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

    return (
      <button
        ref={ref}
        className={combinedClasses}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader size="sm" className="mr-2" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
