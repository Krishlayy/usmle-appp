'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
      alert('Checkout failed. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCheckout}
      disabled={loading}
      className="flex w-full items-center justify-center rounded-md text-base font-medium transition-colors bg-gray-900 text-gray-50 shadow hover:bg-gray-900/90 h-12 px-8 mb-4 disabled:opacity-50"
    >
      {loading ? 'Processing...' : 'Buy Now'}
    </button>
  );
}
