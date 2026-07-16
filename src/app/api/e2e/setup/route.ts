import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse('Forbidden in production', { status: 403 });
  }
  const { email, password } = await req.json();

  let qbank = await prisma.qBank.findUnique({ where: { slug: 'e2e-test-qbank' } });
  if (!qbank) {
    qbank = await prisma.qBank.create({
      data: {
        title: 'E2E Test QBank',
        slug: 'e2e-test-qbank',
        qbankCode: 'E2ETEST',
        description: 'A test qbank for e2e',
        specialtyTag: 'Test',
        price: 1000,
        totalQuestions: 1,
      }
    });
    await prisma.question.create({
      data: {
        qid: `E2E-Q1-${Date.now()}`,
        qbankId: qbank.id,
        questionText: 'What is 2 + 2?',
        options: [
          { id: 'A', text: '3' },
          { id: 'B', text: '4' },
          { id: 'C', text: '5' }
        ],
        correctAnswer: 'B',
        acceptableAnswers: ['B'],
        explanation: 'It is 4.',
        difficulty: 'easy',
        subtopic: 'Math',
        tags: ['Math: Addition']
      }
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: 'E2E User',
    }
  });

  await prisma.purchase.create({
    data: {
      userId: user.id,
      qbankId: qbank.id,
      amountPaidCents: qbank.price,
      stripeSessionId: `mock-sess-${Date.now()}`,
      status: 'active'
    }
  });

  return NextResponse.json({ success: true, qbankSlug: qbank.slug });
}
