'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RoleSelector({ 
  userId, 
  currentRole,
  disabled
}: { 
  userId: string; 
  currentRole: string;
  disabled: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRoleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value;
    
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      e.target.value = currentRole;
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }
      
      router.refresh();
    } catch (error: unknown) {
      alert(`Error updating role: ${error instanceof Error ? error.message : 'Unknown error'}`);
      e.target.value = currentRole;
    } finally {
      setLoading(false);
    }
  };

  if (disabled) {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800`}>
        {currentRole}
      </span>
    );
  }

  return (
    <select 
      disabled={loading}
      value={currentRole}
      onChange={handleRoleChange}
      className={`text-xs font-medium rounded-full px-2 py-1 border-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
        currentRole === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
      }`}
    >
      <option value="STUDENT">STUDENT</option>
      <option value="ADMIN">ADMIN</option>
    </select>
  );
}
