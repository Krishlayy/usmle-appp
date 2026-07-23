'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import { SuccessToast } from './SuccessToast';

export function LayoutUIWrapper() {
  const pathname = usePathname();

  // Hide the global consumer Navbar and Toasts inside the Admin Panel, Dashboard, and Test screens
  if (pathname && (pathname.startsWith('/admin') || pathname.startsWith('/dashboard') || pathname.includes('/test/') || pathname.includes('/session/'))) {
    return null;
  }

  return (
    <>
      <Navbar />
      <SuccessToast />
    </>
  );
}
