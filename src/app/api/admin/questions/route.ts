import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import DOMPurify from 'isomorphic-dompurify';
import { z } from 'zod';

const questionSchema = z.object({
  qbankId: z.string().min(1),
  questionText: z.string().min(1),
  explanation: z.string().optional(),
  media: z.array(z.object({
    type: z.enum(['IMAGE', 'VIDEO']),
    url: z.string(),
    caption: z.string().optional(),
    placement: z.enum(['TOP', 'BOTTOM']),
    displaySize: z.string(),
    order: z.number(),
  })).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  subtopic: z.string().optional(),
  correctAnswer: z.string().min(1),
  acceptableAnswers: z.array(z.string()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
  options: z.array(z.any()).min(2),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const parsed = questionSchema.safeParse(body);

    if (!parsed.success) {
      return new NextResponse('Invalid request data', { status: 400 });
    }

    const data = parsed.data;

    if (data.acceptableAnswers.includes(data.correctAnswer)) {
      return new NextResponse('Correct answer cannot be in acceptable answers', { status: 400 });
    }

    const sanitizeConfig = {
      ADD_TAGS: ['iframe'],
      ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'style', 'class', 'data-align', 'data-drag-handle', 'draggable']
    };

    const sanitizedQuestionText = DOMPurify.sanitize(data.questionText || '', sanitizeConfig);
    const sanitizedExplanation = DOMPurify.sanitize(data.explanation || '', sanitizeConfig);

    // Execute qBank update and question creation sequentially.
    // update with increment is atomic in Postgres, so qid will always be unique.
    // Avoids P2028 interactive transaction errors with Neon connection pooler.
    const qbank = await prisma.qBank.update({
      where: { id: data.qbankId },
      data: { 
        questionCounter: { increment: 1 },
        totalQuestions: { increment: 1 }
      },
      select: { qbankCode: true, questionCounter: true },
    });

    const qid = `${qbank.qbankCode}-${qbank.questionCounter}`;

    const question = await prisma.question.create({
      data: {
        qid,
        qbankId: data.qbankId,
        questionText: sanitizedQuestionText,
        explanation: sanitizedExplanation,
        difficulty: data.difficulty,
        subtopic: data.subtopic || null,
        correctAnswer: data.correctAnswer,
        acceptableAnswers: data.acceptableAnswers,
        tags: data.tags,
        options: data.options,
        media: data.media && data.media.length > 0 ? {
          create: data.media.map(m => ({
            type: m.type,
            url: m.url,
            caption: m.caption,
            placement: m.placement,
            displaySize: m.displaySize,
            order: m.order,
          }))
        } : undefined,
      }
    });

    return NextResponse.json(question);
  } catch (error) {
    console.error('[QUESTION_CREATE_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
