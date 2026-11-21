import React from 'react';
import { Loader } from './Loader';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {

    const baseStyles =
      'inline-flex items-center justify-center rounded-md font-semibold transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300 disabled:cursor-not-allowed disabled:opacity-50';

    // Primary: white fill, ink text. Secondary: 1px hairline, inherits text colour so it also
    // reads on the few light surfaces (admin) that still use this component.
    const variants = {
      primary: 'border border-slate-300/40 bg-white text-slate-950 hover:bg-teal-200',
      secondary: 'border border-slate-400/40 bg-transparent text-inherit hover:border-slate-400/80',
      tertiary: 'bg-transparent text-inherit underline-offset-4 opacity-80 hover:underline hover:opacity-100',
      ghost: 'bg-transparent text-inherit opacity-80 hover:bg-white/5 hover:opacity-100',
    };

    const sizes = {
      sm: 'h-8 px-4 text-xs',
      md: 'h-10 px-5 text-sm',
      lg: 'h-12 px-8 text-base',
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