'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Sun, Moon, ZoomIn, ZoomOut, RotateCcw, FileText, X } from 'lucide-react';

interface ExhibitDisplayProps {
  mediaUrl: string;
  onClose: () => void;
  onAddToNotes?: () => void;
}

export function ExhibitDisplay({ mediaUrl, onClose, onAddToNotes }: ExhibitDisplayProps) {
  const [invert, setInvert] = useState(false);
  const [contrast, setContrast] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(null);

  const handleZoomIn = () => setScale(s => Math.min(s + 0.25, 4));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.25, 0.25));
  const handleReset = () => {
    setInvert(false);
    setContrast(100);
    setBrightness(100);
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setPosition({
        x: dragRef.current.initialX + dx,
        y: dragRef.current.initialY + dy
      });
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const toolbarBtnClass = "p-2 hover:bg-slate-100 rounded text-slate-700 transition-colors";

  const content = (
    <div id="exhibit-display-root" className="fixed inset-0 z-[99999] bg-slate-900/90 flex flex-col backdrop-blur-sm animate-in fade-in duration-200 pointer-events-auto select-auto">
      {/* Header Bar */}
      <div className="h-14 bg-white flex items-center justify-between px-6 shadow-sm shrink-0 z-10 border-b border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 tracking-tight">Exhibit Viewer</h2>
        <button 
          onClick={onClose} 
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-900"
          title="Close (Esc)"
        >
          <X size={20} />
        </button>
      </div>

      {/* Image Viewer Area */}
      <div 
        className="flex-1 overflow-hidden flex items-center justify-center cursor-move relative"
        onMouseDown={handleMouseDown}
      >
        {mediaUrl.trim().startsWith('<table') || mediaUrl.trim().startsWith('<div') ? (
          <div 
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
              filter: `${invert ? 'invert(1)' : ''} contrast(${contrast}%) brightness(${brightness}%)`,
              transition: isDragging ? 'none' : 'transform 0.1s ease-in-out',
              maxWidth: '90%',
              maxHeight: '90%',
            }}
            className="prose prose-sm max-w-none p-4 pointer-events-none bg-white rounded shadow-lg"
            dangerouslySetInnerHTML={{ __html: mediaUrl }}
          />
        ) : (
          <img 
            src={mediaUrl} 
            alt="Exhibit" 
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
              filter: `${invert ? 'invert(1)' : ''} contrast(${contrast}%) brightness(${brightness}%)`,
              transition: isDragging ? 'none' : 'transform 0.1s ease-in-out',
              maxWidth: '95vw',
              maxHeight: '80vh',
              objectFit: 'contain'
            }}
            className="shadow-2xl bg-white p-2 rounded"
            draggable={false}
          />
        )}
      </div>

      {/* Bottom Toolbar */}
      <div className="h-16 bg-white flex items-center justify-center gap-6 px-6 shrink-0 z-10 border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <button onClick={() => setInvert(!invert)} className={toolbarBtnClass} title="Invert Colors">
          <div className="w-5 h-5 bg-black rounded overflow-hidden flex shadow-inner">
            <div className="w-1/2 h-full bg-white"></div>
          </div>
        </button>
        <button onClick={() => setContrast(c => c >= 150 ? 50 : c + 50)} className={toolbarBtnClass} title="Adjust Contrast">
          <Sun size={20} />
        </button>
        <button onClick={() => setBrightness(b => b >= 150 ? 50 : b + 50)} className={toolbarBtnClass} title="Adjust Brightness">
          <Moon size={20} />
        </button>
        <div className="w-px h-6 bg-slate-200 mx-1"></div>
        <button onClick={handleZoomIn} className={toolbarBtnClass} title="Zoom In">
          <ZoomIn size={20} />
        </button>
        <button onClick={handleZoomOut} className={toolbarBtnClass} title="Zoom Out">
          <ZoomOut size={20} />
        </button>
        <button onClick={handleReset} className={toolbarBtnClass} title="Reset">
          <RotateCcw size={20} />
        </button>
        <button onClick={() => setRotation(r => r + 90)} className={toolbarBtnClass} title="Rotate 90°">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
        </button>
        {onAddToNotes && (
          <>
            <div className="w-px h-6 bg-slate-200 mx-1"></div>
            <button onClick={onAddToNotes} className={`${toolbarBtnClass} flex items-center gap-2`} title="Add to Notes">
              <FileText size={20} />
              <span className="text-sm font-semibold">Notes</span>
            </button>
          </>
        )}
      </div>
    </div>
  );

  // Use createPortal to mount it directly to document.body
  // This bypasses any parent pointer-events:none or z-index constraints (e.g. from TestSecurityOverlay)
  if (typeof document !== 'undefined') {
    return createPortal(content, document.body);
  }
  return null;
}
