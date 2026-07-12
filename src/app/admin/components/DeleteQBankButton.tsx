'use client';

import { useFormStatus } from 'react-dom';
import { deleteQBank } from '@/app/admin/actions';
import { useState } from 'react';

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="bg-red-600 text-white px-4 py-2 rounded-md font-medium hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50"
    >
      {pending ? 'Deleting...' : 'Delete QBank'}
    </button>
  );
}

export function DeleteQBankButton({ qbankId, title }: { qbankId: string, title: string }) {
  const [showConfirm, setShowConfirm] = useState(false);

  if (!showConfirm) {
    return (
      <button 
        type="button" 
        onClick={() => setShowConfirm(true)}
        className="bg-red-100 text-red-700 px-4 py-2 rounded-md font-medium hover:bg-red-200 transition-colors shadow-sm text-sm"
      >
        Delete QBank
      </button>
    );
  }

  return (
    <div className="bg-red-50 p-4 border border-red-200 rounded-md mt-6">
      <h3 className="text-red-800 font-bold mb-2">Are you absolutely sure?</h3>
      <p className="text-red-600 text-sm mb-4">
        This will permanently delete <strong>{title}</strong> along with all of its questions, media, user purchases, and test session history. This action cannot be undone.
      </p>
      <div className="flex gap-3">
        <form action={deleteQBank}>
          <input type="hidden" name="id" value={qbankId} />
          <SubmitButton />
        </form>
        <button 
          type="button" 
          onClick={() => setShowConfirm(false)}
          className="bg-white text-slate-700 px-4 py-2 border border-slate-300 rounded-md font-medium hover:bg-slate-50 transition-colors text-sm shadow-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
