import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { canReplyToReport } from '@/lib/reportPermissions';
import { addReportReply, logStatusTransition } from '@/lib/reportStore';
import { createNotification } from '@/lib/notifications';
import DOMPurify from 'isomorphic-dompurify';

export const dynamic = 'force-dynamic';

export async function POST(
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

    // IDOR Check: Ensure user can reply to this report
    if (!canReplyToReport(userObj, reportItem)) {
      return new NextResponse('Forbidden: You do not have permission to reply to this report', { status: 403 });
    }

    const body = await req.json();
    const { message } = body;

    const sanitizedMessage = DOMPurify.sanitize(String(message || '').trim());
    if (sanitizedMessage.length === 0 || sanitizedMessage.length > 3000) {
      return new NextResponse('Reply message must be between 1 and 3000 characters', { status: 400 });
    }

    const isStaff = userObj.role === 'ADMIN' || userObj.role === 'SUPERADMIN' || userObj.role === 'CONTRIBUTOR';

    const reply = addReportReply({
      reportId: report.id,
      authorId: session.user.id,
      authorName: session.user.name || (isStaff ? 'USMLE Faculty' : 'Student'),
      authorRole: userObj.role,
      message: sanitizedMessage,
    });

    // If staff replies and report was OPEN, automatically update status to IN_REVIEW
    if (isStaff && report.status === 'OPEN') {
      await prisma.questionIssue.update({
        where: { id: report.id },
        data: { status: 'IN_REVIEW' }
      });

      logStatusTransition({
        reportId: report.id,
        actorId: session.user.id,
        actorRole: userObj.role,
        oldStatus: 'OPEN',
        newStatus: 'IN_REVIEW'
      });
    }

    // If staff replies, notify the student reporter
    if (isStaff && report.userId !== session.user.id) {
      createNotification({
        userId: report.userId,
        title: 'New Reply on Your Question Report',
        message: `Faculty responded to your report on question ${report.question.qid}.`,
        link: `/profile?tab=reports`,
        metadata: { reportId: report.id, questionId: report.questionId }
      });
    }

    return NextResponse.json(reply, { status: 201 });
  } catch (error) {
    console.error('[REPORT_REPLY_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}