import { QBankSidebar } from '@/components/QBankSidebar';

export default async function QBankLayout(
  props: {
    children: React.ReactNode;
    params: Promise<{ qbankSlug: string }>;
  }
) {
  const params = await props.params;

  const {
    children
  } = props;

  // The root layout already provides <main>; this region is a plain container.
  return (
    <div className="flex h-[calc(100vh-56px)] flex-1 overflow-hidden bg-white text-slate-900">
      <QBankSidebar qbankSlug={params.qbankSlug} />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}