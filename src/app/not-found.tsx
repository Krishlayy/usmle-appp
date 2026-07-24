import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-56px)] bg-[var(--color-surface-subtle)] flex flex-col items-center justify-center p-6 animate-page-enter text-center">
      <div className="max-w-md w-full space-y-8 flex flex-col items-center">
        
        <div className="space-y-4">
          <h1 className="text-[120px] font-bold leading-none tracking-tighter text-[var(--color-primary)] opacity-10">
            404
          </h1>
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-primary)]">
            Page not found
          </h2>
          <p className="text-[var(--color-secondary)] text-sm max-w-sm mx-auto">
            The page you are looking for doesn't exist or has been moved. Check the URL or navigate back to safety.
          </p>
        </div>

        <div className="pt-8">
          <Link href="/dashboard">
            <Button variant="primary" className="gap-2 shadow-sm">
              <ArrowLeft className="w-4 h-4" /> Return to Dashboard
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
