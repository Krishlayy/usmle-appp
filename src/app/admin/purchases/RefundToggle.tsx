'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RefundToggle({ 
  purchaseId, 
  currentStatus
}: { 
  purchaseId: string; 
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const toggleRefund = async () => {
    const newStatus = currentStatus === 'active' ? 'refunded' : 'active';
    
    if (!window.confirm(`Are you sure you want to mark this purchase as ${newStatus}? (Note: This does NOT automatically refund via Stripe, you must do that manually).`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/purchases/${purchaseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }
      
      router.refresh();
    } catch (error: unknown) {
      alert(`Error updating purchase: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={toggleRefund}
      disabled={loading}
      className={`text-xs font-semibold px-3 py-1 rounded-md transition-colors ${
        currentStatus === 'active' 
          ? 'bg-red-50 text-red-600 hover:bg-red-100' 
          : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
      }`}
    >
      {loading ? '...' : (currentStatus === 'active' ? 'Mark Refunded' : 'Mark Active')}
    </button>
  );
}
