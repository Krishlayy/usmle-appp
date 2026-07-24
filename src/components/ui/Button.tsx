import React from 'react';
import { Loader } from './Loader';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    
    const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-primary text-white hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-sm border border-transparent',
      secondary: 'bg-white border-2 border-[var(--color-border-subtle)] text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-primary shadow-sm active:bg-slate-100',
      tertiary: 'bg-transparent text-slate-500 hover:text-primary underline-offset-4 hover:underline',
      ghost: 'bg-transparent text-slate-500 hover:bg-slate-100 hover:text-primary active:bg-slate-200',
    };

    const sizes = {
      sm: 'h-9 px-4 text-[13px]',
      md: 'h-11 px-6 text-[14px]',
      lg: 'h-14 px-8 text-[16px]',
      icon: 'h-11 w-11',
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
