import { FileText, Bookmark } from 'lucide-react';

export const SmartContextMenu = ({ 
  top, left, onNote, onFlashcard, onClose 
}: { 
  top: number, left: number, onNote: () => void, onFlashcard: () => void, onClose: () => void 
}) => {
  return (
    <div 
      className="fixed z-[100] flex items-center gap-2 px-3 py-2 bg-white shadow-xl rounded-lg border border-gray-200 -translate-x-1/2 -translate-y-[calc(100%+10px)]"
      style={{ top, left }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <button onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onNote(); onClose(); }} className="p-1 hover:bg-gray-100 rounded text-gray-500" title="Add to Notebook">
        <FileText className="w-4 h-4" />
      </button>
      <button onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onFlashcard(); onClose(); }} className="p-1 hover:bg-gray-100 rounded text-gray-500" title="Create Flashcard">
        <Bookmark className="w-4 h-4" />
      </button>
    </div>
  );
};
