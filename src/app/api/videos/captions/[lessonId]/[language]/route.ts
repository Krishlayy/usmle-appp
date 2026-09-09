import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  props: { params: Promise<{ lessonId: string; language: string }> }
) {
  try {
    const params = await props.params;
    const caption = await prisma.lessonCaption.findUnique({
      where: {
        lessonId_language: {
          lessonId: params.lessonId,
          language: params.language,
        },
      },
    });

    if (!caption || !caption.content) {
      // Return empty valid WebVTT
      return new NextResponse('WEBVTT\n\n', {
        headers: {
          'Content-Type': 'text/vtt; charset=utf-8',
        },
      });
    }

    return new NextResponse(caption.content, {
      headers: {
        'Content-Type': 'text/vtt; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('[CAPTION_GET_ERROR]', error);
    return new NextResponse('WEBVTT\n\n', {
      headers: {
        'Content-Type': 'text/vtt; charset=utf-8',
      },
    });
  }
}
