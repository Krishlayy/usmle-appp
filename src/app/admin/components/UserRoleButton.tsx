'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

interface UserRoleButtonProps {
  userId: string;
  currentRole: string;
  userEmail: string;
}

export function UserRoleButton({ userId, currentRole, userEmail }: UserRoleButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (currentRole === 'SUPERADMIN') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium text-purple-700 bg-purple-50 border border-purple-200">
        Primary Superadmin
      </span>
    );
  }

  const handleRoleChange = async (targetRole: 'ADMIN' | 'STUDENT') => {
    const confirmMessage = targetRole === 'ADMIN'
      ? `Promote ${userEmail} to Administrator? They will have full access to manage QBanks, questions, and view user records.`
      : `Revoke administrator access for ${userEmail}? They will become a standard Student account.`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: targetRole }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to update user role');
      }

      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Error updating user role');
    } finally {
      setLoading(false);
    }
  };

  if (currentRole === 'STUDENT') {
    return (
      <button
        type="button"
        disabled={loading}
        onClick={() => handleRoleChange('ADMIN')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 hover:text-blue-800 transition-colors disabled:opacity-50 cursor-pointer"
        title="Grant Admin access to this user"
      >
        <ShieldCheck className="h-3.5 w-3.5" />
        {loading ? 'Promoting...' : '+ Grant Admin'}
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => handleRoleChange('STUDENT')}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 hover:text-amber-800 transition-colors disabled:opacity-50 cursor-pointer"
      title="Revoke Admin access and return to Student"
    >
      <ShieldAlert className="h-3.5 w-3.5" />
      {loading ? 'Demoting...' : 'Revoke Admin'}
    </button>
  );
}
