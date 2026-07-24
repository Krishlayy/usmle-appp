'use client';

import { X } from 'lucide-react';
import { useTestSettings } from './TestSettingsProvider';

interface SettingsSidebarProps {
  onClose: () => void;
}

const Toggle = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: () => void }) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-[13px] text-gray-700">{label}</span>
    <button 
      onClick={onChange}
      className={`w-9 h-5 rounded-full relative transition-colors ${checked ? 'bg-[#3b82f6]' : 'bg-gray-300'}`}
    >
      <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'} shadow`} />
    </button>
  </div>
);

export function SettingsSidebar({ onClose }: SettingsSidebarProps) {
  const { settings, updateSetting } = useTestSettings();

  return (
    <div className="fixed inset-y-0 right-0 w-[340px] bg-white shadow-2xl border-l border-gray-300 z-[90] flex flex-col font-sans">
      <div className="flex items-center justify-between p-3 bg-[#004b87] text-white">
        <h2 className="text-[15px] font-bold">Settings</h2>
        <button onClick={onClose} className="hover:bg-white/20 p-1 rounded transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 pb-10">
        
        {/* Appearance */}
        <div className="mb-5">
          <div className="text-[13px] font-bold text-gray-800 mb-2">Appearance:</div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="appearance" checked={settings.appearance === 'NBME Official'} onChange={() => updateSetting('appearance', 'NBME Official')} className="w-4 h-4 text-blue-600 focus:ring-blue-600" />
              <span className="text-[13px] text-gray-700">NBME Official</span>
            </label>
          </div>
        </div>

        {/* Font Size */}
        <div className="mb-5">
          <div className="text-[13px] font-bold text-gray-800 mb-2">Font Size:</div>
          <div className="flex items-center gap-3">
            <span className="text-[14px] font-serif text-gray-700">A-</span>
            <input 
              type="range" 
              min="10" max="24" 
              value={settings.fontSize} 
              onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
              className="flex-1 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-[#3b82f6]"
            />
            <span className="text-[18px] font-serif text-gray-700">A+</span>
          </div>
        </div>

        {/* Layout & Accessibility */}
        <div className="mb-6">
          <div className="text-[13px] font-bold text-gray-800 mb-2">Layout & Accessibility:</div>
          <div className="flex flex-col">
            <Toggle 
              label="Split Screen Layout" 
              checked={settings.splitScreen} 
              onChange={() => updateSetting('splitScreen', !settings.splitScreen)} 
            />
            <div className="flex items-center justify-between py-2">
              <span className="text-[13px] text-gray-700">Answer Layout</span>
              <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                <button 
                  onClick={() => updateSetting('answerLayout', 'standard')}
                  className={`px-3 py-1 text-[11px] font-bold ${settings.answerLayout === 'standard' ? 'bg-[#3b82f6] text-white' : 'bg-gray-100 text-gray-600'}`}
                >Standard</button>
                <button 
                  onClick={() => updateSetting('answerLayout', 'compact')}
                  className={`px-3 py-1 text-[11px] font-bold border-l border-gray-300 ${settings.answerLayout === 'compact' ? 'bg-[#3b82f6] text-white' : 'bg-gray-100 text-gray-600'}`}
                >Compact</button>
              </div>
            </div>
            <Toggle 
              label="High Contrast Mode" 
              checked={settings.highContrast} 
              onChange={() => updateSetting('highContrast', !settings.highContrast)} 
            />
            <Toggle 
              label="Show Keyboard Shortcuts" 
              checked={settings.showShortcuts} 
              onChange={() => updateSetting('showShortcuts', !settings.showShortcuts)} 
            />
          </div>
        </div>

        {/* Color Theme */}
        <div className="mb-6">
          <div className="text-[13px] font-bold text-gray-800 mb-2">Color Theme:</div>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="theme" checked={settings.colorTheme === 'light'} onChange={() => updateSetting('colorTheme', 'light')} className="w-4 h-4 text-blue-600 focus:ring-blue-600" />
              <span className="text-[13px] text-gray-700">Light</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="theme" checked={settings.colorTheme === 'dark'} onChange={() => updateSetting('colorTheme', 'dark')} className="w-4 h-4 text-blue-600 focus:ring-blue-600" />
              <span className="text-[13px] text-gray-700">Dark (Reverse Color)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="theme" checked={settings.colorTheme === 'sepia'} onChange={() => updateSetting('colorTheme', 'sepia')} className="w-4 h-4 text-blue-600 focus:ring-blue-600" />
              <span className="text-[13px] text-gray-700">Sepia</span>
            </label>
          </div>
        </div>

        <div className="h-px bg-gray-200 my-4 w-full"></div>

        {/* Toggles 1 */}
        <div className="space-y-1 mb-4">
          <Toggle label="Show Timer" checked={settings.showTimer} onChange={() => updateSetting('showTimer', !settings.showTimer)} />
          <Toggle label="Confirm Omission" checked={settings.confirmOmission} onChange={() => updateSetting('confirmOmission', !settings.confirmOmission)} />
        </div>

        {/* Toggles 2 */}
        <div className="space-y-1">
          <Toggle label="Auto-Next Question" checked={settings.autoNext} onChange={() => updateSetting('autoNext', !settings.autoNext)} />
        </div>

      </div>
    </div>
  );
}
