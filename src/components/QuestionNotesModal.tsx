'use client';

import React, { useState, useEffect } from 'react';
import { DraggableModal } from './DraggableModal';
import { FileText, Save } from 'lucide-react';

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

  const handleSave = () => {
    onSave(localNotes);
    onClose();
  };

  return (
    <DraggableModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Question Notes" 
      icon={<FileText size={16} />}
      width="500px"
      height="400px"
      minWidth="300px"
      minHeight="300px"
    >
      <div className="flex flex-col h-full bg-[#f4f7f9] p-4">
        <p className="text-xs text-slate-500 mb-3 font-semibold">
          Notes written here will be saved specifically for this question and can be reviewed in your Dashboard later.
        </p>
        <textarea 
          value={localNotes}
          onChange={(e) => setLocalNotes(e.target.value)}
          className="flex-1 p-4 outline-none resize-none text-[14px] bg-white border border-slate-200 rounded-md shadow-sm mb-4 font-sans text-slate-800"
          placeholder="Type your notes for this question here..."
        />
        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 bg-[#003b5c] text-white text-sm font-bold rounded shadow-sm hover:bg-[#004f7a] transition-colors"
          >
            <Save size={16} />
            Save Notes
          </button>
        </div>
      </div>
    </DraggableModal>
  );
}
