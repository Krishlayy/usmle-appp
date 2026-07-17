import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 ease-out rounded focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-[#2563EB] text-white hover:bg-[#1D4ED8] hover:-translate-y-[1px] hover:shadow-sm active:translate-y-0 active:shadow-none',
      secondary: 'bg-white border border-[#E5E7EB] text-[#0F172A] hover:bg-[#F8FAFC] hover:border-[#CBD5E1]',
      ghost: 'bg-transparent text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]',
    };

    const sizes = {
      sm: 'h-8 px-3 text-[13px]',
      md: 'h-10 px-4 text-[14px]',
      lg: 'h-12 px-6 text-[16px]',
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
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
