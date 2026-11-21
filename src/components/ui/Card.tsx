import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: 'flat' | 'subtle' | 'elevated';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', elevation = 'subtle', children, ...props }, ref) => {

    // Light surfaces: hairline border, soft shadow on elevated.
    const elevations = {
      flat: 'border border-transparent bg-slate-50',
      subtle: 'border border-slate-200 bg-white shadow-sm',
      elevated: 'border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)]',
    };

    const combinedClasses = `rounded-xl text-slate-900 ${elevations[elevation]} ${className}`;

    return (
      <div ref={ref} className={combinedClasses} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';