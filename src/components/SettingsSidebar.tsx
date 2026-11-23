'use client';

import React, { useEffect } from 'react';
import { X, Sparkles, Check, Sliders, Type, Columns, SunMoon, Keyboard, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import { useTestSettings } from './TestSettingsProvider';

interface SettingsSidebarProps {
  onClose: () => void;
}

interface ToggleRowProps {
  icon?: React.ReactNode;
  label: string;
  checked: boolean;
  onChange: () => void;
  description?: string;
  badge?: string;
}

const MinimalToggle = ({ 
  icon,
  label, 
  checked, 
  onChange, 
  description,
  badge
}: ToggleRowProps) => (
  <div className="flex items-start justify-between py-3.5 gap-4">
    <div className="flex items-start gap-3">
      {icon && <div className="mt-0.5 text-slate-500 shrink-0">{icon}</div>}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-900">{label}</span>
          {badge && (
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-teal-50 border border-teal-200 text-teal-800 rounded">
              {badge}
            </span>
          )}
        </div>
        {description && <span className="text-xs text-slate-500 mt-0.5 leading-relaxed">{description}</span>}
      </div>
    </div>
    <button 
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`w-10 h-5.5 rounded-full relative transition-colors cursor-pointer shrink-0 mt-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600 ${
        checked ? 'bg-teal-700' : 'bg-slate-200 hover:bg-slate-300'
      }`}
    >
      <div 
        className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full transition-transform shadow-xs ${
          checked ? 'translate-x-4.5' : 'translate-x-0'
        }`} 
      />
    </button>
  </div>
);

export function SettingsSidebar({ onClose }: SettingsSidebarProps) {
  const { settings, updateSetting } = useTestSettings();

  const isUworld = settings.appTheme === 'UWORLD';
  const isMqb = settings.appTheme === 'MQB';

  const selectTheme = (theme: 'uworld' | 'mqb') => {
    if (theme === 'uworld') {
      updateSetting('appTheme', 'UWORLD');
      updateSetting('colorTheme', 'light');
    } else if (theme === 'mqb') {
      updateSetting('appTheme', 'MQB');
      updateSetting('colorTheme', 'light');
    }
  };

  // Keyboard Escape listener to dismiss settings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-slate-950/45 flex items-center justify-center p-4 backdrop-blur-xs font-sans animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-xl w-full max-w-xl flex flex-col overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200/80 flex items-center justify-center text-teal-700">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Simulator Settings</h2>
              <p className="text-xs text-slate-500">Fine-tune testing ergonomics, typography, and exam pacing</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg transition-colors cursor-pointer"
            title="Close Settings (Esc)"
            aria-label="Close Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 max-h-[75vh] space-y-6 divide-y divide-slate-100 [&>*:not(:first-child)]:pt-6">
          
          {/* 1. Exam Interface Theme (2 Options Only: USMLE Official & MQB Signature) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">Interface Theme</span>
              <span className="text-xs text-teal-700 font-semibold font-mono">
                {isUworld ? 'USMLE Official' : 'MQB Signature'}
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* USMLE Official Card */}
              <button
                type="button"
                onClick={() => selectTheme('uworld')}
                className={`p-4 rounded-lg border text-left transition-all flex flex-col justify-between cursor-pointer ${
                  isUworld 
                    ? 'border-[#003366] bg-blue-50/40 ring-1 ring-[#003366]' 
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-bold text-[#003366]">USMLE Official</span>
                    {isUworld && <Check className="w-4 h-4 text-[#003366]" />}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Authentic NBME FRED v2 layout with classic deep navy header and standard bordered options.
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] font-mono text-slate-400">
                  Standard Board Simulation
                </div>
              </button>

              {/* MQB Signature Card */}
              <button
                type="button"
                onClick={() => selectTheme('mqb')}
                className={`p-4 rounded-lg border text-left transition-all flex flex-col justify-between cursor-pointer ${
                  isMqb 
                    ? 'border-teal-600 bg-teal-50/40 ring-1 ring-teal-600' 
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                      <span className="text-sm font-bold text-teal-900">MQB Signature</span>
                    </div>
                    {isMqb && <Check className="w-4 h-4 text-teal-600" />}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Modern surgical interface with high-contrast stem focus, teal accents, and sleek options layout.
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] font-mono text-teal-700 font-bold">
                  Clinical Focus Mode
                </div>
              </button>
            </div>
          </div>

          {/* 2. Typography Scale */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">Typography Scale</span>
              <span className="text-xs font-mono font-bold text-teal-700">{settings.fontSize}px</span>
            </div>
            
            {/* 3 Preset Buttons */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { label: 'Standard (15px)', val: 15 },
                { label: 'Large (18px)', val: 18 },
                { label: 'X-Large (21px)', val: 21 },
              ].map(size => (
                <button
                  key={size.val}
                  type="button"
                  onClick={() => updateSetting('fontSize', size.val)}
                  className={`py-1.5 px-3 text-xs font-semibold rounded-md border transition-all cursor-pointer text-center ${
                    settings.fontSize === size.val
                      ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>

            {/* Slider */}
            <div className="flex items-center gap-3 pt-1">
              <span className="text-xs font-mono text-slate-400">12px</span>
              <input 
                type="range" 
                min="12" max="24" 
                value={settings.fontSize} 
                onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
                className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                aria-label="Font Size Slider"
              />
              <span className="text-xs font-mono text-slate-400">24px</span>
            </div>
          </div>

          {/* 3. Display & Reading Layout */}
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Display &amp; Layout
            </span>
            <div className="divide-y divide-slate-100">
              <MinimalToggle 
                icon={<Columns className="w-4 h-4" />}
                label="Split Screen Dual-Pane" 
                description="Side-by-side view with vignette stem on left and answer choices on right"
                checked={settings.splitScreen} 
                onChange={() => updateSetting('splitScreen', !settings.splitScreen)} 
                badge="50 / 50"
              />
              <MinimalToggle 
                icon={<SunMoon className="w-4 h-4" />}
                label="High Contrast Mode" 
                description="Crisp solid black-and-white borders for maximum legibility"
                checked={settings.highContrast} 
                onChange={() => updateSetting('highContrast', !settings.highContrast)} 
              />
            </div>
          </div>

          {/* 4. Examination Behaviors */}
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Exam Assist &amp; Pacing
            </span>
            <div className="divide-y divide-slate-100">
              <MinimalToggle 
                icon={<Keyboard className="w-4 h-4" />}
                label="Keyboard Shortcut Badges" 
                description="Display subtle hotkey hints (Alt+P, Alt+N, Alt+M, A–E)"
                checked={settings.showShortcuts} 
                onChange={() => updateSetting('showShortcuts', !settings.showShortcuts)} 
              />
              <MinimalToggle 
                icon={<Clock className="w-4 h-4" />}
                label="Countdown Timer Display" 
                description="Show or hide the block countdown timer in the top header"
                checked={settings.showTimer} 
                onChange={() => updateSetting('showTimer', !settings.showTimer)} 
              />
              <MinimalToggle 
                icon={<AlertCircle className="w-4 h-4" />}
                label="Confirm Omission Warning" 
                description="Prompt a confirmation dialog when attempting to proceed past an unanswered question"
                checked={settings.confirmOmission} 
                onChange={() => updateSetting('confirmOmission', !settings.confirmOmission)} 
              />
              <MinimalToggle 
                icon={<ArrowRight className="w-4 h-4" />}
                label="Auto-Next on Selection" 
                description="Automatically advance to the next item after picking an option in Timed mode"
                checked={settings.autoNext} 
                onChange={() => updateSetting('autoNext', !settings.autoNext)} 
                badge="Timed Only"
              />
            </div>
          </div>

          {/* 5. Supported Hotkeys Reference */}
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 block mb-2.5">
              Board Hotkeys Reference
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px] font-bold text-slate-800">Alt+P</kbd> Previous</div>
              <div className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px] font-bold text-slate-800">Alt+N</kbd> Next</div>
              <div className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px] font-bold text-slate-800">Alt+M</kbd> Mark</div>
              <div className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px] font-bold text-slate-800">Alt+C</kbd> Calc</div>
              <div className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px] font-bold text-slate-800">Alt+L</kbd> Labs</div>
              <div className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px] font-bold text-slate-800">A–E</kbd> Pick Option</div>
            </div>
          </div>

        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">Preferences persist automatically</span>
          <button 
            type="button"
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          >
            Apply &amp; Return
          </button>
        </div>

      </div>
    </div>
  );
}
