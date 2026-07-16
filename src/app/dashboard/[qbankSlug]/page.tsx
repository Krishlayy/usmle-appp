import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { verifyQbankAccess } from '@/lib/verifyQbankAccess';
import Link from 'next/link';
import { SubtopicChart } from '@/components/SubtopicChart';
import { BibliographyChart } from '@/components/BibliographyChart';
import { getCachedOrFetch } from '@/lib/redis';

export default async function QBankDashboardPage(
  props: { 
    params: Promise<{ qbankSlug: string }>;
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
  }
) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    redirect('/login');
  }

  // 1. Find the QBank by slug
  const qbank = await getCachedOrFetch(
    `qbank:slug:${params.qbankSlug}`,
    () => prisma.qBank.findUnique({
      where: { slug: params.qbankSlug },
    }),
    3600
  );

  if (!qbank) {
    notFound();
  }

  // 1.5 Handle Stripe webhook latency (local testing or prod race conditions)
  if (searchParams?.session_id && typeof searchParams.session_id === 'string') {
    const { stripe } = await import('@/lib/stripe');
    try {
      const stripeSession = await stripe.checkout.sessions.retrieve(searchParams.session_id);
      if (stripeSession.payment_status === 'paid' && stripeSession.metadata?.userId === session.user.id && stripeSession.metadata?.qbankId === qbank.id) {
        await prisma.purchase.upsert({
          where: { stripeSessionId: stripeSession.id },
          create: {
            userId: session.user.id,
            qbankId: qbank.id,
            amountPaidCents: stripeSession.amount_total || 0,
            stripeSessionId: stripeSession.id,
            status: 'active',
            expiresAt: null,
          },
          update: { status: 'active' },
        });
      }
    } catch (e) {
      console.error('Failed to verify session_id synchronously:', e);
    }
  }

  // 2. Verify access
  try {
    await verifyQbankAccess(session.user.id, qbank.id);
  } catch {
    // If forbidden, redirect to public detail page
    redirect(`/qbanks/${qbank.slug}`);
  }

  // 3. Fetch user progress stats for this QBank, including question subtopic
  const progress = await prisma.userProgress.findMany({
    where: {
      userId: session.user.id,
      qbankId: qbank.id,
    },
    include: {
      question: {
        select: {
          subtopic: true,
          tags: true,
        }
      },
    },
  });

  // Calculate stats
  const uniqueQuestionsAttempted = new Set(progress.map((p) => p.questionId)).size;
  const correctAttempts = progress.filter((p) => p.isCorrect).length;
  const totalAttempts = progress.length;
  const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;
  const flaggedCount = progress.filter((p) => p.flagged).length;

  // Calculate subtopic performance
  const subtopicMap: Record<string, { attempts: number; correct: number }> = {};
  const tagMap: Record<string, { attempts: number; correct: number }> = {};

  for (const p of progress) {
    const sub = p.question.subtopic || 'Uncategorized';
    if (!subtopicMap[sub]) {
      subtopicMap[sub] = { attempts: 0, correct: 0 };
    }
    subtopicMap[sub].attempts++;
    if (p.isCorrect) {
      subtopicMap[sub].correct++;
    }

    // Process Bibliography Tags
    const tags = p.question.tags && p.question.tags.length > 0 ? p.question.tags : ['Untagged'];
    for (const tag of tags) {
      if (!tagMap[tag]) {
        tagMap[tag] = { attempts: 0, correct: 0 };
      }
      tagMap[tag].attempts++;
      if (p.isCorrect) {
        tagMap[tag].correct++;
      }
    }
  }

  const subtopicData = Object.entries(subtopicMap)
    .map(([subtopic, stats]) => ({
      subtopic,
      accuracy: Math.round((stats.correct / stats.attempts) * 100),
    }))
    .sort((a, b) => b.accuracy - a.accuracy); // sort by highest accuracy

  const bibliographyData = Object.entries(tagMap)
    .map(([tag, stats]) => ({
      tag,
      accuracy: Math.round((stats.correct / stats.attempts) * 100),
    }))
    // Optional: filter out "Untagged" if you want, or just sort
    .sort((a, b) => b.accuracy - a.accuracy);

  return (
    <div className="container mx-auto py-12 px-4 md:px-6 max-w-5xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="text-sm text-blue-600 hover:underline mb-2 inline-block">&larr; Back to Dashboard</Link>
          <h1 className="text-3xl font-bold">{qbank.title} Dashboard</h1>
        </div>
        <span className="inline-flex items-center border border-gray-200 bg-white px-3 py-1 text-sm font-semibold text-black">
          Purchased
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white border border-gray-200 p-6 rounded-none">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Overall Progress</h3>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-3xl font-bold">{uniqueQuestionsAttempted}</span>
            <span className="text-gray-500 mb-1">/ {qbank.totalQuestions}</span>
          </div>
          <div className="w-full bg-gray-100 h-1">
            <div className="bg-black h-1" style={{ width: `${qbank.totalQuestions > 0 ? (uniqueQuestionsAttempted / qbank.totalQuestions) * 100 : 0}%` }}></div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 p-6 rounded-none">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Overall Accuracy</h3>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold">{accuracy}%</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">Based on all attempts</p>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-none">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Flagged Questions</h3>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold">{flaggedCount}</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">Questions marked for review</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div className="bg-white border border-gray-200 p-6 rounded-none">
          <h2 className="text-xl font-bold mb-4">Performance by Subtopic</h2>
          <SubtopicChart data={subtopicData} />
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-none">
          <h2 className="text-xl font-bold mb-4">Performance by Bibliography</h2>
          <BibliographyChart data={bibliographyData} />
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6 border-t border-gray-200 pt-8">Practice</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 p-6 flex flex-col h-full rounded-none">
          <div className="flex items-center mb-4 text-black">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <h3 className="text-xl font-bold">Timed Mode</h3>
          </div>
          <p className="text-gray-500 mb-6 flex-1">Simulate exam conditions with a strict countdown timer. Explanations are shown at the end of the block.</p>
          <Link
            href={`/dashboard/${qbank.slug}/setup?mode=timed`}
            className="flex w-full items-center justify-center text-sm font-medium transition-colors bg-black text-white hover:bg-gray-800 h-10 px-4 py-2 rounded-none"
          >
            Start Timed Block
          </Link>
        </div>

        <div className="bg-white border border-gray-200 p-6 flex flex-col h-full rounded-none">
          <div className="flex items-center mb-4 text-black">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
            <h3 className="text-xl font-bold">Tutor Mode</h3>
          </div>
          <p className="text-gray-500 mb-6 flex-1">Learn as you go. No strict timer, and you receive immediate feedback and explanations after each question.</p>
          <Link
            href={`/dashboard/${qbank.slug}/setup?mode=tutor`}
            className="flex w-full items-center justify-center text-sm font-medium transition-colors border border-gray-200 bg-white text-black hover:bg-gray-100 h-10 px-4 py-2 rounded-none"
          >
            Start Tutor Block
          </Link>
        </div>
      </div>
    </div>
  );
}
