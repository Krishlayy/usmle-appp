import React, { useState } from 'react';

interface HighlightToolbarProps {
  rect: DOMRect | null;
  onHighlight: (color: string) => void;
  onTranslate?: () => void;
  onAddNote?: () => void;
}

export function HighlightToolbar({ rect, onHighlight, onTranslate, onAddNote }: HighlightToolbarProps) {
  if (!rect) return null;

  const colors = [
    { name: 'yellow', hex: '#fef08a' },
    { name: 'green', hex: '#bbf7d0' },
    { name: 'blue', hex: '#bfdbfe' },
    { name: 'red', hex: '#fecaca' },
    { name: 'purple', hex: '#e9d5ff' },
    { name: 'eraser', hex: 'transparent' },
  ];

  return (
    <div 
      className="fixed z-[9999] bg-white border border-gray-200 shadow-xl rounded-lg p-2 flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200"
      style={{
        top: rect.top - 50,
        left: rect.left + (rect.width / 2) - 100, // Centered roughly
      }}
    >
      <div className="flex gap-1 pr-2 border-r border-gray-200">
        {colors.map(c => (
          <button
            key={c.name}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onHighlight(c.hex)}
            className={`w-6 h-6 rounded-full shadow-sm hover:scale-110 transition-transform ${c.hex === 'transparent' ? 'border border-gray-300' : ''}`}
            style={{ backgroundColor: c.hex === 'transparent' ? '#f8fafc' : c.hex }}
            title={c.name === 'eraser' ? 'Eraser (Clear)' : `Highlight ${c.name}`}
          >
            {c.hex === 'transparent' && <span className="text-red-500 font-bold text-xs flex items-center justify-center h-full w-full">/</span>}
          </button>
        ))}
      </div>
      
      {onAddNote && (
        <button 
          onClick={onAddNote}
          className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
          title="Add Note"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        </button>
      )}

      {onTranslate && (
        <button 
          onClick={onTranslate}
          className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
          title="Translate Selection"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 8 6 6"></path><path d="m4 14 6-6 2-3"></path><path d="M2 5h12"></path><path d="M7 2h1"></path><path d="m22 22-5-10-5 10"></path><path d="M14 18h6"></path></svg>
        </button>
      )}
    </div>
  );
}
