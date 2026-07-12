import { QBankSidebar } from '@/components/QBankSidebar';

export default function QBankLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { qbankSlug: string };
}) {
  return (
    <div className="flex flex-1 overflow-hidden h-[calc(100vh-64px)]">
      <QBankSidebar qbankSlug={params.qbankSlug} />
      <main className="flex-1 overflow-y-auto bg-slate-50">
        {children}
      </main>
    </div>
  );
}
