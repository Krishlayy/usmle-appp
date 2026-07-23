'use client';

import { ShieldAlert, AlertTriangle } from 'lucide-react';

interface TestSecurityWarningProps {
  onAccept: () => void;
  userId?: string;
  userEmail?: string;
}

export function TestSecurityWarning({ onAccept, userId = 'Unknown', userEmail = 'Unknown' }: TestSecurityWarningProps) {
  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8 border-t-8 border-red-600">
        
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center shrink-0">
            <ShieldAlert className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Security Check Active</h2>
            <p className="text-slate-600">This test is protected by a strict anti-cheat engine.</p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-5 mb-8 border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Strict Rules of Engagement:
          </h3>
          <ul className="space-y-3 text-slate-700 font-medium list-disc pl-5">
            <li><strong className="text-red-600">No Copying or Pasting</strong>: Using Ctrl+C / Ctrl+V is strictly prohibited.</li>
            <li><strong className="text-red-600">No Switching Windows</strong>: Minimizing the browser or switching tabs will immediately suspend the test.</li>
            <li><strong className="text-red-600">No OS Interruptions</strong>: Pressing the Windows key (or Mac Command key) to open the start menu is prohibited.</li>
            <li><strong className="text-red-600">Allowed Keys</strong>: Only standard navigation keys (Arrows, Enter) and options (A-J) are safely permitted during the test.</li>
          </ul>
        </div>

        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4 text-sm font-semibold border border-red-200">
          WARNING: 3 violations will result in an immediate and permanent account suspension. You will be locked out of the dashboard.
        </div>

        <div className="bg-slate-100 p-4 rounded-lg mb-8 text-sm text-slate-600 border border-slate-200">
          Your User ID (<strong>{userId}</strong>) and Email (<strong>{userEmail}</strong>) will be visibly watermarked on the test and recorded if any violations occur.
        </div>

        <div className="flex justify-end gap-4">
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="px-6 py-3 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel and Return
          </button>
          <button 
            onClick={onAccept}
            className="px-6 py-3 font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm transition-colors"
          >
            I Understand, Start Test
          </button>
        </div>

      </div>
    </div>
  );
}
