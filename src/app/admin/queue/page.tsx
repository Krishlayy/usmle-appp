import { prisma } from '@/lib/db';
import Link from 'next/link';
import { resolveIssue } from './actions';

export default async function ReviewQueuePage() {
  const issues = await prisma.questionIssue.findMany({
    where: { status: 'OPEN' },
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
      question: { select: { id: true, qbankId: true, qid: true, questionText: true } }
    }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Flagged Question Queue</h1>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {issues.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Queue is empty!</h3>
            <p>There are no open issues reported by students.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {issues.map(issue => (
              <div key={issue.id} className="p-6 hover:bg-slate-50 transition-colors flex gap-6">
                <div className="shrink-0 w-32 flex flex-col items-center">
                  <div className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 text-center">
                    {issue.issueType}
                  </div>
                  <span className="text-xs text-slate-400">{issue.createdAt.toLocaleDateString()}</span>
                </div>
                
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-700">Reporter:</span>
                    <span className="text-sm text-slate-600">{issue.user.name || 'Unknown'} ({issue.user.email})</span>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-lg text-slate-800 text-sm italic">
                    "{issue.description}"
                  </div>
                  
                  <div className="border border-slate-200 p-4 rounded-lg bg-white">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Question Context</span>
                      <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded border">QID: {issue.question.qid}</span>
                    </div>
                    <div 
                      className="text-sm text-slate-700 line-clamp-2 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: issue.question.questionText }}
                    />
                  </div>
                </div>
                
                <div className="shrink-0 flex flex-col gap-2">
                  <Link 
                    href={`/admin/qbanks/${issue.question.qbankId}/questions/${issue.question.id}/edit`} 
                    className="w-32 bg-slate-800 hover:bg-slate-900 text-white text-center py-2 rounded-lg text-sm font-bold shadow-sm transition-colors"
                  >
                    Edit Question
                  </Link>
                  <form action={async () => {
                    'use server';
                    await resolveIssue(issue.id);
                  }}>
                    <button type="submit" className="w-32 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-center py-2 rounded-lg text-sm font-bold transition-colors border border-emerald-200">
                      Mark Resolved
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
