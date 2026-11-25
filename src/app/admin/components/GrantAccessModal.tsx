'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, Check, X, ShieldPlus } from 'lucide-react';

interface GrantAccessModalProps {
  userId: string;
  userEmail: string;
  qbanks: { id: string; title: string; slug: string }[];
}

export function GrantAccessModal({ userId, userEmail, qbanks }: GrantAccessModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedQBankId, setSelectedQBankId] = useState(qbanks[0]?.id || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleGrant = async () => {
    if (!selectedQBankId) return;
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, qbankId: selectedQBankId }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to grant access');
      }
      setMessage('Access granted successfully!');
      setTimeout(() => {
        setIsOpen(false);
        setMessage('');
        router.refresh();
      }, 1000);
    } catch (err: any) {
      alert(err.message || 'Error granting access');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
        title="Grant Question Bank License to this user"
      >
        <KeyRound className="h-3 w-3" />
        + Grant Bank
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldPlus className="h-5 w-5 text-emerald-700" />
                <h3 className="font-semibold text-slate-900 text-base">Grant QBank Access</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-500 mb-1">Target Candidate</label>
                <div className="text-sm font-medium text-slate-900 bg-slate-50 p-2.5 rounded border border-slate-200">
                  {userEmail}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-500 mb-1">Select Question Bank</label>
                <select
                  value={selectedQBankId}
                  onChange={(e) => setSelectedQBankId(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-white text-slate-900 focus:outline-teal-600"
                >
                  {qbanks.map((qb) => (
                    <option key={qb.id} value={qb.id}>
                      {qb.title}
                    </option>
                  ))}
                </select>
              </div>

              {message && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-800 flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  {message}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleGrant}
                className="px-4 py-2 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Granting...' : 'Confirm License Grant'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
