'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader } from '@/components/ui/Loader';
import { Button } from '@/components/ui/Button';
import { AuthShell } from '@/components/ui/AuthShell';
import Link from 'next/link';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing verification token.');
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (res.ok) {
          setStatus('success');
          setMessage('Email verified successfully! You can now log in.');
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred during verification.');
      }
    };

    verify();
  }, [token]);

  return (
    <AuthShell eyebrow="Verification" title="Email Verification">
      {status === 'loading' && (
        <div role="status" className="flex items-center gap-3 text-sm text-slate-600">
          <Loader className="h-5 w-5" />
          <p>{message}</p>
        </div>
      )}

      {status === 'success' && (
        <div className="space-y-6">
          <p role="status" className="text-sm leading-relaxed text-teal-800">{message}</p>
          <Link href="/login" className="block">
            <Button className="h-11 w-full text-sm">Proceed to Login</Button>
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-6">
          <p role="alert" className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</p>
          <Link href="/signup" className="block">
            <Button variant="secondary" className="h-11 w-full text-sm text-slate-900">
              Back to Sign Up
            </Button>
          </Link>
        </div>
      )}
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[calc(100vh-56px)] items-center justify-center"><Loader className="h-5 w-5" /></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}