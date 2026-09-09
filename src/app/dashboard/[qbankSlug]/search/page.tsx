import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { isFeatureEnabled } from '@/lib/featureFlags';
import { SearchClient } from './SearchClient';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Search } from 'lucide-react';

export const metadata = {
  title: 'Unified Search | Micro Q-Bank',
  description: 'Search across USMLE questions, Medical Library articles, ReadyDecks, and personal notes.',
};

export default async function SearchPage(props: {
  params: Promise<{ qbankSlug: string }>;
}) {
  const params = await props.params;
  const qbank = await prisma.qBank.findUnique({
    where: { slug: params.qbankSlug },
    select: { id: true, slug: true, title: true },
  });

  if (!qbank) {
    notFound();
  }

  const enabled = await isFeatureEnabled('UNIFIED_SEARCH');

  if (!enabled) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-4">
        <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center mx-auto">
          <Search className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Unified Search</h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Unified search functionality is currently undergoing maintenance. Please check back shortly.
        </p>
        <Link href={`/dashboard/${qbank.slug}`}>
          <Button variant="secondary" size="sm">
            Back to QBank Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-6">
      <SearchClient qbankSlug={qbank.slug} qbankTitle={qbank.title} />
    </div>
  );
}
