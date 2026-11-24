'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export function CheckoutButton({ qbankId }: { qbankId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ qbankId }),
      });

      if (res.status === 401) {
        // Not logged in
        router.push('/login');
        return;
      }

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to create checkout session');
      }

      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert(error instanceof Error ? error.message : 'Checkout failed. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <Button
        type="button"
        variant="primary"
        onClick={handleCheckout}
        isLoading={loading}
        className="w-full h-11"
      >
        {loading ? 'Redirecting to Stripe...' : 'Buy Now'}
      </Button>
      <p className="text-[11px] text-center text-slate-500 font-mono">
        💳 Test Mode &bull; Test Card 4242&hellip;
      </p>
    </div>
  );
}
