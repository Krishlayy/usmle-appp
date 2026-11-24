import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const {
      preferredName,
      targetExam,
      examAttempt,
      targetDate,
      medicalSchool,
      graduationYear,
    } = body;

    if (!targetExam || !examAttempt) {
      return new NextResponse('Target exam and attempt are required.', { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        preferredName: preferredName?.trim() || null,
        name: preferredName?.trim() || session.user.name || null,
        targetExam,
        examAttempt,
        targetDate: targetDate || null,
        medicalSchool: medicalSchool?.trim() || null,
        graduationYear: graduationYear?.trim() || null,
        onboardingCompleted: true,
      },
      select: {
        id: true,
        email: true,
        preferredName: true,
        targetExam: true,
        onboardingCompleted: true,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Failed to complete candidate onboarding:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
