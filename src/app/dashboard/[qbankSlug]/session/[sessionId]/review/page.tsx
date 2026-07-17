import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Bookmark } from 'lucide-react';

export default async function SessionReviewPage(props: { params: Promise<{ qbankSlug: string, sessionId: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    redirect('/login');
  }

  const testSession = await prisma.testSession.findUnique({
    where: { id: params.sessionId },
    include: {
      progress: {
        orderBy: { id: 'asc' },
        include: { question: true }
      },
    },
  });

  if (!testSession || testSession.userId !== session.user.id) {
    notFound();
  }

  const totalQuestions = testSession.progress.length;
  const incompleteCount = testSession.progress.filter(p => !p.selectedAnswer).length;
  const markedCount = testSession.progress.filter(p => p.flagged).length;

  // Windows 95 button style
  const btnStyle = "border-2 border-t-white border-l-white border-b-gray-600 border-r-gray-600 bg-[#c0c0c0] text-black px-3 py-1 flex items-center justify-center gap-1 active:border-t-gray-600 active:border-l-gray-600 active:border-b-white active:border-r-white font-sans text-[13px] font-bold";

  return (
    <div className="flex flex-col h-screen font-sans bg-[#c0c0c0]" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      {/* Top Header */}
      <header className="bg-[#000080] text-white h-[35px] flex items-center justify-between px-3 shrink-0 select-none">
        <div className="text-[13px] font-bold tracking-wide">
          Block {testSession.id.slice(0, 4)} - Item Review
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/${params.qbankSlug}/test/${testSession.id}`} className="text-[13px] font-bold hover:underline">
            Return to Test
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col p-4 overflow-hidden">
        
        <div className="bg-white border-2 border-t-gray-600 border-l-gray-600 border-b-white border-r-white flex-1 flex flex-col shadow-[1px_1px_0px_#000]">
          <div className="p-3 border-b-2 border-gray-600 bg-[#c0c0c0] flex items-center justify-between">
            <h1 className="text-[16px] font-bold text-black">Item Review</h1>
            <div className="flex gap-6 text-[13px] font-bold text-black">
              <span>Total Items: {totalQuestions}</span>
              <span>Incomplete: {incompleteCount}</span>
              <span>Marked: {markedCount}</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto bg-white p-[2px]">
            <table className="w-full border-collapse">
              <thead className="bg-[#c0c0c0] sticky top-0">
                <tr>
                  <th className="border-2 border-t-white border-l-white border-b-gray-600 border-r-gray-600 p-1 text-left text-[13px] font-bold text-black shadow-[inset_1px_1px_0px_#fff]">Item Number</th>
                  <th className="border-2 border-t-white border-l-white border-b-gray-600 border-r-gray-600 p-1 text-left text-[13px] font-bold text-black shadow-[inset_1px_1px_0px_#fff]">Status</th>
                  <th className="border-2 border-t-white border-l-white border-b-gray-600 border-r-gray-600 p-1 text-center text-[13px] font-bold text-black shadow-[inset_1px_1px_0px_#fff]">Marked</th>
                </tr>
              </thead>
              <tbody>
                {testSession.progress.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-blue-800 hover:text-white group text-black cursor-pointer">
                    <td className="border-b border-r border-gray-300 p-1 text-[13px]">
                      <Link href={`/dashboard/${params.qbankSlug}/test/${testSession.id}?item=${idx}`} className="block w-full h-full group-hover:text-white">
                        {idx + 1}
                      </Link>
                    </td>
                    <td className="border-b border-r border-gray-300 p-1 text-[13px]">
                      {p.selectedAnswer ? 'Complete' : 'Incomplete'}
                    </td>
                    <td className="border-b border-gray-300 p-1 text-center text-[13px]">
                      {p.flagged ? <span className="font-bold">M</span> : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-3 bg-[#c0c0c0] border-t-2 border-white flex justify-end gap-3">
            <Link 
              href={`/dashboard/${params.qbankSlug}/test/${testSession.id}`} 
              className={btnStyle}
            >
              Continue Test
            </Link>
            <form action={`/api/test-sessions/${testSession.id}/submit`} method="POST">
              <button 
                type="submit"
                className={btnStyle}
                onClick={(e) => {
                  if (incompleteCount > 0) {
                    if (!confirm(`You have ${incompleteCount} incomplete items. Are you sure you want to end the block?`)) {
                      e.preventDefault();
                    }
                  } else {
                    if (!confirm('Are you sure you want to end the block?')) {
                      e.preventDefault();
                    }
                  }
                }}
              >
                End Block
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
