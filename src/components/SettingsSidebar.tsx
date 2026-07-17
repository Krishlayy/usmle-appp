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

        {/* Color Theme */}
        <div className="mb-6">
          <div className="text-[13px] font-bold text-gray-800 mb-2">Color Theme:</div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="theme" checked={settings.colorTheme === 'light'} onChange={() => updateSetting('colorTheme', 'light')} className="w-4 h-4 text-blue-600 focus:ring-blue-600" />
              <span className="text-[13px] text-gray-700">Light</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="theme" checked={settings.colorTheme === 'dark'} onChange={() => updateSetting('colorTheme', 'dark')} className="w-4 h-4 text-blue-600 focus:ring-blue-600" />
              <span className="text-[13px] text-gray-700">Dark (Reverse Color)</span>
            </label>
          </div>
        </div>

        <div className="h-px bg-gray-200 my-4 w-full"></div>

        {/* Toggles 1 */}
        <div className="space-y-1 mb-4">
          <Toggle label="Show Timer" checked={settings.showTimer} onChange={() => updateSetting('showTimer', !settings.showTimer)} />
          <Toggle label="Split Screen" checked={settings.splitScreen} onChange={() => updateSetting('splitScreen', !settings.splitScreen)} />
          <Toggle label="Confirm Omission" checked={settings.confirmOmission} onChange={() => updateSetting('confirmOmission', !settings.confirmOmission)} />
          <Toggle label="Add to Flashcard" checked={settings.addToFlashcard} onChange={() => updateSetting('addToFlashcard', !settings.addToFlashcard)} />
          <Toggle label="Add to Notebook" checked={settings.addToNotebook} onChange={() => updateSetting('addToNotebook', !settings.addToNotebook)} />
          <Toggle label="Add to Annotation" checked={settings.addToAnnotation} onChange={() => updateSetting('addToAnnotation', !settings.addToAnnotation)} />
        </div>

        <div className="h-px bg-gray-200 my-4 w-full"></div>

        {/* Default Highlighter */}
        <div className="mb-4">
          <div className="text-[13px] text-gray-700 mb-2">Default Highlighter:</div>
          <div className="flex items-center gap-2">
            {[
              { id: 'yellow', color: '#ffeb3b' },
              { id: 'pink', color: '#f48fb1' },
              { id: 'orange', color: '#ffb74d' },
              { id: 'blue', color: '#81d4fa' },
              { id: 'green', color: '#a5d6a7' }
            ].map(h => (
              <button 
                key={h.id}
                onClick={() => updateSetting('defaultHighlighter', h.id)}
                className={`w-6 h-6 rounded-full border-2 transition-all ${settings.defaultHighlighter === h.id ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: h.color }}
              />
            ))}
          </div>
        </div>

        {/* Toggles 2 */}
        <div className="space-y-1">
          <Toggle label="Multi-Color Highlighting" checked={settings.multicolorHighlighting} onChange={() => updateSetting('multicolorHighlighting', !settings.multicolorHighlighting)} />
          <Toggle label="Smart Context Menu" checked={settings.smartContextMenu} onChange={() => updateSetting('smartContextMenu', !settings.smartContextMenu)} />
          <Toggle label="Answer Elimination" checked={settings.answerElimination} onChange={() => updateSetting('answerElimination', !settings.answerElimination)} />
          <Toggle label="Hide Percentage (%)" checked={settings.hidePercentage} onChange={() => updateSetting('hidePercentage', !settings.hidePercentage)} />
        </div>

      </div>
    </div>
  );
}
