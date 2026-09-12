import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ReportDashboardClient from './ReportDashboardClient';

export default async function AdminReportsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || !['ADMIN', 'SUPERADMIN', 'CONTRIBUTOR'].includes((session.user as any).role)) {
    redirect('/dashboard');
  }

  return <ReportDashboardClient />;
}