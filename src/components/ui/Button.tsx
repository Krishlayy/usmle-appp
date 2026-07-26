import React from 'react';
import { Loader } from './Loader';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors duration-150 rounded focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-[var(--color-accent)] text-white hover:bg-[#0F766E] shadow-none border border-transparent',
      secondary: 'bg-white border border-[var(--color-border-subtle)] text-primary hover:border-gray-300 hover:bg-gray-50 shadow-none',
      tertiary: 'bg-transparent text-secondary hover:text-primary underline-offset-4 hover:underline',
      ghost: 'bg-transparent text-secondary hover:bg-gray-100 hover:text-primary active:bg-gray-200',
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
