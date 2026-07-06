import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.toLowerCase() || '';

    // Fetch tags. Since Prisma doesn't have a distinct array elements query natively without raw SQL,
    // and this is an admin autocomplete with a relatively small dataset, we can fetch all and distinct in memory,
    // or use a raw query if we are careful. Given the scale, getting all questions that have tags is fine.
    const questionsWithTags = await prisma.question.findMany({
      where: {
        tags: { isEmpty: false }
      },
      select: { tags: true }
    });

    const allTags = new Set<string>();
    for (const qObj of questionsWithTags) {
      for (const tag of qObj.tags) {
        if (!q || tag.toLowerCase().includes(q)) {
          allTags.add(tag);
        }
      }
    }

    const suggestions = Array.from(allTags).sort();

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error('[TAGS_SUGGESTION_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
