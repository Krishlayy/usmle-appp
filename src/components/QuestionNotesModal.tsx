'use client';

import React, { useState, useEffect } from 'react';
import { DraggableModal } from './DraggableModal';
import { FileText } from 'lucide-react';

interface QuestionNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialNotes: string;
  onSave: (notes: string) => void;
  appendContent?: string | null;
}

export function QuestionNotesModal({ isOpen, onClose, initialNotes, onSave, appendContent }: QuestionNotesModalProps) {
  const [localNotes, setLocalNotes] = useState(initialNotes || '');

  useEffect(() => {
    setLocalNotes(initialNotes || '');
  }, [initialNotes, isOpen]);

  useEffect(() => {
    if (appendContent) {
      setLocalNotes(prev => prev + (prev ? '\n\n' : '') + appendContent);
    }
  }, [appendContent]);

  const handleSaveAndClose = () => {
    onSave(localNotes);
    onClose();
  };

  const handleDeleteNote = () => {
    setLocalNotes('');
    onSave('');
    onClose();
  };

  return (
    <DraggableModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Notes" 
      icon={<FileText size={15} />}
      width="440px"
      height="340px"
      minWidth="320px"
      minHeight="240px"
    >
      <div className="flex flex-col h-full bg-[#f4f7f9] p-3 font-sans">
        <textarea 
          value={localNotes}
          onChange={(e) => setLocalNotes(e.target.value)}
          className="flex-1 p-3 outline-none resize-none text-[13px] bg-white border border-slate-300 rounded-sm shadow-inner mb-3 font-sans text-slate-900 focus:border-blue-500"
          placeholder="Type notes for this item here..."
          autoFocus
        />
        <div className="flex items-center justify-between border-t border-slate-200 pt-2.5">
          <button 
            type="button"
            onClick={handleSaveAndClose}
            className="px-4 py-1.5 bg-[#e1e4e8] hover:bg-[#d0d4da] border border-slate-400 text-slate-800 text-xs font-bold rounded shadow-xs transition-colors cursor-pointer"
          >
            Save and Close
          </button>
          
          <button 
            type="button"
            onClick={handleDeleteNote}
            className="px-4 py-1.5 bg-[#e1e4e8] hover:bg-rose-100 border border-slate-400 hover:border-rose-400 text-slate-700 hover:text-rose-700 text-xs font-bold rounded shadow-xs transition-colors cursor-pointer"
          >
            Delete Note
          </button>
        </div>
      </div>
    </DraggableModal>
  );
}
