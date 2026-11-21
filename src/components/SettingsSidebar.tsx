'use client';

import React, { useEffect } from 'react';
import { X, Sparkles, Check, Sliders, Eye, Layout, Clock, Zap, ShieldAlert } from 'lucide-react';
import { useTestSettings } from './TestSettingsProvider';

interface SettingsSidebarProps {
  onClose: () => void;
}

const Toggle = ({ 
  label, 
  checked, 
  onChange, 
  description,
  badge
}: { 
  label: string; 
  checked: boolean; 
  onChange: () => void; 
  description?: string;
  badge?: string;
}) => (
  <div className="flex items-center justify-between py-3">
    <div className="flex flex-col pr-4">
      <div className="flex items-center gap-2">
        <span className="text-[13px] font-semibold text-slate-800">{label}</span>
        {badge && (
          <span className="text-[9px] font-bold px-1.5 py-0.2 bg-teal-100 text-teal-800 rounded font-mono">
            {badge}
          </span>
        )}
      </div>
      {description && <span className="text-[11px] text-slate-500 mt-0.5 leading-tight">{description}</span>}
    </div>
    <button 
      type="button"
      onClick={onChange}
      className={`w-11 h-6 rounded-full relative transition-colors cursor-pointer shrink-0 ${checked ? 'bg-teal-600' : 'bg-slate-300'}`}
    >
      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'} shadow-sm`} />
    </button>
  </div>
);

