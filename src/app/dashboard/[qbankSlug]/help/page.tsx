'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
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

  const focusRing = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300';
  const field =
    `w-full rounded-md border border-white/15 bg-white/[0.04] p-3 text-sm text-white placeholder:text-slate-500 transition-colors hover:border-white/30 focus:border-teal-300 ${focusRing}`;
  const faqs = [
    { q: 'How do I review past tests?', a: 'You can view all your previously completed and suspended tests by navigating to the "Previous Tests" tab in the sidebar. Click on any test to see detailed analytics or review the questions.' },
    { q: 'How is my performance calculated?', a: 'Your performance is tracked across all completed blocks. The Results page compares your most recent block score with your immediately preceding block to show a trend, and breaks down your accuracy by subtopic.' },
    { q: 'Where can I see my notes?', a: 'During a test, you can add notes to a specific question. These notes are automatically saved and aggregated under the "Notes" tab in your dashboard, sorted by the date you took the note.' },
  ];

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 md:px-10 md:py-16">
      <div className="mb-10 border-b border-white/10 pb-6">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-teal-300/80">Support</p>
        <h1 className="font-serif text-4xl font-medium tracking-tight text-white">Help &amp; Support</h1>
        <p className="mt-2 text-sm text-slate-400">We&apos;re here to help you get the most out of your QBank.</p>
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <section>
          <h2 className="mb-5 text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((f) => (
              <div key={f.q} className="rounded-lg border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
                <h3 className="mb-2 font-serif text-lg font-medium text-white">{f.q}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
            <h2 className="mb-2 font-serif text-xl font-medium text-white">Contact Support</h2>
            <p className="mb-6 text-sm text-slate-400">Which difficulty are you facing? Select an option below to generate an email to our support team.</p>

            <div className="space-y-5">
              <div>
                <label htmlFor="issue-category" className="mb-2 block font-mono text-[11px] uppercase tracking-[0.18em] text-slate-400">Issue Category</label>
                <select
                  id="issue-category"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className={field}
                >
                  <option value="" disabled>Select the difficulty you are facing...</option>
                  {difficulties.map((diff, idx) => (
                    <option key={idx} value={diff} className="bg-[#0d1219]">{diff}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="issue-details" className="mb-2 block font-mono text-[11px] uppercase tracking-[0.18em] text-slate-400">Additional Details</label>
                <textarea
                  id="issue-details"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Describe your issue in more detail here..."
                  className={`${field} h-32 resize-none`}
                />
              </div>

              <button
                type="button"
                onClick={handleEmailSupport}
                disabled={!difficulty}
                className={`flex w-full items-center justify-center gap-2 rounded-md bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-teal-200 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing} focus-visible:outline-offset-2`}
              >
                {submitted ? <CheckCircle2 size={16} aria-hidden /> : <Send size={16} aria-hidden />}
                {submitted ? 'Email Opened in Client' : 'Generate Support Email'}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}