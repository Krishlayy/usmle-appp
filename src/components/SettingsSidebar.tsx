'use client';

import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, Info } from 'lucide-react';
import { useTestSettings } from './TestSettingsProvider';

interface SettingsSidebarProps {
  onClose: () => void;
}

const ToggleRow = ({
  label,
  checked,
  onChange,
  disabled = false,
  info = false
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  info?: boolean;
}) => (
  <div className={`flex items-center justify-between py-2.5 border-b border-gray-100 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
    <div className="flex items-center gap-1.5">
      <span className="text-[13px] text-gray-700 font-semibold tracking-wide">{label}</span>
      {info && (
        <span className="text-gray-400 cursor-help" title="More information">
          <Info size={14} className="hover:text-gray-600 transition-colors" />
        </span>
      )}
    </div>
    <button
      onClick={onChange}
      disabled={disabled}
      className={`w-9 h-5 rounded-full relative transition-colors duration-200 ${checked ? 'bg-[#3b82f6]' : 'bg-gray-300'}`}
    >
      <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${checked ? 'translate-x-4' : 'translate-x-0'} shadow-sm`} />
    </button>
  </div>
);

export function SettingsSidebar({ onClose }: SettingsSidebarProps) {
  const { settings, updateSetting } = useTestSettings();
  const [animate, setAnimate] = useState(false);
  const [showHighlighterColors, setShowHighlighterColors] = useState(false);

  useEffect(() => {
    // Trigger transition after render
    const frame = requestAnimationFrame(() => {
      setAnimate(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleClose = () => {
    setAnimate(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const highlighterColors: Record<string, string> = {
    yellow: '#ffeb3b',
    pink: '#f48fb1',
    orange: '#ffb74d',
    blue: '#81d4fa',
    green: '#a5d6a7',
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end font-sans overflow-hidden">
      {/* Backdrop fading in */}
      <div
        onClick={handleClose}
        className={`fixed inset-0 bg-black/40 transition-opacity duration-300 ease-out ${animate ? 'opacity-100' : 'opacity-0'
          }`}
      />

      {/* Sidebar panel sliding in from right */}
      <div
        className={`w-[360px] md:w-[380px] bg-white h-full relative z-10 shadow-2xl flex flex-col transition-transform duration-300 ease-out border-l border-gray-200 ${animate ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 select-none">
          <h2 className="text-[17px] font-bold text-gray-800 tracking-wide">Settings</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-50 p-1.5 rounded-full transition-all duration-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 select-none">

          {/* Appearance Section */}
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Appearance</div>
            <div className="flex items-center gap-6">

              {/* NBME Card */}
              <button
                onClick={() => updateSetting('appearance', 'NBME Official')}
                className={`flex flex-col items-center justify-between p-3.5 rounded-xl border-2 transition-all w-28 h-32 ${settings.appearance === 'NBME Official'
                  ? 'border-[#3b82f6] bg-blue-50/20 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
                  }`}
              >
                <div className="w-12 h-12 rounded-xl bg-[#004b87] flex flex-col justify-between p-1.5 shadow-sm">
                  <div className="h-1.5 bg-white rounded-sm w-full" />
                  <div className="flex-1 flex gap-1 mt-1.5">
                    <div className="w-3 bg-white/40 rounded-sm" />
                    <div className="flex-1 bg-white/20 rounded-sm" />
                  </div>
                </div>
                <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">NBME</span>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${settings.appearance === 'NBME Official' ? 'border-[#3b82f6]' : 'border-gray-300'
                  }`}>
                  {settings.appearance === 'NBME Official' && (
                    <div className="w-2 h-2 rounded-full bg-[#3b82f6]" />
                  )}
                </div>
              </button>

              {/* UWorld Card */}
              <button
                onClick={() => updateSetting('appearance', 'UWorld')}
                className={`flex flex-col items-center justify-between p-3.5 rounded-xl border-2 transition-all w-28 h-32 ${settings.appearance === 'UWorld'
                  ? 'border-[#3b82f6] bg-blue-50/20 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
                  }`}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#005fb8] to-[#1d91f2] flex items-center justify-center shadow-sm">
                  <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 3c-4.97 0-9 4.03-9 9" />
                    <path d="M12 6.5c-3.038 0-5.5 2.462-5.5 5.5" />
                    <path d="M12 10c-1.105 0-2 .895-2 2" />
                  </svg>
                </div>
                <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">UMicro
                </span>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${settings.appearance === 'UWorld' ? 'border-[#3b82f6]' : 'border-gray-300'
                  }`}>
                  {settings.appearance === 'UWorld' && (
                    <div className="w-2 h-2 rounded-full bg-[#3b82f6]" />
                  )}
                </div>
              </button>

            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Font Size Section */}
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Font Size</div>
            <div className="flex items-center gap-4 py-1.5">
              <button
                onClick={() => updateSetting('fontSize', Math.max(10, settings.fontSize - 1))}
                className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
              >
                <Minus size={14} />
              </button>

              <div className="flex-1 relative flex items-center h-6">
                <div className="absolute inset-x-0 h-0.5 bg-gray-200 rounded-full" />
                <input
                  type="range"
                  min="10"
                  max="24"
                  value={settings.fontSize}
                  onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
                  className="w-full h-full opacity-0 cursor-pointer relative z-10"
                />
                <div
                  className="absolute pointer-events-none h-6 px-3.5 bg-[#3b82f6] text-white text-[11px] font-semibold rounded-full flex items-center justify-center shadow-md select-none transform -translate-x-1/2"
                  style={{
                    left: `${((settings.fontSize - 10) / (24 - 10)) * 100}%`,
                  }}
                >
                  Aa
                </div>
              </div>

              <button
                onClick={() => updateSetting('fontSize', Math.min(24, settings.fontSize + 1))}
                className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Color Theme Section */}
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Color Theme</div>
            <div className="flex items-center gap-4 py-1">
              {[
                { id: 'light', bg: 'bg-white border-gray-200' },
                { id: 'gray', bg: 'bg-gray-100 border-gray-300' },
                { id: 'dark', bg: 'bg-slate-900 border-slate-950' },
                { id: 'cream', bg: 'bg-[#faf0d7] border-[#e8dcc4]' }
              ].map((theme) => {
                const isActive = settings.colorTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => updateSetting('colorTheme', theme.id as any)}
                    className={`w-8 h-8 rounded-full border relative transition-all duration-200 hover:scale-105 ${theme.bg} ${isActive ? 'ring-2 ring-offset-2 ring-blue-500 scale-110 shadow-sm' : ''
                      }`}
                  >
                    {isActive && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className={`w-2 h-2 rounded-full ${theme.id === 'light' || theme.id === 'cream' ? 'bg-[#3b82f6]' : 'bg-white'
                          }`} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Simple Toggles */}
          <div className="space-y-1">
            <ToggleRow
              label="Show Timer"
              checked={settings.showTimer}
              onChange={() => updateSetting('showTimer', !settings.showTimer)}
            />
            <ToggleRow
              label="Split Screen Explanations"
              checked={settings.splitScreen}
              onChange={() => updateSetting('splitScreen', !settings.splitScreen)}
            />
          </div>

          <div className="h-px bg-gray-100" />

          {/* Night Mode Section */}
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Night Mode</div>
            <div className="text-[11px] text-gray-400 mb-3 italic">For auto changes to dark mode based on scheduled time</div>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-1">
                <span className="text-[13px] text-gray-700 font-semibold tracking-wide">Automatic</span>
                <button
                  onClick={() => updateSetting('nightModeAutomatic', !settings.nightModeAutomatic)}
                  className={`w-9 h-5 rounded-full relative transition-colors duration-200 ${settings.nightModeAutomatic ? 'bg-[#3b82f6]' : 'bg-gray-300'
                    }`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${settings.nightModeAutomatic ? 'translate-x-4' : 'translate-x-0'
                    } shadow-sm`} />
                </button>
              </div>

              {/* Time pickers start/end */}
              <div className={`grid grid-cols-2 gap-3.5 transition-all duration-300 ${settings.nightModeAutomatic ? 'opacity-100 pointer-events-auto' : 'opacity-40 pointer-events-none'
                }`}>
                <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl">
                  <span className="text-[12px] text-gray-500 font-semibold">Start</span>
                  <input
                    type="text"
                    value={settings.nightModeStart}
                    onChange={(e) => updateSetting('nightModeStart', e.target.value)}
                    className="bg-transparent text-[12px] font-bold text-gray-700 text-right w-16 outline-none focus:text-blue-600"
                  />
                </div>
                <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl">
                  <span className="text-[12px] text-gray-500 font-semibold">End</span>
                  <input
                    type="text"
                    value={settings.nightModeEnd}
                    onChange={(e) => updateSetting('nightModeEnd', e.target.value)}
                    className="bg-transparent text-[12px] font-bold text-gray-700 text-right w-16 outline-none focus:text-blue-600"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Features Section */}
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Features</div>
            <div className="space-y-1">
              <ToggleRow
                label="Confirm Answer Omission"
                checked={settings.confirmOmission}
                onChange={() => updateSetting('confirmOmission', !settings.confirmOmission)}
              />

              {/* Default Highlighter palette selector */}
              <div className="flex flex-col py-2.5 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-gray-700 font-semibold tracking-wide">Default Highlighter</span>
                  <button
                    onClick={() => setShowHighlighterColors(!showHighlighterColors)}
                    className="w-6 h-6 rounded-md border border-gray-200 shadow-sm transition-transform active:scale-95 focus:outline-none"
                    style={{ backgroundColor: highlighterColors[settings.defaultHighlighter || 'yellow'] }}
                  />
                </div>
                {showHighlighterColors && (
                  <div className="flex items-center gap-2 mt-3 p-2 bg-gray-50 rounded-xl border border-gray-100 self-end">
                    {Object.entries(highlighterColors).map(([id, hex]) => (
                      <button
                        key={id}
                        onClick={() => {
                          updateSetting('defaultHighlighter', id);
                          setShowHighlighterColors(false);
                        }}
                        className={`w-6 h-6 rounded-full transition-all duration-200 border-2 ${settings.defaultHighlighter === id ? 'border-[#3b82f6] scale-110 shadow-sm' : 'border-transparent hover:scale-105'
                          }`}
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                )}
              </div>

              <ToggleRow
                label="Multicolor Highlighting"
                checked={settings.multicolorHighlighting}
                onChange={() => updateSetting('multicolorHighlighting', !settings.multicolorHighlighting)}
              />
              <ToggleRow
                label="Hide % Answered Correctly"
                checked={settings.hidePercentage}
                onChange={() => updateSetting('hidePercentage', !settings.hidePercentage)}
                disabled={true}
              />
              <ToggleRow
                label="Add To Flashcard"
                checked={settings.addToFlashcard}
                onChange={() => updateSetting('addToFlashcard', !settings.addToFlashcard)}
              />
              <ToggleRow
                label="Add To Notebook"
                checked={settings.addToNotebook}
                onChange={() => updateSetting('addToNotebook', !settings.addToNotebook)}
              />
              <ToggleRow
                label="Add To Annotation"
                checked={settings.addToAnnotation}
                onChange={() => updateSetting('addToAnnotation', !settings.addToAnnotation)}
              />
              <ToggleRow
                label="Smart Context Menu"
                checked={settings.smartContextMenu}
                onChange={() => updateSetting('smartContextMenu', !settings.smartContextMenu)}
                info={true}
              />
              <ToggleRow
                label="Answer Elimination"
                checked={settings.answerElimination}
                onChange={() => updateSetting('answerElimination', !settings.answerElimination)}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
