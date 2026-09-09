import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { isFeatureEnabled } from '@/lib/featureFlags';
import { Play, Sparkles, Layers, Plus, BookOpen, Clock, Brain } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default async function FlashcardsPage(props: { 
  params: Promise<{ qbankSlug: string }>;
  searchParams?: Promise<{ tab?: string }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  const qbank = await prisma.qBank.findUnique({
    where: { slug: params.qbankSlug }
  });

  if (!qbank) {
    redirect('/store');
  }

  const isV2Enabled = await isFeatureEnabled('READY_DECKS_V2');

  // Fetch all user cards for backward compatibility / fallback
  const userFlashcards = await prisma.flashcard.findMany({
    where: {
      userId: session.user.id,
      qbankId: qbank.id,
    },
    include: { question: true },
    orderBy: { createdAt: 'desc' },
  });

  // If V2 is disabled, render the original baseline view
  if (!isV2Enabled) {
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

        {userFlashcards.length === 0 ? (
          <div className="bg-gray-50 p-12 text-center rounded border border-gray-200">
            <p className="text-gray-500 font-medium">You don't have any flashcards yet.</p>
            <p className="text-sm text-gray-400 mt-2">Create flashcards from the test player explanation view.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userFlashcards.map((card) => (
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

  // --- READYDECKS V2 VIEW ---
  const now = new Date();
  const [dueCount, newCount, curatedDecks, myDecks] = await Promise.all([
    prisma.flashcard.count({
      where: {
        userId: session.user.id,
        nextReview: { lte: now },
        interval: { gt: 0 },
      }
    }),
    prisma.flashcard.count({
      where: {
        userId: session.user.id,
        interval: 0,
      }
    }),
    prisma.deck.findMany({
      where: { isPublished: true },
      include: { _count: { select: { cards: true } }, author: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.deck.findMany({
      where: { authorId: session.user.id },
      include: { _count: { select: { cards: true } } },
      orderBy: { updatedAt: 'desc' },
    }),
  ]);

  const activeTab = searchParams?.tab || 'readydecks';

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-cyan-100 text-cyan-800 text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded">
              ReadyDecks 2.0
            </span>
            <span className="text-slate-400 text-xs">Spaced Repetition</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Flashcards & ReadyDecks</h1>
          <p className="text-slate-500 text-sm mt-1">
            Master high-yield USMLE concepts with active recall and adaptive SM-2 spaced repetition.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {(dueCount > 0 || newCount > 0) && (
            <Link href={`/dashboard/${params.qbankSlug}/flashcards/review`}>
              <Button variant="primary" className="gap-2 shadow-sm">
                <Play className="w-4 h-4" /> Start Daily Review ({dueCount + newCount})
              </Button>
            </Link>
          )}
          <Link href={`/dashboard/${params.qbankSlug}`}>
            <Button variant="secondary">Back to Dashboard</Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card elevation="subtle" className="p-5 bg-white border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Due Today</span>
            <Clock className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">{dueCount}</div>
          <p className="text-xs text-slate-400 mt-1">Cards requiring memory reinforcement</p>
        </Card>

        <Card elevation="subtle" className="p-5 bg-white border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">New Cards</span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">{newCount}</div>
          <p className="text-xs text-slate-400 mt-1">Unstudied cards ready for first review</p>
        </Card>

        <Card elevation="subtle" className="p-5 bg-white border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Cards</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">{userFlashcards.length}</div>
          <p className="text-xs text-slate-400 mt-1">Cards in your personal library</p>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 mb-8 gap-8">
        <Link 
          href={`/dashboard/${params.qbankSlug}/flashcards?tab=readydecks`}
          className={`pb-3 font-bold text-sm border-b-2 transition-colors -mb-[1px] ${
            activeTab === 'readydecks' ? 'border-cyan-600 text-cyan-700' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Curated ReadyDecks ({curatedDecks.length})
        </Link>
        <Link 
          href={`/dashboard/${params.qbankSlug}/flashcards?tab=mydecks`}
          className={`pb-3 font-bold text-sm border-b-2 transition-colors -mb-[1px] ${
            activeTab === 'mydecks' ? 'border-cyan-600 text-cyan-700' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          My Decks ({myDecks.length})
        </Link>
        <Link 
          href={`/dashboard/${params.qbankSlug}/flashcards?tab=all`}
          className={`pb-3 font-bold text-sm border-b-2 transition-colors -mb-[1px] ${
            activeTab === 'all' ? 'border-cyan-600 text-cyan-700' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          All Cards ({userFlashcards.length})
        </Link>
      </div>

      {/* Tab 1: Curated ReadyDecks */}
      {activeTab === 'readydecks' && (
        <div>
          {curatedDecks.length === 0 ? (
            <div className="p-12 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl">
              <BookOpen className="w-10 h-10 mx-auto text-slate-400 mb-2" />
              <p className="font-semibold text-slate-700">No curated decks published yet.</p>
              <p className="text-xs text-slate-500 mt-1">Expert high-yield decks will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {curatedDecks.map((deck) => (
                <Card key={deck.id} elevation="subtle" className="p-6 bg-white border border-slate-200 rounded-2xl flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-100 text-cyan-800">
                        {deck.subject}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {deck._count.cards} cards
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{deck.title}</h3>
                    {deck.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                        {deck.description}
                      </p>
                    )}
                  </div>
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <Link href={`/dashboard/${params.qbankSlug}/flashcards/decks/${deck.id}`} className="text-xs font-bold text-slate-600 hover:text-slate-900">
                      View Cards
                    </Link>
                    <Link href={`/dashboard/${params.qbankSlug}/flashcards/review?deckId=${deck.id}`}>
                      <Button variant="primary" size="sm" className="gap-1.5">
                        <Play className="w-3.5 h-3.5" /> Study
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: My Decks */}
      {activeTab === 'mydecks' && (
        <div>
          {myDecks.length === 0 ? (
            <div className="p-12 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl">
              <Layers className="w-10 h-10 mx-auto text-slate-400 mb-2" />
              <p className="font-semibold text-slate-700">You haven't created any custom decks yet.</p>
              <p className="text-xs text-slate-500 mt-1">Organize your flashcards into targeted custom review decks.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myDecks.map((deck) => (
                <Card key={deck.id} elevation="subtle" className="p-6 bg-white border border-slate-200 rounded-2xl flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {deck.subject}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {deck._count.cards} cards
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{deck.title}</h3>
                    {deck.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                        {deck.description}
                      </p>
                    )}
                  </div>
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <Link href={`/dashboard/${params.qbankSlug}/flashcards/decks/${deck.id}`} className="text-xs font-bold text-slate-600 hover:text-slate-900">
                      View Cards
                    </Link>
                    <Link href={`/dashboard/${params.qbankSlug}/flashcards/review?deckId=${deck.id}`}>
                      <Button variant="primary" size="sm" className="gap-1.5">
                        <Play className="w-3.5 h-3.5" /> Study
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: All Flashcards */}
      {activeTab === 'all' && (
        <div>
          {userFlashcards.length === 0 ? (
            <div className="p-12 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl">
              <p className="font-semibold text-slate-700">No cards in your collection.</p>
              <p className="text-xs text-slate-500 mt-1">Cards authored during practice will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userFlashcards.map((card) => (
                <Card key={card.id} elevation="subtle" className="p-5 bg-white border border-slate-200 rounded-xl">
                  <div className="flex justify-between items-center text-xs font-mono text-slate-400 mb-2">
                    <span>QID: {card.question?.qid}</span>
                    <span>Interval: {card.interval}d</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-900 mb-2 border-b border-slate-100 pb-2">
                    {card.front}
                  </div>
                  <div className="text-xs text-slate-600">
                    {card.back}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}