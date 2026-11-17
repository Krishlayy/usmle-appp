'use client';

import { X } from 'lucide-react';
import { useTestSettings } from './TestSettingsProvider';

interface SettingsSidebarProps {
  onClose: () => void;
}

const Toggle = ({ label, checked, onChange, description }: { label: string, checked: boolean, onChange: () => void, description?: string }) => (
  <div className="flex items-center justify-between py-3">
    <div className="flex flex-col">
      <span className="text-[13px] font-semibold text-slate-800">{label}</span>
      {description && <span className="text-[11px] text-slate-500 mt-0.5">{description}</span>}
    </div>
    <button 
      onClick={onChange}
      className={`w-10 h-5 rounded-full relative transition-colors ${checked ? 'bg-blue-600' : 'bg-slate-300'}`}
    >
      <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'} shadow-sm`} />
    </button>
  </div>
);

export function SettingsSidebar({ onClose }: SettingsSidebarProps) {
  const { settings, updateSetting } = useTestSettings();

  return (
    <div className="fixed top-16 right-4 z-[9999] flex items-start justify-end font-sans animate-in slide-in-from-top-2 fade-in duration-200">
      <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] w-[650px] flex flex-col overflow-hidden border border-slate-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex flex-col">
            <h2 className="text-[18px] font-bold text-slate-900">Test Player Settings</h2>
            <p className="text-[12px] text-slate-500 font-medium">Customize your exam experience.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 hover:bg-slate-200 p-1.5 rounded-md transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white max-h-[70vh]">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left Column: Visuals */}
            <div className="flex flex-col gap-6">

              {/* App Theme */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-4">Exam Simulator Theme</div>
                <div className="flex bg-slate-200/50 p-1 rounded-md border border-slate-200">
                  <button 
                    onClick={() => updateSetting('appTheme', 'UWORLD')}
                    className={`flex-1 py-1.5 text-[12px] font-bold rounded-sm transition-colors ${settings.appTheme === 'UWORLD' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >UWorld Simulator</button>
                  <button 
                    onClick={() => updateSetting('appTheme', 'MODERN')}
                    className={`flex-1 py-1.5 text-[12px] font-bold rounded-sm transition-colors ${settings.appTheme === 'MODERN' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >Modern Minimalist</button>
                </div>
              </div>
              
              {/* Font Size */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-4">Typography</div>
                <div className="flex items-center gap-4">
                  <span className="text-[14px] font-serif text-slate-700 font-bold">A-</span>
                  <input 
                    type="range" 
                    min="10" max="24" 
                    value={settings.fontSize} 
                    onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
                    className="flex-1 h-1.5 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <span className="text-[20px] font-serif text-slate-700 font-bold">A+</span>
                </div>
              </div>

              {/* Color Theme */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-4">Color Theme</div>
                <div className="flex bg-slate-200/50 p-1 rounded-md border border-slate-200">
                  <button 
                    onClick={() => updateSetting('colorTheme', 'light')}
                    className={`flex-1 py-1.5 text-[12px] font-bold rounded-sm transition-colors ${settings.colorTheme === 'light' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >Light</button>
                  <button 
                    onClick={() => updateSetting('colorTheme', 'sepia')}
                    className={`flex-1 py-1.5 text-[12px] font-bold rounded-sm transition-colors ${settings.colorTheme === 'sepia' ? 'bg-[#f4ecd8] text-[#5b4636] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >Sepia</button>
                  <button 
                    onClick={() => updateSetting('colorTheme', 'dark')}
                    className={`flex-1 py-1.5 text-[12px] font-bold rounded-sm transition-colors ${settings.colorTheme === 'dark' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >Dark</button>
                </div>
              </div>

              {/* Layout Mode */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-4">Options Layout</div>
                <div className="flex bg-slate-200/50 p-1 rounded-md border border-slate-200">
                  <button 
                    onClick={() => updateSetting('answerLayout', 'standard')}
                    className={`flex-1 py-1.5 text-[12px] font-bold rounded-sm transition-colors ${settings.answerLayout === 'standard' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >Standard</button>
                  <button 
                    onClick={() => updateSetting('answerLayout', 'compact')}
                    className={`flex-1 py-1.5 text-[12px] font-bold rounded-sm transition-colors ${settings.answerLayout === 'compact' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >Compact</button>
                </div>
              </div>

            </div>

            {/* Right Column: Behaviors */}
            <div className="flex flex-col gap-6">
              
              {/* Accessibility */}
              <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 divide-y divide-slate-200">
                <Toggle 
                  label="Split Screen Layout" 
                  description="Side-by-side reading view"
                  checked={settings.splitScreen} 
                  onChange={() => updateSetting('splitScreen', !settings.splitScreen)} 
                />
                <Toggle 
                  label="High Contrast Mode" 
                  description="Maximize text readability"
                  checked={settings.highContrast} 
                  onChange={() => updateSetting('highContrast', !settings.highContrast)} 
                />
                <Toggle 
                  label="Show Keyboard Shortcuts" 
                  description="Display shortcut hints on buttons"
                  checked={settings.showShortcuts} 
                  onChange={() => updateSetting('showShortcuts', !settings.showShortcuts)} 
                />
              </div>

              {/* Exam Behavior */}
              <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 divide-y divide-slate-200">
                <Toggle 
                  label="Show Timer" 
                  description="Display the block countdown"
                  checked={settings.showTimer} 
                  onChange={() => updateSetting('showTimer', !settings.showTimer)} 
                />
                <Toggle 
                  label="Confirm Omission" 
                  description="Warn if questions are left blank"
                  checked={settings.confirmOmission} 
                  onChange={() => updateSetting('confirmOmission', !settings.confirmOmission)} 
                />
                <Toggle 
                  label="Auto-Next Question" 
                  description="Proceed automatically on answer"
                  checked={settings.autoNext} 
                  onChange={() => updateSetting('autoNext', !settings.autoNext)} 
                />
              </div>

            </div>

          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button 
            onClick={onClose}
            className="bg-slate-900 text-white px-6 py-2 rounded-md text-[13px] font-bold hover:bg-slate-800 transition-colors shadow-sm"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
