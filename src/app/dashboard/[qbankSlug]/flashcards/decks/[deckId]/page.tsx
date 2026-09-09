import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Play, Layers, Plus, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default async function DeckDetailPage(props: {
  params: Promise<{ qbankSlug: string; deckId: string }>;
}) {
  const params = await props.params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  const deck = await prisma.deck.findUnique({
    where: { id: params.deckId },
    include: {
      author: { select: { name: true, email: true } },
      cards: {
        orderBy: { position: 'asc' },
        include: {
          flashcard: {
            include: {
              question: {
                select: { qid: true, subtopic: true }
              }
            }
          }
        }
      }
    }
  });

  if (!deck) {
    notFound();
  }

  const isAdmin = (session.user as any).role === 'ADMIN' || (session.user as any).role === 'SUPERADMIN';
  if (!deck.isPublished && deck.authorId !== session.user.id && !isAdmin) {
    notFound();
  }

  return (
    <div className="p-8 max-w-5xl mx-auto font-sans">
      <Link 
        href={`/dashboard/${params.qbankSlug}/flashcards`}
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Flashcards & Decks
      </Link>

      <div className="bg-white border border-slate-200 rounded-2xl p-8 mb-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-1 rounded bg-cyan-100 text-cyan-800">
              {deck.subject}
            </span>
            {deck.isPublished ? (
              <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-1 rounded bg-emerald-100 text-emerald-800">
                Curated
              </span>
            ) : (
              <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-1 rounded bg-slate-100 text-slate-700">
                My Deck
              </span>
            )}
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{deck.title}</h1>
          {deck.description && (
            <p className="text-slate-600 mt-2 max-w-2xl">{deck.description}</p>
          )}
          <p className="text-xs text-slate-400 mt-3 font-medium">
            {deck.cards.length} cards · Author: {deck.author.name || deck.author.email}
          </p>
        </div>

        {deck.cards.length > 0 && (
          <Link href={`/dashboard/${params.qbankSlug}/flashcards/review?deckId=${deck.id}`}>
            <Button variant="primary" className="gap-2 px-6 py-3 shadow-md">
              <Play className="w-4 h-4" /> Study This Deck
            </Button>
          </Link>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Cards in this Deck ({deck.cards.length})</h2>
        {deck.cards.length === 0 ? (
          <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-12 text-center text-slate-500">
            <Layers className="w-10 h-10 mx-auto text-slate-400 mb-2" />
            <p className="font-semibold">This deck has no cards yet.</p>
            <p className="text-xs text-slate-400 mt-1">Create cards during QBank practice or explanation review.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deck.cards.map((dc, idx) => (
              <Card key={dc.id} elevation="subtle" className="p-5 bg-white border border-slate-200 rounded-xl">
                <div className="flex justify-between items-center text-xs font-mono text-slate-400 mb-2">
                  <span>Card #{idx + 1}</span>
                  {dc.flashcard.question?.qid && (
                    <span>QID: {dc.flashcard.question.qid}</span>
                  )}
                </div>
                <div className="text-sm font-semibold text-slate-800 mb-3 border-b border-slate-100 pb-2">
                  {dc.flashcard.front}
                </div>
                <div className="text-xs text-slate-600 leading-relaxed">
                  {dc.flashcard.back}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}