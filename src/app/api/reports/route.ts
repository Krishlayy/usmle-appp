import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getReportReplies, getStatusTransitions } from '@/lib/reportStore';
import DOMPurify from 'isomorphic-dompurify';

export const dynamic = 'force-dynamic';

export const VALID_REASONS = [
  'INCORRECT_QUESTION',
  'INCORRECT_ANSWER',
  'INCORRECT_EXPLANATION',
  'MULTIPLE_CORRECT_ANSWERS',
  'NO_CORRECT_ANSWER',
  'TYPO',
  'AMBIGUITY',
  'OTHER'
] as const;

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    const status = searchParams.get('status');
    const reason = searchParams.get('reason');
    const qbankId = searchParams.get('qbankId');
    const search = searchParams.get('search')?.trim();

    const role = (session.user as any).role || 'STUDENT';
    const isStaff = role === 'ADMIN' || role === 'SUPERADMIN' || role === 'CONTRIBUTOR';

    // Base where clause strictly scoped by role
    const where: any = {};

    if (!isStaff) {
      // Students can ONLY view their own reports
      where.userId = session.user.id;
    }

    if (status && ['OPEN', 'IN_REVIEW', 'RESOLVED', 'REJECTED'].includes(status)) {
      where.status = status;
    }

    if (reason) {
      where.issueType = { equals: reason, mode: 'insensitive' };
    }

    if (qbankId || search) {
      where.question = {};
      if (qbankId) {
        where.question.qbankId = qbankId;
      }
      if (search) {
        where.question.OR = [
          { qid: { contains: search, mode: 'insensitive' } },
          { questionText: { contains: search, mode: 'insensitive' } },
          { subtopic: { contains: search, mode: 'insensitive' } },
        ];
      }
    }

    const [total, reports, openCount, inReviewCount, resolvedCount, rejectedCount] = await Promise.all([
      prisma.questionIssue.count({ where }),
      prisma.questionIssue.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          question: {
            select: {
              id: true,
              qid: true,
              qbankId: true,
              questionText: true,
              subtopic: true,
              difficulty: true,
              qbank: { select: { id: true, title: true, slug: true } }
            }
          }
        }
      }),
      prisma.questionIssue.count({ where: { ...where, status: 'OPEN' } }),
      prisma.questionIssue.count({ where: { ...where, status: 'IN_REVIEW' } }),
      prisma.questionIssue.count({ where: { ...where, status: 'RESOLVED' } }),
      prisma.questionIssue.count({ where: { ...where, status: 'REJECTED' } }),
    ]);

    // Attach latest reply and thread count to each report
    const enrichedReports = reports.map(r => {
      const replies = getReportReplies(r.id);
      const audits = getStatusTransitions(r.id);
      return {
        ...r,
        replyCount: replies.length,
        latestReply: replies.length > 0 ? replies[replies.length - 1] : null,
        historyCount: audits.length,
      };
    });

    return NextResponse.json({
      reports: enrichedReports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      counts: {
        all: total,
        open: openCount,
        inReview: inReviewCount,
        resolved: resolvedCount,
        rejected: rejectedCount,
      }
    });
  } catch (error) {
    console.error('[REPORTS_GET_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { questionId, reason, description } = body;

    if (!questionId || typeof questionId !== 'string') {
      return new NextResponse('Invalid questionId', { status: 400 });
    }

    const normalizedReason = String(reason || '').trim().toUpperCase();
    if (!VALID_REASONS.includes(normalizedReason as any)) {
      return new NextResponse(
        `Invalid reason. Must be one of: ${VALID_REASONS.join(', ')}`,
        { status: 400 }
      );
    }

    const sanitizedDescription = DOMPurify.sanitize(String(description || '').trim());
    if (normalizedReason === 'OTHER' && sanitizedDescription.length < 10) {
      return new NextResponse('Please provide a description of at least 10 characters when selecting "Other"', { status: 400 });
    }

    // 1. One OPEN report rule: Check if student already has an active OPEN report for this question
    const existingOpenReport = await prisma.questionIssue.findFirst({
      where: {
        userId: session.user.id,
        questionId,
        status: 'OPEN'
      }
    });

    if (existingOpenReport) {
      return new NextResponse('You already have an open report for this question', { status: 400 });
    }

    // 2. 24-hour rate limit: Maximum 1 report submission for same student + question in 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentReport = await prisma.questionIssue.findFirst({
      where: {
        userId: session.user.id,
        questionId,
        createdAt: { gte: twentyFourHoursAgo }
      }
    });

    if (recentReport) {
      return new NextResponse('A report for this question was already submitted within the last 24 hours', { status: 429 });
    }

    // Check that question exists
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: { id: true, qbankId: true, qid: true }
    });

    if (!question) {
      return new NextResponse('Question not found', { status: 404 });
    }

    const report = await prisma.questionIssue.create({
      data: {
        questionId,
        userId: session.user.id,
        issueType: normalizedReason,
        description: sanitizedDescription,
        status: 'OPEN'
      },
      include: {
        question: {
          select: { qid: true, qbankId: true }
        }
      }
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error('[REPORT_POST_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}