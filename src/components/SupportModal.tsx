'use client';

import React, { useState } from 'react';
import { X, MessageSquare, Send, CheckCircle2, HelpCircle } from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  qbankTitle?: string;
}

export function SupportModal({ isOpen, onClose, qbankTitle }: SupportModalProps) {
  const [subject, setSubject] = useState(qbankTitle ? `Inquiry regarding: ${qbankTitle}` : 'General Platform Inquiry');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<'content' | 'technical' | 'account'>('content');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setMessage('');
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl md:p-8">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          aria-label="Close support modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-teal-50 border border-teal-200 text-teal-700">
            <HelpCircle className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-medium text-slate-900">Medical Faculty Support</h2>
            <p className="text-xs text-slate-500">Contact our board physicians & technical support team</p>
          </div>
        </div>

        {submitted ? (
          <div className="py-12 text-center animate-in zoom-in-95 duration-200">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-teal-50 text-teal-700">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="font-serif text-lg font-medium text-slate-900">Message Dispatched</h3>
            <p className="mt-2 text-sm text-slate-600 max-w-xs mx-auto">
              Our clinical faculty will review your inquiry and reply via email within 4 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Category
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'content', label: 'Clinical Question' },
                  { id: 'technical', label: 'Video / Bug' },
                  { id: 'account', label: 'Account Access' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setCategory(t.id as any)}
                    className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                      category === t.id
                        ? 'border-teal-600 bg-teal-50/70 text-teal-800 font-semibold shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Subject
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Your Query / Feedback
              </label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about distractor rationales, mnemonic details, or report an issue..."
                className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-800 transition-colors shadow-sm"
              >
                <Send className="h-4 w-4" /> Send Inquiry
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
