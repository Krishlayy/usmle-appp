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
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Flashcards</h1>
          <p className="text-gray-500 mt-1">Review your flashcards for {qbank.title}</p>
        </div>
        <Link 
          href={`/dashboard/${params.qbankSlug}`}
          className="text-sm font-bold text-gray-600 hover:text-black transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>

      {flashcards.length === 0 ? (
        <div className="bg-gray-50 p-12 text-center rounded border border-gray-200">
          <p className="text-gray-500 font-medium">You don't have any flashcards yet.</p>
          <p className="text-sm text-gray-400 mt-2">Create flashcards from the test player explanation view.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {flashcards.map((card) => (
            <div key={card.id} className="group perspective-1000">
              <div className="relative w-full h-64 bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col justify-center text-center transition-shadow hover:shadow-md">
                <span className="absolute top-4 left-4 font-mono text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Front
                </span>
                <span className="absolute top-4 right-4 font-mono text-[10px] font-bold text-gray-400 uppercase">
                  QID: {card.question.qid}
                </span>
                <p className="font-medium text-gray-800">{card.front}</p>
                <div className="absolute inset-0 bg-black text-white p-6 rounded-xl flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <span className="absolute top-4 left-4 font-mono text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Back
                  </span>
                  <p className="font-medium">{card.back}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
