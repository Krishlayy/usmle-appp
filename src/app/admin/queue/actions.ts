'use server';

import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function resolveIssue(issueId: string) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || !['ADMIN', 'SUPERADMIN'].includes(session.user.role)) {
    throw new Error('Unauthorized');
  }

  await prisma.questionIssue.update({
    where: { id: issueId },
    data: {
      status: 'RESOLVED',
      resolvedAt: new Date(),
      resolvedBy: session.user.id
    }
  });

  revalidatePath('/admin/queue');
}
