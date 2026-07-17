import React from 'react';

export interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export const Toggle = React.forwardRef<HTMLInputElement, ToggleProps>(
  ({ className = '', label, description, checked, disabled, onChange, ...props }, ref) => {
    return (
      <label className={`flex items-start gap-3 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
        <div className="relative inline-flex items-center mt-0.5 shrink-0">
          <input 
            type="checkbox" 
            className="sr-only peer"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            ref={ref}
            {...props}
          />
          <div className="w-10 h-5 bg-[#E2E8F0] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#2563EB]/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all after:duration-200 peer-checked:bg-[#2563EB]"></div>
        </div>
        {(label || description) && (
          <div className="flex flex-col">
            {label && <span className="text-[14px] font-semibold text-primary">{label}</span>}
            {description && <span className="text-[13px] text-secondary mt-0.5">{description}</span>}
          </div>
        )}
      </label>
    );
  }
);

Toggle.displayName = 'Toggle';
