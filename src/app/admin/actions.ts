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

  const existingSlug = await prisma.qBank.findUnique({ where: { slug: parsed.data.slug } });
  if (existingSlug) {
    throw new Error('A Q-Bank with this Slug already exists. Please choose a unique Slug.');
  }

  const existingCode = await prisma.qBank.findUnique({ where: { qbankCode: parsed.data.qbankCode } });
  if (existingCode) {
    throw new Error('A Q-Bank with this QBank Code already exists. Please choose a unique Code.');
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

export async function deleteQBank(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  const id = formData.get('id') as string;
  if (!id) throw new Error('ID is required');

  // First, delete related data to respect foreign key constraints
  await prisma.questionImage.deleteMany({
    where: { question: { qbankId: id } }
  });

  await prisma.questionMedia.deleteMany({
    where: { question: { qbankId: id } }
  });

  await prisma.userProgress.deleteMany({
    where: { qbankId: id }
  });

  await prisma.testSession.deleteMany({
    where: { qbankId: id }
  });

  await prisma.purchase.deleteMany({
    where: { qbankId: id }
  });

  await prisma.question.deleteMany({
    where: { qbankId: id }
  });

  await prisma.qBank.delete({
    where: { id }
  });

  revalidatePath('/admin/qbanks');
  redirect('/admin/qbanks');
}
