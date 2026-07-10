import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { name, email, password, role } = await req.json();

    if (!email || !password || password.length < 6) {
      return new NextResponse('Invalid input', { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new NextResponse('Email already in use', { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: role === 'ADMIN' ? 'ADMIN' : 'STUDENT',
      },
    });

    return NextResponse.json({ id: newUser.id, success: true });
  } catch (error) {
    console.error('[CREATE_USER_ERROR]', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