export function SettingsSidebar({ onClose }: SettingsSidebarProps) {
  const { settings, updateSetting } = useTestSettings();

  const isUworld = settings.appTheme === 'UWORLD' && settings.colorTheme === 'light';
  const isMqb = settings.appTheme === 'MQB' && settings.colorTheme === 'light';
  const isReverse = settings.colorTheme === 'dark';

  const selectTheme = (theme: 'uworld' | 'mqb' | 'reverse') => {
    if (theme === 'uworld') {
      updateSetting('appTheme', 'UWORLD');
      updateSetting('colorTheme', 'light');
    } else if (theme === 'mqb') {
      updateSetting('appTheme', 'MQB');
      updateSetting('colorTheme', 'light');
    } else if (theme === 'reverse') {
      updateSetting('appTheme', 'UWORLD');
      updateSetting('colorTheme', 'dark');
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
      className="fixed inset-0 z-[9999] bg-black/40 flex items-start justify-end p-4 pt-14 backdrop-blur-xs font-sans animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white/98 backdrop-blur-md rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] w-full max-w-[680px] flex flex-col overflow-hidden border border-slate-300 animate-in slide-in-from-top-2 duration-150"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-white tracking-tight">Examination Display &amp; Player Controls</h2>
              <p className="text-[11px] text-slate-400 font-medium">Fine-tune testing ergonomics, typography, and clinical pacing</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="text-slate-400 hover:text-white hover:bg-slate-800 p-1.5 rounded-lg transition-colors cursor-pointer"
            title="Close Settings (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 max-h-[75vh] space-y-6">
          
          {/* 1. Exam Simulator Theme */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">1. Exam Simulator Theme</span>
              <span className="text-[11px] text-teal-700 font-semibold font-mono">
                {isUworld ? 'UWorld Official' : isMqb ? 'MQB Signature' : 'Reverse Color'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-4">Choose between the authentic NBME exam canvas or the high-retention MQB glassmorphic theme.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* UWorld Official Card */}
              <button
                type="button"
                onClick={() => selectTheme('uworld')}
                className={`p-3.5 rounded-xl border-2 text-left transition-all flex flex-col justify-between cursor-pointer ${
                  isUworld 
                    ? 'border-[#003366] bg-blue-50/50 shadow-xs ring-2 ring-blue-500/20' 
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-[#003366]">UWorld Official</span>
                    {isUworld && <Check className="w-4 h-4 text-[#003366]" />}
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Authentic NBME FRED v2 layout with deep navy header and classic bordered options.
                  </p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-100 text-[10px] font-mono text-slate-400">
                  Standard Board Simulation
                </div>
              </button>

              {/* MQB Signature Card */}
              <button
                type="button"
                onClick={() => selectTheme('mqb')}
                className={`p-3.5 rounded-xl border-2 text-left transition-all flex flex-col justify-between cursor-pointer ${
                  isMqb 
                    ? 'border-teal-600 bg-teal-50/50 shadow-xs ring-2 ring-teal-500/20' 
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                      <span className="text-xs font-bold text-teal-900">MQB Signature</span>
                    </div>
                    {isMqb && <Check className="w-4 h-4 text-teal-600" />}
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Modern clinical dark/light hybrid with sleek glassmorphism, surgical teal accents, and ambient focus.
                  </p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-100 text-[10px] font-mono text-teal-700 font-bold">
                  Amboss / Linear Grade
                </div>
              </button>

              {/* Reverse Color Card */}
              <button
                type="button"
                onClick={() => selectTheme('reverse')}
                className={`p-3.5 rounded-xl border-2 text-left transition-all flex flex-col justify-between cursor-pointer ${
                  isReverse 
                    ? 'border-slate-800 bg-slate-900 text-white shadow-xs ring-2 ring-slate-700' 
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-xs font-bold ${isReverse ? 'text-white' : 'text-slate-900'}`}>Reverse Color</span>
                    {isReverse && <Check className="w-4 h-4 text-teal-400" />}
                  </div>
                  <p className={`text-[11px] leading-snug ${isReverse ? 'text-slate-300' : 'text-slate-600'}`}>
                    High-contrast night invert with pure dark background for zero eye strain during night study.
                  </p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-100/20 text-[10px] font-mono text-slate-400">
                  USMLE Invert Mode
                </div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column: Visual Ergonomics */}
            <div className="space-y-6">

              {/* Typography / Font Size */}
              <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Typography Scale</span>
                  <span className="text-xs font-bold text-teal-700 font-mono">{settings.fontSize}px</span>
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
                      className={`py-1.5 px-2 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                        settings.fontSize === size.val
                          ? 'bg-teal-700 text-white border-teal-700 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>

                {/* Smooth Slider */}
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-xs font-serif text-slate-500 font-bold">12px</span>
                  <input 
                    type="range" 
                    min="12" max="24" 
                    value={settings.fontSize} 
                    onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
                    className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                    aria-label="Font Size"
                  />
                  <span className="text-base font-serif text-slate-800 font-bold">24px</span>
                </div>
              </div>

              {/* Options Layout: Standard vs Compact */}
              <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Options Layout Density</span>
                  <span className="text-[11px] text-teal-700 font-semibold font-mono uppercase">{settings.answerLayout}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
                  <button 
                    type="button"
                    onClick={() => updateSetting('answerLayout', 'standard')}
                    className={`py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      settings.answerLayout === 'standard' 
                        ? 'bg-white text-slate-900 shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Standard (Spacious)
                  </button>
                  <button 
                    type="button"
                    onClick={() => updateSetting('answerLayout', 'compact')}
                    className={`py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      settings.answerLayout === 'compact' 
                        ? 'bg-white text-slate-900 shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Compact (High-Density)
                  </button>
                </div>
              </div>

              {/* Reading Layout & Contrast */}
              <div className="bg-white px-4 py-2 rounded-xl border border-slate-200/90 shadow-2xs divide-y divide-slate-100">
                <Toggle 
                  label="Split Screen Dual-Pane" 
                  description="Side-by-side reading (vignette on left, options on right)"
                  checked={settings.splitScreen} 
                  onChange={() => updateSetting('splitScreen', !settings.splitScreen)} 
                  badge="50 / 50"
                />
                <Toggle 
                  label="High Contrast Mode" 
                  description="Crisp 2px borders, pure solid black/white"
                  checked={settings.highContrast} 
                  onChange={() => updateSetting('highContrast', !settings.highContrast)} 
                />
              </div>

            </div>

            {/* Right Column: Examination Behaviors */}
            <div className="space-y-6">

              {/* Hotkeys & Assist Toggles */}
              <div className="bg-white px-4 py-2 rounded-xl border border-slate-200/90 shadow-2xs divide-y divide-slate-100">
                <Toggle 
                  label="Keyboard Shortcut Badges" 
                  description="Display shortcut hints (Alt+P, Alt+N, Alt+M, A-E)"
                  checked={settings.showShortcuts} 
                  onChange={() => updateSetting('showShortcuts', !settings.showShortcuts)} 
                  badge="Alt+Key"
                />
                <Toggle 
                  label="Countdown Timer Display" 
                  description="Show or hide time remaining in header"
                  checked={settings.showTimer} 
                  onChange={() => updateSetting('showTimer', !settings.showTimer)} 
                />
                <Toggle 
                  label="Confirm Omission Warning" 
                  description="Warn if unanswered questions remain before ending block"
                  checked={settings.confirmOmission} 
                  onChange={() => updateSetting('confirmOmission', !settings.confirmOmission)} 
                />
                <Toggle 
                  label="Auto-Next on Selection" 
                  description="Advance to next item automatically in Timed mode"
                  checked={settings.autoNext} 
                  onChange={() => updateSetting('autoNext', !settings.autoNext)} 
                  badge="Timed Only"
                />
              </div>

              {/* Shortcuts Legend */}
              <div className="bg-slate-100 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block mb-2 font-mono">
                  Supported Hotkeys
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <div><kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px]">Alt+P</kbd> Previous Item</div>
                  <div><kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px]">Alt+N</kbd> Next Item</div>
                  <div><kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px]">Alt+M</kbd> Mark Question</div>
                  <div><kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px]">Alt+C</kbd> Calculator</div>
                  <div><kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px]">Alt+L</kbd> Lab Values</div>
                  <div><kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px]">A-E</kbd> Pick Option</div>
                </div>
              </div>

            </div>

          </div>

        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium">All settings are automatically saved to your profile</span>
          <button 
            type="button"
            onClick={onClose}
            className="bg-slate-900 text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
          >
            Apply &amp; Return
          </button>
        </div>

      </div>
    </div>
  );
}
