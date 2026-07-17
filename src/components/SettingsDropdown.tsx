'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTestSettings } from './TestSettingsProvider';

interface Props {
  onClose: () => void;
  anchorEl: HTMLElement | null;
}

export function SettingsDropdown({ onClose, anchorEl }: Props) {
  const { settings, updateSetting } = useTestSettings();
  const [activeSubMenu, setActiveSubMenu] = useState<'text' | 'theme' | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isDark = settings.colorTheme === 'dark';

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) && anchorEl && !anchorEl.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, anchorEl]);

  if (!anchorEl) return null;

  const rect = anchorEl.getBoundingClientRect();
  const top = rect.bottom;
  const right = window.innerWidth - rect.right;

  const bgClass = isDark ? 'bg-black text-[#00e5ff]' : 'bg-white text-black';
  const borderClass = isDark ? 'border-[#00e5ff]' : 'border-black';
  const hoverClass = isDark ? 'hover:bg-[#00e5ff] hover:text-black' : 'hover:bg-blue-600 hover:text-white';

  const fontSizes = [
    { label: '100%', value: 16 },
    { label: '125%', value: 20 },
    { label: '150%', value: 24 },
    { label: '200%', value: 32 },
  ];

  const themes = [
    { label: 'Default', value: 'light' },
    { label: 'Dark Theme', value: 'dark' },
  ];

  return (
    <div 
      ref={dropdownRef}
      className={`fixed z-50 flex border ${borderClass} ${bgClass} shadow-md font-sans text-[13px]`}
      style={{ top: `${top}px`, right: `${right}px` }}
      onMouseLeave={() => setActiveSubMenu(null)}
    >
      <div className="flex flex-col py-1 w-[160px]">
        <div 
          className={`px-3 py-1.5 flex justify-between items-center cursor-default ${activeSubMenu === 'text' ? hoverClass : ''} ${!activeSubMenu ? hoverClass : ''}`}
          onMouseEnter={() => setActiveSubMenu('text')}
        >
          <span>Resize Text</span>
          <span className={isDark ? '' : 'bg-[#6698ff] text-white w-4 h-4 flex items-center justify-center text-[10px] shadow-sm'}>▶</span>
        </div>
        <div 
          className={`px-3 py-1.5 flex justify-between items-center cursor-default ${activeSubMenu === 'theme' ? hoverClass : ''} ${!activeSubMenu ? hoverClass : ''}`}
          onMouseEnter={() => setActiveSubMenu('theme')}
        >
          <span>Color Theme</span>
          <span className={isDark ? '' : 'bg-[#6698ff] text-white w-4 h-4 flex items-center justify-center text-[10px] shadow-sm'}>▶</span>
        </div>

      </div>

      {/* Submenus */}
      {activeSubMenu === 'text' && (
        <div className={`absolute top-0 left-[-100px] border ${borderClass} ${bgClass} py-1 w-[100px] shadow-md`}>
          {fontSizes.map(size => (
            <div 
              key={size.value}
              className={`px-3 py-1.5 cursor-default flex justify-between ${hoverClass}`}
              onClick={() => { updateSetting('fontSize', size.value); onClose(); }}
            >
              <span>{size.label}</span>
              <span>{settings.fontSize === size.value ? '*' : ''}</span>
            </div>
          ))}
        </div>
      )}

      {activeSubMenu === 'theme' && (
        <div className={`absolute top-[30px] left-[-120px] border ${borderClass} ${bgClass} py-1 w-[120px] shadow-md`}>
          {themes.map(t => (
            <div 
              key={t.value}
              className={`px-3 py-1.5 cursor-default flex justify-between ${hoverClass}`}
              onClick={() => { updateSetting('colorTheme', t.value as 'light' | 'dark'); onClose(); }}
            >
              <span>{t.label}</span>
              <span>{settings.colorTheme === t.value ? '*' : ''}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
