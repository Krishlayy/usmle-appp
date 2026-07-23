'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

export async function createAdminUser(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== 'SUPERADMIN') {
    return { error: 'Unauthorized: Only Superadmins can create admin users.' };
  }

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;

  if (!name || !email || !password || !role) {
    return { error: 'All fields are required.' };
  }

  if (role !== 'ADMIN' && role !== 'SUPERADMIN') {
    return { error: 'Invalid role.' };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return { error: 'A user with this email already exists.' };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: role as 'ADMIN' | 'SUPERADMIN',
        emailVerified: new Date(),
      }
    });

    revalidatePath('/admin/users');
    return { success: true };
  } catch (err: any) {
    console.error('Error creating admin user:', err);
    return { error: 'Failed to create user. Please try again.' };
  }
}
