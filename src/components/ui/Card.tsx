import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: 'flat' | 'subtle' | 'elevated';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', elevation = 'subtle', children, ...props }, ref) => {
    
    const elevations = {
      flat: 'surface-flat',
      subtle: 'surface-subtle',
      elevated: 'surface-elevated',
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
