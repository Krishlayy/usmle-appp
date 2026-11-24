import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Role } from '@prisma/client';

export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !['ADMIN', 'SUPERADMIN'].includes(session.user.role)) {
      return new NextResponse('Unauthorized: Admin access required', { status: 403 });
    }

    const params = await props.params;
    const targetUserId = params.id;
    const body = await req.json();
    const { role } = body;

    if (!role || !Object.values(Role).includes(role)) {
      return new NextResponse('Invalid role specified', { status: 400 });
    }

    // Protect self-demotion
    if (session.user.id === targetUserId && role !== session.user.role) {
      return new NextResponse('You cannot change your own administrative role', { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, email: true, role: true },
    });

    if (!targetUser) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Only SUPERADMIN can modify another ADMIN or promote to SUPERADMIN
    if (targetUser.role === 'SUPERADMIN' && session.user.role !== 'SUPERADMIN') {
      return new NextResponse('Forbidden: Only Superadmins can modify Superadmin accounts', { status: 403 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Failed to update user role:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
