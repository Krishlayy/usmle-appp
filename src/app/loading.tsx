import { Loader } from '@/components/ui/Loader';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[99999] bg-[var(--background)] flex flex-col items-center justify-center">
      <Loader size="lg" />
    </div>
  );
}
