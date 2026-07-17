'use client';

import { useState } from 'react';
import { unblockUser } from '@/app/admin/actions';
import { Loader2 } from 'lucide-react';

export default function UnblockButton({ userId }: { userId: string }) {
  const [isPending, setIsPending] = useState(false);

  return (
    <button 
      onClick={async () => {
        setIsPending(true);
        try {
          await unblockUser(userId);
        } catch (e) {
          console.error(e);
        } finally {
          setIsPending(false);
        }
      }}
      disabled={isPending}
      className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-md text-sm font-semibold transition-colors flex items-center gap-2"
    >
      {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
      Unblock Account
    </button>
  );
}
