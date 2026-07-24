import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import UnblockButton from '../users/UnblockButton';
import PurchaseSearch from '../purchases/PurchaseSearch';
import UserTable from '../components/UserTable';

export const dynamic = 'force-dynamic';

export default async function AdminStudentsPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !['ADMIN', 'SUPERADMIN'].includes(session.user.role)) {
    redirect('/dashboard');
  }

  const search = typeof searchParams.search === 'string' ? searchParams.search : '';
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : 'date_desc';

  let orderBy: any = { createdAt: 'desc' };
  if (sort === 'date_asc') orderBy = { createdAt: 'asc' };
  if (sort === 'name_asc') orderBy = { name: 'asc' };
  if (sort === 'name_desc') orderBy = { name: 'desc' };

  const students = await prisma.user.findMany({
    where: {
      role: 'STUDENT',
      ...(search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ]
      } : {})
    },
    orderBy,
    include: {
      _count: {
        select: { purchases: true, testSessions: true },
      },
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Student Directory</h1>
      </div>

      <PurchaseSearch />

      <UserTable users={students} type="student" />
    </div>
  );
}
