import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { isFeatureEnabled } from '@/lib/featureFlags';

export const dynamic = 'force-dynamic';

function formatDateToICS(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = d.getUTCFullYear();
  const month = pad(d.getUTCMonth() + 1);
  const day = pad(d.getUTCDate());
  const hours = pad(d.getUTCHours());
  const minutes = pad(d.getUTCMinutes());
  const seconds = pad(d.getUTCSeconds());
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const enabled = await isFeatureEnabled('STUDY_PLANNER');
    if (!enabled) {
      return new NextResponse('Study Planner is disabled', { status: 403 });
    }

    const tasks = await prisma.planTask.findMany({
      where: { userId: session.user.id },
      orderBy: { scheduledDate: 'asc' },
    });

    const now = new Date();
    const dtstamp = formatDateToICS(now);

    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Micro Q-Bank//USMLE Study Planner//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:USMLE Study Plan',
      'X-WR-TIMEZONE:UTC',
    ];

    for (const task of tasks) {
      const startDate = new Date(task.scheduledDate);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration default

      icsContent.push(
        'BEGIN:VEVENT',
        `UID:${task.id}@micro-qbank.com`,
        `DTSTAMP:${dtstamp}`,
        `DTSTART:${formatDateToICS(startDate)}`,
        `DTEND:${formatDateToICS(endDate)}`,
        `SUMMARY:${escapeICSText(task.title)}`,
        `DESCRIPTION:${escapeICSText(task.description || task.title)}`,
        `STATUS:${task.isCompleted ? 'COMPLETED' : 'CONFIRMED'}`,
        'END:VEVENT'
      );
    }

    icsContent.push('END:VCALENDAR');

    const calendarBody = icsContent.join('\r\n');

    return new NextResponse(calendarBody, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="usmle-study-schedule.ics"',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('[PLANNER_ICS_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
