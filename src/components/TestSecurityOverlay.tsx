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

    const triggerViolation = async (reason: string) => {
      if (isProcessing) return;
      setIsProcessing(true);
      
      try {
        const res = await fetch('/api/security/violation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: reason })
        });
        const data = await res.json();
        
        if (data.blocked) {
          window.location.href = '/blocked';
        } else {
          setViolationCount(data.violations || 1);
          setShowViolationWarning(true);
        }
      } catch (err) {
        console.error('Violation tracking error', err);
      } finally {
        setTimeout(() => setIsProcessing(false), 1000);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const isPrintScreen = e.key === 'PrintScreen';
      const isDevTools = e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I');
      const isSave = e.ctrlKey && e.key === 's';
      const isMeta = e.key === 'Meta' || e.key === 'OS';
      
      if (isPrintScreen || isDevTools || isSave || isMeta) {
        e.preventDefault();
        triggerViolation('Keyboard Violation: ' + e.key);
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      // Temporarily disabled right-click violation because it false-flags double taps on Macbooks
      // triggerViolation('Right Click Violation');
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerViolation('Tab Switching / Window Hidden');
      }
    };

    const handleCopyPaste = (e: Event) => {
      e.preventDefault();
      triggerViolation('Copy/Paste attempted');
    };

    const handleBlur = () => {
      setTimeout(() => {
        if (!document.hasFocus()) {
          triggerViolation('Window lost focus');
        }
      }, 200);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);
    document.addEventListener('cut', handleCopyPaste);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
      document.removeEventListener('cut', handleCopyPaste);
      window.removeEventListener('blur', handleBlur);
    };
  }, [userEmail, userIp, isProcessing]);

  return (
    <div className="relative w-full h-full min-h-screen">
      {/* Watermark Overlay */}
      <div 
        className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden flex flex-wrap justify-center content-center select-none"
        style={{
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' version='1.1' height='400px' width='1000px'><g transform='rotate(-45 500 200)' fill='%23000' font-family='Arial' font-weight='bold' opacity='0.3' text-anchor='middle'><text x='50%' y='40%' font-size='32'>${encodeURIComponent(userEmail)}</text><text x='50%' y='55%' font-size='28'>IP: ${encodeURIComponent(realIp)}</text></g></svg>")`,
          backgroundRepeat: 'repeat',
        }}
      >
      </div>

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
