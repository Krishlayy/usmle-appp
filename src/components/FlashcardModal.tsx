import { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface FlashcardModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionId: string;
  qbankSlug: string;
  initialFront?: string;
  initialBack?: string;
}

export function FlashcardModal({ isOpen, onClose, questionId, qbankSlug, initialFront = '', initialBack = '' }: FlashcardModalProps) {
  const [front, setFront] = useState(initialFront);
  const [back, setBack] = useState(initialBack);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!front.trim() || !back.trim()) {
      setError('Both front and back are required.');
      return;
    }
    
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`/api/qbanks/${qbankSlug}/flashcards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId,
          front,
          back
        })
      });

      if (!res.ok) {
        throw new Error('Failed to save flashcard');
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFront('');
        setBack('');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded shadow-2xl w-full max-w-lg flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="font-bold text-lg text-gray-900">Create Flashcard</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded text-sm border border-red-200 font-medium">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 text-emerald-700 p-3 rounded text-sm border border-emerald-200 font-medium">
              Flashcard saved successfully!
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Front (Question)</label>
            <textarea 
              value={front}
              onChange={(e) => setFront(e.target.value)}
              className="w-full h-24 p-3 border border-gray-300 rounded focus:ring-black focus:border-black resize-none"
              placeholder="What is..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Back (Answer)</label>
            <textarea 
              value={back}
              onChange={(e) => setBack(e.target.value)}
              className="w-full h-32 p-3 border border-gray-300 rounded focus:ring-black focus:border-black resize-none"
              placeholder="The answer is..."
            />
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <Button 
            onClick={onClose}
            variant="secondary"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            isLoading={isSaving}
            variant="primary"
          >
            Save Card
          </Button>
        </div>
      </div>
    </div>
  );
}
