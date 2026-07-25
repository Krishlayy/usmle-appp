'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import { SuccessToast } from './SuccessToast';

export function LayoutUIWrapper() {
  const pathname = usePathname();

  // Hide the global consumer Navbar on home page (which renders its picture-perfect custom header matching design), Admin Panel and Test screens
  if (pathname === '/') {
    return <SuccessToast />;
  }
  if (pathname && (pathname.startsWith('/admin') || pathname.includes('/test/') || pathname.includes('/session/'))) {
    return null;
  }

  return (
    <>
      <Navbar />
      <SuccessToast />
    </>
  );
}
