'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function DeleteQuestionButton({ questionId }: { questionId: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      return;
    }
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/questions/${questionId}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        throw new Error(await res.text());
      }
      
      router.refresh();
    } catch (error: unknown) {
      alert(`Error deleting question: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="bg-red-50 text-red-600 px-3 py-1.5 rounded text-sm font-medium hover:bg-red-100 shrink-0 disabled:opacity-50"
    >
      {isDeleting ? 'Deleting...' : 'Delete'}
    </button>
  );
}
