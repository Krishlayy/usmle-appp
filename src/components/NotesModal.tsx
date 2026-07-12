'use client';

import { useState } from 'react';
import { X, Save } from 'lucide-react';

interface NotesModalProps {
  initialNotes: string;
  onSave: (notes: string) => void;
  onClose: () => void;
}

export function NotesModal({ initialNotes, onSave, onClose }: NotesModalProps) {
  const [notes, setNotes] = useState(initialNotes);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-md shadow-2xl w-full max-w-2xl flex flex-col h-[500px]">
        <div className="flex items-center justify-between p-4 border-b bg-slate-50 rounded-t-md">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            My Notes
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:bg-slate-200 p-1.5 rounded transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 p-4">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full h-full p-4 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none resize-none font-medium text-slate-700 bg-yellow-50"
            placeholder="Type your personal notes for this question here..."
          />
        </div>
        <div className="p-4 border-t bg-slate-50 rounded-b-md flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-200 rounded transition-colors">
            Cancel
          </button>
          <button 
            onClick={() => { onSave(notes); onClose(); }} 
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded flex items-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" /> Save Notes
          </button>
        </div>
      </div>
    </div>
  );
}
