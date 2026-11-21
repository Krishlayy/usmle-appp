import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: 'flat' | 'subtle' | 'elevated';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', elevation = 'subtle', children, ...props }, ref) => {

    // No shadows in the MQB language: elevation only changes the hairline strength.
    const elevations = {
      flat: 'border border-transparent bg-white/[0.02]',
      subtle: 'border border-white/10 bg-white/[0.03]',
      elevated: 'border border-white/15 bg-white/[0.04]',
    };

    const combinedClasses = `rounded-lg text-slate-100 backdrop-blur-xl ${elevations[elevation]} ${className}`;

    return (
      <div ref={ref} className={combinedClasses} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';