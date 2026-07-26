import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';

export default async function HighlightsDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    redirect('/login');
  }

  const highlights = await prisma.highlight.findMany({
    where: { userId: session.user.id },
    include: {
      question: {
        include: { qbank: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Highlights</h1>
        
        {highlights.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-gray-200 text-center">
            <h2 className="text-xl font-bold mb-2">No highlights yet</h2>
            <p className="text-gray-500">When taking a test, select any text to highlight it.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {highlights.map(h => (
              <div key={h.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <span 
                    className="w-4 h-4 rounded-full border border-gray-300" 
                    style={{ backgroundColor: h.color === 'yellow' ? '#fef08a' : h.color === 'green' ? '#bbf7d0' : h.color === 'blue' ? '#bfdbfe' : h.color === 'red' ? '#fecaca' : '#e9d5ff' }} 
                  />
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{h.section}</span>
                </div>
                
                <div className="flex-1">
                  <p className="text-gray-800 italic leading-relaxed mb-4">"{h.text}"</p>
                  
                  {h.note && (
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4">
                      <p className="text-sm font-semibold text-blue-800">Note:</p>
                      <p className="text-sm text-blue-900">{h.note}</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    <div>QBank: <span className="font-semibold text-gray-700">{h.question.qbank.title}</span></div>
                    <div>Question ID: <span className="font-semibold text-gray-700">{h.question.qid}</span></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
