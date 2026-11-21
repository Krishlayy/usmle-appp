import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { ReactNode } from 'react';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  if (session?.user?.id) {
    let user = null;
    try {
      user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { isBlocked: true }
      });
    } catch (err) {
      console.error("DashboardLayout DB Error:", err);
    }

    if (user?.isBlocked) {
      redirect('/blocked');
    }
  }

  return <>{children}</>;
}
