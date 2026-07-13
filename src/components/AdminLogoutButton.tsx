'use client';

import { signOut } from 'next-auth/react';

export default function AdminLogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="block w-full px-4 py-2 text-center rounded-md bg-red-900/50 hover:bg-red-800/50 text-red-200 transition-colors text-sm font-medium"
    >
      Log Out
    </button>
  );
}
