'use client';

import { useEffect, useState } from 'react';

export function TestSecurityOverlay({ 
  userEmail, 
  userIp, 
  children 
}: { 
  userEmail: string; 
  userIp: string; 
  children: React.ReactNode; 
}) {
  const [violationCount, setViolationCount] = useState(0);
  const [showViolationWarning, setShowViolationWarning] = useState(false);
  const [realIp, setRealIp] = useState(userIp);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Fetch real IP if server didn't catch it or if it's local
    if (userIp === 'Unknown IP' || !userIp || userIp === '::1' || userIp === '1' || userIp === '127.0.0.1') {
      fetch('https://api.ipify.org?format=json')
        .then(res => res.json())
        .then(data => { if (data.ip) setRealIp(data.ip); })
        .catch(() => setRealIp('Local Environment'));
    }

    // Anti-cheat listeners have been temporarily disabled.
    // Floating IP watermark remains active.
  }, [userEmail, userIp, isProcessing]);

  const svgWatermark = `<svg xmlns='http://www.w3.org/2000/svg' version='1.1' height='350px' width='850px'>
    <g transform='rotate(-35 425 175)' fill='#9ca3af' font-family='system-ui, sans-serif' font-weight='600' opacity='0.12' text-anchor='middle'>
      <text x='50%' y='45%' font-size='26'>${userEmail}</text>
      <text x='50%' y='60%' font-size='22'>IP: ${realIp}</text>
    </g>
  </svg>`;

  const encodedSvg = typeof window !== 'undefined' ? window.btoa(svgWatermark) : '';
  const bgUrl = `url("data:image/svg+xml;base64,${encodedSvg}")`;

  return (
    <div className="relative w-full h-full min-h-screen">
      <style>{`
        @keyframes driftWatermark {
          from { background-position: 0 0; }
          to { background-position: 850px 350px; }
        }
      `}</style>
      
      {/* Floating Diagonal Grid Watermark */}
      <div 
        className="pointer-events-none fixed inset-0 z-[9999] mix-blend-multiply"
        style={{
          backgroundImage: bgUrl,
          animation: 'driftWatermark 40s linear infinite'
        }}
      />

      {showViolationWarning && (
        <div className="fixed inset-0 bg-black/80 z-[10000] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-2xl text-center border-t-8 border-red-600">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Security Violation Detected</h2>
            <div className="inline-block bg-red-100 text-red-800 px-4 py-1 rounded-full font-bold mb-4 tracking-wide">
              WARNING {violationCount} OF 2
            </div>
            <p className="text-slate-700 mb-6 font-medium">
              You have performed a prohibited action (Right-Click, Screenshot, Windows Key, etc). 
            </p>
            <p className="text-slate-600 text-sm mb-6 bg-slate-100 p-3 rounded">
              Your IP Address (<strong>{realIp}</strong>) and Email (<strong>{userEmail}</strong>) have been logged. <br/><br/>
              <strong className="text-red-600">On your 3rd violation, your account will be permanently blocked.</strong>
            </p>
            <button 
              onClick={() => setShowViolationWarning(false)}
              className="bg-red-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-red-700 w-full transition-colors"
            >
              I Understand & Will Not Repeat
            </button>
          </div>
        </div>
      )}

      {children}
    </div>
  );
}
