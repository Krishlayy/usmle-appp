import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { verifyQbankAccess } from '@/lib/verifyQbankAccess';
import { QBankSidebar } from '@/components/QBankSidebar';

export default async function QBankLayout(
  props: {
    children: React.ReactNode;
    params: Promise<{ qbankSlug: string }>;
  }
) {
  const params = await props.params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    redirect('/login');
  }

  const qbank = await prisma.qBank.findUnique({
    where: { slug: params.qbankSlug },
    select: { id: true, slug: true, title: true, isActive: true },
  });

  if (!qbank) {
    notFound();
  }

  // Strict enterprise access gate for all sub-routes (/setup, /test, /session, /notes, etc.)
  try {
    await verifyQbankAccess(session.user.id, qbank.id);
  } catch {
    redirect(`/qbanks/${qbank.slug}?locked=1`);
  }

  return (
    <div className="flex h-[calc(100vh-56px)] flex-1 overflow-hidden bg-white text-slate-900">
      <QBankSidebar qbankSlug={params.qbankSlug} />
      <div className="flex-1 overflow-y-auto">
        {props.children}
      </div>
    </div>
  );
}
