import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { canViewReport, canChangeReportStatus } from '@/lib/reportPermissions';
import { getReportReplies, getStatusTransitions, logStatusTransition } from '@/lib/reportStore';
import { createNotification } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  props: { params: Promise<{ reportId: string }> }
) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const report = await prisma.questionIssue.findUnique({
      where: { id: params.reportId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        question: {
          include: {
            qbank: { select: { id: true, title: true, slug: true } }
          }
        }
      }
    });

    if (!report) {
      return new NextResponse('Report not found', { status: 404 });
    }

    const userObj = {
      id: session.user.id,
      role: (session.user as any).role || 'STUDENT',
      email: session.user.email
    };

    const reportItem = {
      id: report.id,
      userId: report.userId,
      questionId: report.questionId,
      qbankId: report.question?.qbankId,
      status: report.status
    };

    // IDOR Check: Ensure user is authorized to view this specific report
    if (!canViewReport(userObj, reportItem)) {
      return new NextResponse('Forbidden: You do not have permission to view this report', { status: 403 });
    }

    const replies = getReportReplies(report.id);
    const audits = getStatusTransitions(report.id);

    return NextResponse.json({
      ...report,
      replies,
      history: audits,
    });
  } catch (error) {
    console.error('[REPORT_DETAIL_GET_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  props: { params: Promise<{ reportId: string }> }
) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const report = await prisma.questionIssue.findUnique({
      where: { id: params.reportId },
      include: {
        question: { select: { id: true, qbankId: true, qid: true } }
      }
    });

    if (!report) {
      return new NextResponse('Report not found', { status: 404 });
    }

    const userObj = {
      id: session.user.id,
      role: (session.user as any).role || 'STUDENT',
      email: session.user.email
    };

    const reportItem = {
      id: report.id,
      userId: report.userId,
      questionId: report.questionId,
      qbankId: report.question?.qbankId,
      status: report.status
    };

    // IDOR Check: Students cannot change status; staff must have permission for this QBank
    if (!canChangeReportStatus(userObj, reportItem)) {
      return new NextResponse('Forbidden: You do not have permission to change report status', { status: 403 });
    }

    const body = await req.json();
    const { status } = body;

    const normalizedStatus = String(status || '').trim().toUpperCase();
    if (!['OPEN', 'IN_REVIEW', 'RESOLVED', 'REJECTED'].includes(normalizedStatus)) {
      return new NextResponse('Invalid status. Must be OPEN, IN_REVIEW, RESOLVED, or REJECTED.', { status: 400 });
    }

    const oldStatus = report.status;
    if (oldStatus === normalizedStatus) {
      return NextResponse.json(report);
    }

    const updated = await prisma.questionIssue.update({
      where: { id: params.reportId },
      data: {
        status: normalizedStatus,
        resolvedAt: normalizedStatus === 'RESOLVED' || normalizedStatus === 'REJECTED' ? new Date() : null,
        resolvedBy: session.user.id
      }
    });

    // Log status transition audit trail
    logStatusTransition({
      reportId: report.id,
      actorId: session.user.id,
      actorRole: userObj.role,
      oldStatus,
      newStatus: normalizedStatus,
    });

    // Generate in-app notification for the student reporter
    createNotification({
      userId: report.userId,
      title: `Question Report Status: ${normalizedStatus}`,
      message: `Your report for question ${report.question.qid} is now marked as ${normalizedStatus}.`,
      link: `/profile?tab=reports`,
      metadata: { reportId: report.id, questionId: report.questionId, status: normalizedStatus }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[REPORT_PATCH_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}