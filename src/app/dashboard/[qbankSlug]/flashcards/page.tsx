import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function FlashcardsPage(props: { params: Promise<{ qbankSlug: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    redirect('/login');
  }

  const qbank = await prisma.qBank.findUnique({
    where: { slug: params.qbankSlug }
  });

  if (!qbank) {
    redirect('/store');
  }

  const flashcards = await prisma.flashcard.findMany({
    where: {
      userId: session.user.id,
      qbankId: qbank.id,
    },
    include: {
      question: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 md:px-10 md:py-16">
      <div className="mb-10 flex items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-teal-700">Study tools</p>
          <h1 className="font-serif text-4xl font-medium tracking-tight text-slate-900">Flashcards</h1>
          <p className="mt-2 text-sm text-slate-600">Review your flashcards for {qbank.title}</p>
        </div>
        <Link
          href={`/dashboard/${params.qbankSlug}`}
          className="shrink-0 text-sm text-slate-600 transition-colors hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600"
        >
          Back to Dashboard
        </Link>
      </div>

      {flashcards.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 p-12 text-center">
          <p className="font-serif text-xl text-slate-900">You don&apos;t have any flashcards yet.</p>
          <p className="mt-2 text-sm text-slate-600">Create flashcards from the test player explanation view.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {flashcards.map((card) => (
            <div
              key={card.id}
              tabIndex={0}
              aria-label={`Flashcard, question ${card.question.qid}. Hover or focus to reveal the answer.`}
              className="group relative flex h-64 w-full flex-col justify-center rounded-lg border border-slate-200 bg-white shadow-sm p-6 text-center transition-colors hover:border-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600"
            >
              <span className="absolute left-4 top-4 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">
                Front
              </span>
              <span className="absolute right-4 top-4 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">
                QID: {card.question.qid}
              </span>
              <p className="text-slate-800">{card.front}</p>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center rounded-lg border border-slate-300 bg-white p-6 opacity-0 transition-opacity duration-300 group-focus-visible:opacity-100 group-hover:opacity-100">
                <span className="absolute left-4 top-4 font-mono text-[11px] uppercase tracking-[0.18em] text-teal-700">
                  Back
                </span>
                <p className="text-slate-900">{card.back}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}