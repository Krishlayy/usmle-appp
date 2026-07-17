'use client';

import React, { useState, useEffect } from 'react';
import { DraggableModal } from './DraggableModal';
import { FileText, Plus, Trash2 } from 'lucide-react';

export interface NoteItem {
  id: string;
  title: string;
  content: string;
}

interface NotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: NoteItem[];
  onUpdateNotes: (notes: NoteItem[]) => void;
  initialSelectedId?: string | null;
  appendContent?: string | null;
}

export function NotebookModal({ isOpen, onClose, notes, onUpdateNotes, initialSelectedId, appendContent }: NotebookModalProps) {
  const [localNotes, setLocalNotes] = useState<NoteItem[]>(notes.length > 0 ? notes : [{ id: '1', title: 'Note 1', content: '' }]);
  const [activeId, setActiveId] = useState<string>(initialSelectedId || (notes.length > 0 ? notes[0].id : '1'));

  useEffect(() => {
    if (appendContent) {
      setLocalNotes(prev => prev.map(n => 
        n.id === activeId ? { ...n, content: n.content + (n.content ? '\\n\\n' : '') + appendContent } : n
      ));
    }
  }, [appendContent, activeId]);

  useEffect(() => {
    onUpdateNotes(localNotes);
  }, [localNotes, onUpdateNotes]);

  const activeNote = localNotes.find(n => n.id === activeId) || localNotes[0];

  const handleAddNote = () => {
    const newNote = {
      id: Date.now().toString(),
      title: `Note ${localNotes.length + 1}`,
      content: ''
    };
    setLocalNotes([...localNotes, newNote]);
    setActiveId(newNote.id);
  };

  const handleDelete = (id: string) => {
    if (localNotes.length === 1) return; // keep at least one
    const newNotes = localNotes.filter(n => n.id !== id);
    setLocalNotes(newNotes);
    if (activeId === id) setActiveId(newNotes[0].id);
  };

  const updateActiveNote = (content: string) => {
    setLocalNotes(localNotes.map(n => n.id === activeId ? { ...n, content } : n));
  };

  const updateActiveTitle = (title: string) => {
    setLocalNotes(localNotes.map(n => n.id === activeId ? { ...n, title } : n));
  };

  return (
    <DraggableModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Notebook" 
      icon={<FileText size={16} />}
      width="600px"
      height="450px"
      minWidth="400px"
      minHeight="300px"
    >
      <div className="flex h-full bg-white font-sans">
        {/* Sidebar */}
        <div className="w-1/3 border-r border-gray-300 flex flex-col bg-[#f4f4f4]">
          <div className="p-2 border-b border-gray-300 flex justify-between items-center bg-[#e0e0e0]">
            <span className="font-bold text-[13px]">My Notes</span>
            <button onClick={handleAddNote} className="p-1 hover:bg-gray-300 rounded" title="New Note">
              <Plus size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {localNotes.map(note => (
              <div 
                key={note.id} 
                className={`flex items-center justify-between p-2 cursor-pointer text-[13px] border-b border-gray-200 ${activeId === note.id ? 'bg-white font-bold' : 'hover:bg-gray-200'}`}
                onClick={() => setActiveId(note.id)}
              >
                <span className="truncate">{note.title}</span>
                {localNotes.length > 1 && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }}
                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Editor */}
        <div className="flex-1 flex flex-col">
          <div className="p-2 border-b border-gray-300 bg-[#f4f4f4]">
            <input 
              type="text" 
              value={activeNote?.title || ''}
              onChange={(e) => updateActiveTitle(e.target.value)}
              className="w-full bg-transparent font-bold text-[14px] outline-none"
              placeholder="Note Title"
            />
          </div>
          <textarea 
            value={activeNote?.content || ''}
            onChange={(e) => updateActiveNote(e.target.value)}
            className="flex-1 p-3 outline-none resize-none text-[13px] bg-[#fffdf0]"
            placeholder="Type your notes here..."
          />
        </div>
      </div>
    </DraggableModal>
  );
}
