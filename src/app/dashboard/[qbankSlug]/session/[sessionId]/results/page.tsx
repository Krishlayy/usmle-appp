import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';

export default async function SessionResultsPage({ params }: { params: { qbankSlug: string, sessionId: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    redirect('/login');
  }

  const testSession = await prisma.testSession.findUnique({
    where: { id: params.sessionId },
    include: {
      progress: {
        include: {
          question: {
            include: {
              media: {
                orderBy: { order: 'asc' }
              }
            }
          },
        },
        orderBy: { id: 'asc' },
      },
    },
  });

  if (!testSession || testSession.userId !== session.user.id) {
    notFound();
  }

  const qbank = await prisma.qBank.findUnique({ where: { slug: params.qbankSlug } });
  if (!qbank) {
    notFound();
  }

  const totalQuestions = testSession.progress.length;
  const answeredQuestions = testSession.progress.filter(p => p.selectedAnswer).length;
  const correctQuestions = testSession.progress.filter(p => p.isCorrect).length;
  
  const scorePercentage = totalQuestions > 0 ? Math.round((correctQuestions / totalQuestions) * 100) : 0;
  
  const timeTakenTotal = testSession.progress.reduce((sum, p) => sum + (p.timeTakenSec || 0), 0);
  const timeTakenMinutes = Math.floor(timeTakenTotal / 60);
  const timeTakenSeconds = timeTakenTotal % 60;

  return (
    <div className="min-h-screen bg-[#f4f7f9] font-sans">
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <Link href={`/dashboard/${qbank.slug}`} className="text-sm text-blue-500 hover:underline mb-4 inline-block font-medium">
          &larr; Back to {qbank.title} Dashboard
        </Link>
        
        <h1 className="text-[28px] font-extrabold text-[#001738] mb-6 tracking-tight">Block Results</h1>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white rounded-md p-6 shadow-sm border border-slate-200 text-center flex flex-col justify-center h-[120px]">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Score</h3>
            <div className="text-[32px] font-black text-[#001738] leading-none">{scorePercentage}%</div>
          </div>
          
          <div className="bg-white rounded-md p-6 shadow-sm border border-slate-200 text-center flex flex-col justify-center h-[120px]">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Correct</h3>
            <div className="text-[32px] font-black text-emerald-600 leading-none">{correctQuestions} <span className="text-xl text-slate-400 font-bold">/ {totalQuestions}</span></div>
          </div>

          <div className="bg-white rounded-md p-6 shadow-sm border border-slate-200 text-center flex flex-col justify-center h-[120px]">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Answered</h3>
            <div className="text-[32px] font-black text-blue-600 leading-none">{answeredQuestions} <span className="text-xl text-slate-400 font-bold">/ {totalQuestions}</span></div>
          </div>

          <div className="bg-white rounded-md p-6 shadow-sm border border-slate-200 text-center flex flex-col justify-center h-[120px]">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Time Spent</h3>
            <div className="text-[32px] font-black text-[#001738] leading-none">
              {timeTakenMinutes}:{timeTakenSeconds.toString().padStart(2, '0')}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[22px] font-extrabold text-[#001738]">Review Questions</h2>
          <a 
            href={`/dashboard/${params.qbankSlug}/test/${params.sessionId}?mode=review`}
            className="px-6 py-2 bg-[#003b5c] text-white font-bold text-sm rounded shadow hover:bg-[#004f7a] transition-colors"
          >
            Review Test Explanations
          </a>
        </div>
        
        <div className="space-y-6">
          {testSession.progress.map((p, index) => {
            let borderColor = 'border-slate-200';
            let labelBadge = null;
            
            if (!p.selectedAnswer) {
              borderColor = 'border-slate-300';
              labelBadge = <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">Omitted</span>;
            } else if (p.isCorrect) {
              borderColor = 'border-emerald-400';
              labelBadge = <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">Correct</span>;
            } else {
              borderColor = 'border-red-400';
              labelBadge = <span className="text-xs font-semibold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">Incorrect</span>;
            }

            const timeMins = Math.floor((p.timeTakenSec || 0) / 60);
            const timeSecs = (p.timeTakenSec || 0) % 60;

            const tags = p.question.tags as string[] || [];
            
            return (
              <div key={p.id} className={`bg-white rounded-md overflow-hidden border-2 shadow-sm ${borderColor}`}>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-900 flex items-center gap-3">
                      Question {index + 1}
                      <span className="text-xs font-mono text-slate-400 font-semibold tracking-wider">[{p.question.qid}]</span>
                      {labelBadge}
                    </h3>
                    <div className="text-sm font-medium text-slate-500">
                      Time: {timeMins}:{timeSecs.toString().padStart(2, '0')}
                    </div>
                  </div>

                  {tags.length > 0 && (
                    <div className="flex gap-2 mb-6">
                      {tags.map((tag: string) => (
                        <span key={tag} className="bg-slate-100 text-slate-500 text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider font-bold border border-slate-200">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div 
                    className="text-[15px] font-medium text-slate-800 mb-8 leading-relaxed max-w-none"
                    dangerouslySetInnerHTML={{ __html: p.question.questionText }}
                  />

                  <div className="space-y-3">
                    {(p.question.options as { id: string; text: string }[]).map((opt, optIdx) => {
                      const isSelected = p.selectedAnswer === opt.id;
                      const isCorrect = opt.id === p.question.correctAnswer;
                      
                      let optStyle = 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50';
                      let letterStyle = 'border-slate-300 bg-white text-slate-500';
                      
                      if (isCorrect) {
                        optStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-medium z-10 relative';
                        letterStyle = 'border-emerald-500 bg-emerald-500 text-white';
                      } else if (isSelected) {
                        optStyle = 'border-red-500 bg-red-50 text-red-900 font-medium z-10 relative';
                        letterStyle = 'border-red-500 bg-red-500 text-white';
                      }

                      return (
                        <div key={opt.id} className={`p-3.5 border rounded-md flex items-start transition-colors ${optStyle}`}>
                          <span className={`w-6 h-6 rounded-full border flex items-center justify-center mr-4 shrink-0 text-[13px] font-bold ${letterStyle}`}>
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="text-[15px] pt-0.5 leading-snug">{opt.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
