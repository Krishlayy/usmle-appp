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
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Notes</h1>
          <p className="text-gray-500 mt-1">Review notes you've taken during {qbank.title} blocks</p>
        </div>
        <Link 
          href={`/dashboard/${params.qbankSlug}`}
          className="text-sm font-bold text-gray-600 hover:text-black transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>

      {validNotes.length === 0 ? (
        <div className="bg-gray-50 p-12 text-center rounded border border-gray-200">
          <p className="text-gray-500 font-medium">You haven't taken any notes yet.</p>
          <p className="text-sm text-gray-400 mt-2">Notes you take during a block will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {validNotes.map((note) => (
            <div key={note.id} className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                <span className="font-mono text-xs text-gray-500 font-bold">QID: {note.question.qid}</span>
                <span className="text-xs text-gray-400 font-medium">
                  {new Date(note.attemptedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="p-6">
                <div 
                  className="prose max-w-none text-sm text-gray-700 mb-6 border-l-2 border-gray-200 pl-4 italic"
                  dangerouslySetInnerHTML={{ __html: note.question.questionText }}
                />
                <div className="bg-[#fff9c4] text-black p-4 rounded font-medium whitespace-pre-wrap">
                  {note.notes}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
