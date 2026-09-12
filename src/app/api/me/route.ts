import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getUserCountry, setUserCountry } from '@/lib/userCountryStore';
import { getUserNotifications } from '@/lib/notifications';
import { getReportReplies } from '@/lib/reportStore';
import DOMPurify from 'isomorphic-dompurify';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
      }
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Country data
    const country = getUserCountry(user.id);

    // Purchases from authoritative Purchase table
    const purchases = await prisma.purchase.findMany({
      where: { userId: user.id },
      orderBy: { purchasedAt: 'desc' },
      include: {
        qbank: {
          select: {
            id: true,
            title: true,
            slug: true,
            specialtyTag: true,
            totalQuestions: true,
          }
        }
      }
    });

    // Reports submitted by this student
    const rawReports = await prisma.questionIssue.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        question: {
          select: {
            id: true,
            qid: true,
            questionText: true,
            subtopic: true,
            qbank: { select: { id: true, title: true, slug: true } }
          }
        }
      }
    });

    const reports = rawReports.map(r => {
      const replies = getReportReplies(r.id);
      return {
        ...r,
        replies,
        replyCount: replies.length,
        latestReply: replies.length > 0 ? replies[replies.length - 1] : null,
      };
    });

    // In-app notifications
    const notifications = getUserNotifications(user.id);

    return NextResponse.json({
      user: {
        ...user,
        countryCode: country?.countryCode || null,
        countryName: country?.countryName || null,
      },
      purchases,
      reports,
      notifications,
    });
  } catch (error) {
    console.error('[API_ME_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { name, countryCode, countryName } = body;

    const updateData: any = {};
    if (name !== undefined) {
      const sanitizedName = DOMPurify.sanitize(String(name).trim());
      if (sanitizedName.length >= 2) {
        updateData.name = sanitizedName;
      }
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: updateData,
      });
    }

    if (countryCode && countryName) {
      setUserCountry(session.user.id, {
        countryCode: String(countryCode).trim(),
        countryName: String(countryName).trim(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API_ME_PUT_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}