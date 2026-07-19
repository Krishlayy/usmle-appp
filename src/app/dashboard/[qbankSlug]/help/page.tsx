'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { HelpCircle, Mail, Send, CheckCircle2 } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function HelpPage() {
  const params = useParams();
  const qbankSlug = params.qbankSlug as string;

  const [difficulty, setDifficulty] = useState<string>('');
  const [customText, setCustomText] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  const difficulties = [
    "I'm having trouble understanding the explanations",
    "Technical issue: Questions are not loading",
    "Technical issue: Images or videos are broken",
    "Billing or subscription inquiry",
    "I want to report an incorrect question",
    "Other (please specify below)"
  ];

  const handleEmailSupport = () => {
    const subject = encodeURIComponent(`Support Request [${qbankSlug}] - ${difficulty || 'General Inquiry'}`);
    const body = encodeURIComponent(`Issue Type: ${difficulty}\n\nDetails:\n${customText}\n\n---\nPlease provide any additional information above.`);
    window.location.href = `mailto:support@microqbank.com?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-6 font-sans">
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-200">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
          <HelpCircle size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Help & Support</h1>
          <p className="text-slate-500 mt-1">We're here to help you get the most out of your QBank.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-2">How do I review past tests?</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                You can view all your previously completed and suspended tests by navigating to the "Previous Tests" tab in the sidebar. Click on any test to see detailed analytics or review the questions.
              </p>
            </div>
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-2">How is my performance calculated?</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Your performance is tracked across all completed blocks. The Results page compares your most recent block score with your immediately preceding block to show a trend, and breaks down your accuracy by subtopic.
              </p>
            </div>
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-2">Where can I see my notes?</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                During a test, you can add notes to a specific question. These notes are automatically saved and aggregated under the "Notes" tab in your dashboard, sorted by the date you took the note.
              </p>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Contact Support</h2>
            <p className="text-sm text-slate-500 mb-6">Which difficulty are you facing? Select an option below to generate an email to our support team.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Issue Category</label>
                <select 
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-slate-700 shadow-sm"
                >
                  <option value="" disabled>Select the difficulty you are facing...</option>
                  {difficulties.map((diff, idx) => (
                    <option key={idx} value={diff}>{diff}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Additional Details</label>
                <textarea 
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Describe your issue in more detail here..."
                  className="w-full p-3 bg-white border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500 text-sm h-32 resize-none shadow-sm"
                />
              </div>

              <button 
                onClick={handleEmailSupport}
                disabled={!difficulty}
                className="w-full flex justify-center items-center gap-2 bg-[#003b5c] hover:bg-[#004f7a] text-white font-bold py-3 px-4 rounded-md transition-colors shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitted ? <CheckCircle2 size={18} /> : <Send size={18} />}
                {submitted ? 'Email Opened in Client' : 'Generate Support Email'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
