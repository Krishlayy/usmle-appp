import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import sanitizeHtml from 'sanitize-html';
import { z } from 'zod';

const questionUpdateSchema = z.object({
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
  acceptableAnswers: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  options: z.array(z.any()).min(2),
  videoUrl: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
});

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !['ADMIN', 'SUPERADMIN'].includes(session.user.role)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const parsed = questionUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return new NextResponse('Invalid request data', { status: 400 });
    }

    const data = parsed.data;
    const id = params.id;

    if (data.acceptableAnswers && data.acceptableAnswers.includes(data.correctAnswer)) {
      return new NextResponse('Correct answer cannot be in acceptable answers', { status: 400 });
    }

    const sanitizeConfig = {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['iframe', 'img']),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        'iframe': ['src', 'allow', 'allowfullscreen', 'frameborder', 'scrolling'],
        'img': ['src', 'alt', 'style', 'class', 'data-align', 'data-drag-handle', 'draggable'],
        '*': ['style', 'class']
      }
    };

    const sanitizedQuestionText = sanitizeHtml(data.questionText || '', sanitizeConfig);
    const sanitizedExplanation = sanitizeHtml(data.explanation || '', sanitizeConfig);

    await prisma.questionMedia.deleteMany({
      where: { questionId: id }
    });

    const question = await prisma.question.update({
      where: { id },
      data: {
        questionText: sanitizedQuestionText,
        options: data.options,
        correctAnswer: data.correctAnswer,
        acceptableAnswers: data.acceptableAnswers,
        explanation: sanitizedExplanation,
        difficulty: data.difficulty,
        subtopic: data.subtopic || null,
        videoUrl: data.videoUrl !== undefined ? data.videoUrl : undefined,
        tags: data.tags,
        status: data.status,
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
  } catch (error: any) {
    console.error('[QUESTION_UPDATE_ERROR]', error);
    return new NextResponse(`Error: ${error.message}\n${error.stack}`, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !['ADMIN', 'SUPERADMIN'].includes(session.user.role)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const question = await prisma.question.findUnique({
      where: { id: params.id },
      select: { qbankId: true }
    });

    if (!question) {
      return new NextResponse('Not found', { status: 404 });
    }

    await prisma.question.delete({
      where: { id: params.id }
    });

    await prisma.qBank.update({
      where: { id: question.qbankId },
      data: { totalQuestions: { decrement: 1 } }
    });

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('[QUESTION_DELETE_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
