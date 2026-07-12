'use client';

import { X } from 'lucide-react';
import { useTestSettings } from './TestSettingsProvider';

interface SettingsSidebarProps {
  onClose: () => void;
}

export function SettingsSidebar({ onClose }: SettingsSidebarProps) {
  const { settings, updateSetting } = useTestSettings();

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-slate-100 shadow-2xl border-l border-slate-300 z-[90] flex flex-col transform transition-transform duration-300">
      <div className="flex items-center justify-between p-4 bg-slate-200 border-b border-slate-300">
        <h2 className="text-lg font-bold text-slate-800">Settings</h2>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-800 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Font Size */}
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Font Size</h3>
          <div className="flex items-center justify-between bg-white border border-slate-300 rounded overflow-hidden">
            <button 
              onClick={() => updateSetting('fontSize', Math.max(10, settings.fontSize - 1))}
              className="p-2 hover:bg-slate-100 flex-1 flex justify-center text-slate-600 font-bold"
            >
              −
            </button>
            <div className="px-4 py-2 border-x border-slate-300 font-medium text-slate-700 bg-slate-50">
              Aa
            </div>
            <button 
              onClick={() => updateSetting('fontSize', Math.min(24, settings.fontSize + 1))}
              className="p-2 hover:bg-slate-100 flex-1 flex justify-center text-slate-600 font-bold"
            >
              +
            </button>
          </div>
        </div>

        {/* Toggles & Features */}
        <div className="space-y-4 pt-4 border-t border-slate-300">
          <div className="flex items-center justify-between group cursor-pointer" onClick={() => updateSetting('showTimer', !settings.showTimer)}>
            <span className="text-sm font-medium text-slate-700">Show Timer</span>
            <div className={`w-4 h-4 border flex items-center justify-center rounded-sm ${settings.showTimer ? 'bg-[#4b6a18] border-[#4b6a18]' : 'bg-white border-slate-400'}`}>
              {settings.showTimer && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
            </div>
          </div>
          <div className="flex items-center justify-between group cursor-pointer" onClick={() => updateSetting('splitScreen', !settings.splitScreen)}>
            <span className="text-sm font-medium text-slate-700">Split Screen Explanations</span>
            <div className={`w-4 h-4 border flex items-center justify-center rounded-sm ${settings.splitScreen ? 'bg-[#4b6a18] border-[#4b6a18]' : 'bg-white border-slate-400'}`}>
              {settings.splitScreen && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-300">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Features</h3>
          <div className="flex items-center justify-between group cursor-pointer" onClick={() => updateSetting('confirmOmission', !settings.confirmOmission)}>
            <span className="text-sm font-medium text-slate-700">Confirm Answer Omission</span>
            <div className={`w-4 h-4 border flex items-center justify-center rounded-sm ${settings.confirmOmission ? 'bg-[#4b6a18] border-[#4b6a18]' : 'bg-white border-slate-400'}`}>
              {settings.confirmOmission && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
            </div>
          </div>

          <div className="flex items-center justify-between group cursor-pointer" onClick={() => updateSetting('showStrikeout', !settings.showStrikeout)}>
            <span className="text-sm font-medium text-slate-700">Show/Hide Strikeout</span>
            <div className={`w-4 h-4 border flex items-center justify-center rounded-sm ${settings.showStrikeout ? 'bg-[#4b6a18] border-[#4b6a18]' : 'bg-white border-slate-400'}`}>
              {settings.showStrikeout && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
