import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function NotesPage(props: { params: Promise<{ qbankSlug: string }> }) {
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

  const notes = await prisma.userProgress.findMany({
    where: {
      userId: session.user.id,
      qbankId: qbank.id,
      notes: {
        not: null
      }
    },
    include: {
      question: true
    },
    orderBy: {
      attemptedAt: 'desc'
    }
  });

  // Filter out empty string notes just in case
  const validNotes = notes.filter(n => n.notes && n.notes.trim().length > 0);

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 md:px-10 md:py-16">
      <div className="mb-10 flex items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-teal-300/80">Study tools</p>
          <h1 className="font-serif text-4xl font-medium tracking-tight text-white">My Notes</h1>
          <p className="mt-2 text-sm text-slate-400">Review notes you&apos;ve taken during {qbank.title} blocks</p>
        </div>
        <Link
          href={`/dashboard/${params.qbankSlug}`}
          className="shrink-0 text-sm text-slate-400 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300"
        >
          Back to Dashboard
        </Link>
      </div>

      {validNotes.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/15 p-12 text-center">
          <p className="font-serif text-xl text-white">You haven&apos;t taken any notes yet.</p>
          <p className="mt-2 text-sm text-slate-400">Notes you take during a block will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {validNotes.map((note) => (
            <article key={note.id} className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.03] backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-teal-300/80">QID: {note.question.qid}</span>
                <span className="font-mono text-xs tabular-nums text-slate-500">
                  {new Date(note.attemptedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="p-6">
                <div
                  className="prose prose-invert mb-6 max-w-none border-l border-white/15 pl-4 text-sm italic text-slate-400"
                  dangerouslySetInnerHTML={{ __html: note.question.questionText }}
                />
                <div className="whitespace-pre-wrap rounded-md border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-100">
                  {note.notes}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}