'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface DraggableModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  icon?: React.ReactNode;
  defaultPosition?: { x: number; y: number };
  width?: string;
  height?: string;
  minWidth?: string;
  minHeight?: string;
}

export function DraggableModal({
  isOpen,
  onClose,
  title,
  children,
  icon,
  defaultPosition = { 
    x: typeof window !== 'undefined' ? Math.max(0, window.innerWidth / 2 - 400) : 100, 
    y: typeof window !== 'undefined' ? Math.max(0, window.innerHeight / 2 - 300) : 100 
  },
  width = '800px',
  height = '600px',
  minWidth = '400px',
  minHeight = '300px'
}: DraggableModalProps) {
  const [position, setPosition] = useState(defaultPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const widthPx = width.includes('vw') ? window.innerWidth * (parseInt(width) / 100) : parseInt(width);
      const heightPx = height.includes('vh') ? window.innerHeight * (parseInt(height) / 100) : parseInt(height);
      // Center if defaultPosition wasn't provided well
      setPosition({
        x: Math.max(0, window.innerWidth / 2 - widthPx / 2),
        y: Math.max(0, window.innerHeight / 2 - heightPx / 2),
      });
    }
  }, [isOpen, width, height]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragRef.current) return;
      
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      
      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - 100, dragRef.current.initialX + dx)),
        y: Math.max(0, Math.min(window.innerHeight - 50, dragRef.current.initialY + dy))
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag from the header
    if ((e.target as HTMLElement).closest('.modal-content')) return;
    
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y
    };
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed z-[9999] shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-[#003366] bg-white flex flex-col font-sans"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width,
        height,
        minWidth,
        minHeight
      }}
    >
      {/* Header / Drag Handle */}
      <div 
        className="h-[32px] bg-[#003366] text-white flex items-center justify-between px-3 cursor-move select-none shrink-0"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2 font-bold text-[13px] pointer-events-none">
          {icon && <span>{icon}</span>}
          {title}
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-2">
          <button className="hover:bg-white/20 p-0.5 rounded cursor-pointer" title="Copy to clipboard">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          </button>
          <button onClick={onClose} className="hover:bg-red-500 hover:text-white p-0.5 rounded cursor-pointer" title="Close">
            <X size={16} />
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-hidden modal-content bg-white flex flex-col relative">
        {children}
      </div>
    </div>
  );
}
