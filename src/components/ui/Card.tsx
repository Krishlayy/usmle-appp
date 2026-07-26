import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: 'flat' | 'subtle' | 'elevated';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', elevation = 'subtle', children, ...props }, ref) => {
    
    const elevations = {
      flat: 'bg-white border border-transparent',
      subtle: 'bg-white border border-[var(--color-border-subtle)]',
      elevated: 'bg-white border border-[var(--color-border-subtle)] shadow-sm',
    };

    const combinedClasses = `rounded-lg overflow-hidden ${elevations[elevation]} ${className}`;

    return (
      <div ref={ref} className={combinedClasses} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
