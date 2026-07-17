'use client';

import React, { useState, useRef, useEffect } from 'react';
import { DraggableModal } from './DraggableModal';
import { FileImage, Sun, ZoomIn, ZoomOut, RotateCcw, FileText } from 'lucide-react';

interface ExhibitDisplayProps {
  mediaUrl: string;
  onClose: () => void;
  onAddToNotes?: () => void;
}

export function ExhibitDisplay({ mediaUrl, onClose, onAddToNotes }: ExhibitDisplayProps) {
  const [invert, setInvert] = useState(false);
  const [contrast, setContrast] = useState(100);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(null);

  const handleZoomIn = () => setScale(s => Math.min(s + 0.25, 3));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.25, 0.5));
  const handleReset = () => {
    setInvert(false);
    setContrast(100);
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

  const toolbarBtnClass = "p-1.5 hover:bg-gray-200 rounded text-gray-700 transition-colors";

  return (
    <DraggableModal 
      isOpen={true} 
      onClose={onClose} 
      title="Exhibit Display" 
      icon={<FileImage size={16} />}
      width="600px"
      height="600px"
      minWidth="400px"
      minHeight="400px"
    >
      <div className="flex flex-col h-full bg-white relative">
        {/* Image Viewer Area */}
        <div 
          className="flex-1 overflow-hidden flex items-center justify-center bg-white cursor-move relative"
          onMouseDown={handleMouseDown}
        >
          <img 
            src={mediaUrl} 
            alt="Exhibit" 
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
              filter: `${invert ? 'invert(1)' : ''} contrast(${contrast}%)`,
              transition: isDragging ? 'none' : 'transform 0.1s ease-in-out',
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain'
            }}
            draggable={false}
          />
        </div>

        {/* Bottom Toolbar */}
        <div className="h-10 bg-white border-t border-gray-300 flex items-center justify-center gap-4 px-4 shrink-0">
          <button onClick={() => setInvert(!invert)} className={toolbarBtnClass} title="Invert Colors">
            <div className="w-4 h-4 bg-black rounded-sm overflow-hidden flex">
              <div className="w-1/2 h-full bg-white"></div>
            </div>
          </button>
          <button onClick={() => setContrast(c => c >= 150 ? 50 : c + 50)} className={toolbarBtnClass} title="Adjust Contrast">
            <Sun size={18} />
          </button>
          <button onClick={handleZoomIn} className={toolbarBtnClass} title="Zoom In">
            <ZoomIn size={18} />
          </button>
          <button onClick={handleZoomOut} className={toolbarBtnClass} title="Zoom Out">
            <ZoomOut size={18} />
          </button>
          <button onClick={handleReset} className={toolbarBtnClass} title="Reset">
            <RotateCcw size={18} />
          </button>
          <div className="w-px h-5 bg-gray-300 mx-1"></div>
          <button onClick={onAddToNotes} className={toolbarBtnClass} title="Add to Notes">
            <FileText size={18} />
          </button>
        </div>
      </div>
    </DraggableModal>
  );
}
