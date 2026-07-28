'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Loader } from '@/components/ui/Loader';
import { Button } from '@/components/ui/Button';
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
    <Card className="max-w-md w-full p-8 text-center space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Email Verification</h1>
      
      {status === 'loading' && (
        <div className="flex flex-col items-center justify-center py-4 space-y-4">
          <Loader className="w-8 h-8 text-[#0D9488]" />
          <p className="text-gray-600">{message}</p>
        </div>
      )}

      {status === 'success' && (
        <div className="space-y-6">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-gray-900 font-medium">{message}</p>
          <Link href="/login" className="block">
            <Button className="w-full bg-[#0D9488] hover:bg-[#0a7d6f] text-white">
              Proceed to Login
            </Button>
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-6">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-red-600 font-medium">{message}</p>
          <Link href="/signup" className="block">
            <Button variant="secondary" className="w-full border-[#E5E7EB] text-gray-700 hover:bg-gray-50">
              Back to Sign Up
            </Button>
          </Link>
        </div>
      )}
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-[#F8FAF9] flex items-center justify-center p-4">
      <Suspense fallback={<div className="p-8 text-center"><Loader className="w-8 h-8 mx-auto text-[#0D9488]" /></div>}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
