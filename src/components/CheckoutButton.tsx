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
    <Button
      type="button"
      variant="secondary"
      onClick={handleCheckout}
      isLoading={loading}
      className="w-full h-11"
    >
      {loading ? 'Processing...' : 'Buy Now'}
    </Button>
  );
}
