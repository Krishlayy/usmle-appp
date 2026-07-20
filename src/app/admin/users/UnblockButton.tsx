'use client';

import { useState } from 'react';
import { unblockUser } from '@/app/admin/actions';
import { Loader } from '@/components/ui/Loader';
import { Button } from '@/components/ui/Button';

export default function UnblockButton({ userId }: { userId: string }) {
  const [isPending, setIsPending] = useState(false);

  return (
    <Button 
      variant="secondary"
      size="sm"
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
      isLoading={isPending}
      className="!bg-red-50 !text-red-700 !border-red-200 hover:!bg-red-100 hover:!border-red-300"
    >
      Unblock Account
    </Button>
  );
}
