'use server';

import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const createQBankSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  qbankCode: z.string().min(1, 'QBank Code is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be positive'),
  currency: z.string().default('USD'),
  isActive: z.boolean(),
});

const updateQBankSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  title: z.string().min(1, 'Title is required'),
  price: z.number().min(0, 'Price must be positive'),
  isActive: z.boolean(),
});

export async function createQBank(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  const rawData = {
    title: formData.get('title') as string,
    slug: formData.get('slug') as string,
    qbankCode: formData.get('qbankCode') as string,
    description: formData.get('description') as string,
    price: parseFloat(formData.get('price') as string),
    currency: formData.get('currency') as string || 'USD',
    isActive: formData.get('isActive') === 'on',
  };

  const parsed = createQBankSchema.safeParse(rawData);

  if (!parsed.success) {
    throw new Error('Invalid data: ' + parsed.error.issues.map((e: z.ZodIssue) => e.message).join(', '));
  }

  const newQbank = await prisma.qBank.create({
    data: {
      ...parsed.data,
      description: parsed.data.description || '',
      price: Math.round(parsed.data.price * 100), // Convert to cents
      specialtyTag: 'general', // Default placeholder to satisfy schema
    }
  });

  revalidatePath('/admin/qbanks');
  redirect(`/admin/qbanks/${newQbank.id}/edit`);
}

export async function updateQBank(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  const rawData = {
    id: formData.get('id') as string,
    title: formData.get('title') as string,
    price: parseFloat(formData.get('price') as string),
    isActive: formData.get('isActive') === 'on',
  };

  const parsed = updateQBankSchema.safeParse(rawData);

  if (!parsed.success) {
    throw new Error('Invalid data: ' + parsed.error.issues.map((e: z.ZodIssue) => e.message).join(', '));
  }

  await prisma.qBank.update({
    where: { id: parsed.data.id },
    data: {
      title: parsed.data.title,
      price: Math.round(parsed.data.price * 100),
      isActive: parsed.data.isActive,
    }
  });

  revalidatePath('/admin/qbanks');
  revalidatePath(`/admin/qbanks/${parsed.data.id}/edit`);
}
