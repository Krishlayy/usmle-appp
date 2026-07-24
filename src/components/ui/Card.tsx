import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: 'flat' | 'subtle' | 'elevated';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', elevation = 'subtle', children, ...props }, ref) => {
    
    const elevations = {
      flat: 'surface-flat',
      subtle: 'surface-subtle border border-[var(--color-border-subtle)] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.03)]',
      elevated: 'surface-elevated',
    };

    const combinedClasses = `rounded-2xl overflow-hidden bg-white ${elevations[elevation]} ${className}`;

    return (
      <div ref={ref} className={combinedClasses} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
