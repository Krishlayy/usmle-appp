import { AlertTriangle, Mail } from 'lucide-react';
import Link from 'next/link';

export default function BlockedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 border-t-4 border-red-600 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Account Suspended</h1>
        
        <p className="text-gray-600 mb-6 leading-relaxed">
          Your account has been temporarily blocked due to repeated violations of our Anti-Cheat Security System. We enforce strict policies against copying, pasting, and navigating away from the test window to protect the integrity of our questions.
        </p>

        <div className="bg-gray-100 p-4 rounded-lg text-left mb-8">
          <p className="text-sm font-semibold text-gray-800 mb-2">How to restore access:</p>
          <p className="text-sm text-gray-600">
            Please submit a formal email explaining the situation and confirming your adherence to our testing policies moving forward. 
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <a 
            href="mailto:admin@example.com?subject=Account%20Suspension%20Appeal"
            className="flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            <Mail className="w-5 h-5" />
            Email Administration
          </a>
          <Link 
            href="/login"
            className="text-gray-500 hover:text-gray-700 text-sm font-semibold py-2"
          >
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
