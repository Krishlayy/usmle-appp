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

  return (
    <div className="flex flex-1 overflow-hidden h-[calc(100vh-64px)]">
      <QBankSidebar qbankSlug={params.qbankSlug} />
      <main className="flex-1 overflow-y-auto bg-slate-50">
        {children}
      </main>
    </div>
  );
}
