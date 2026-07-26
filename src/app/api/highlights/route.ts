import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const questionId = searchParams.get('questionId');

    if (questionId) {
      const highlights = await prisma.highlight.findMany({
        where: { userId: session.user.id, questionId },
        orderBy: { startOffset: 'asc' }
      });
      return NextResponse.json({ highlights });
    } else {
      const highlights = await prisma.highlight.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json({ highlights });
    }

  } catch (error) {
    console.error('Failed to fetch highlights:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    const highlight = await prisma.highlight.create({
      data: {
        userId: session.user.id,
        questionId: data.questionId,
        section: data.section,
        text: data.text,
        startOffset: data.startOffset,
        endOffset: data.endOffset,
        color: data.color,
        note: data.note || null,
      }
    });

    return NextResponse.json({ highlight });
  } catch (error) {
    console.error('Failed to save highlight:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, note, color } = await req.json();

    const highlight = await prisma.highlight.updateMany({
      where: { id, userId: session.user.id },
      data: {
        ...(note !== undefined && { note }),
        ...(color !== undefined && { color }),
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update highlight:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    await prisma.highlight.deleteMany({
      where: { id, userId: session.user.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete highlight:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
