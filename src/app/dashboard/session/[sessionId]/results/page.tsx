import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { MediaRenderer } from '@/components/MediaRenderer';

export default async function SessionResultsPage({ params }: { params: { sessionId: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    redirect('/login');
  }

  const testSession = await prisma.testSession.findUnique({
    where: { id: params.sessionId },
    include: {
      qbank: true,
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

  // Map progress into a predictable array structure
  const mappedQuestions = testSession.progress.map((p, idx) => ({
    id: p.id,
    order: idx,
    isCorrect: p.isCorrect,
    selectedOptionId: p.selectedAnswer,
    timeTakenSec: p.timeTakenSec || 0,
    isFlagged: p.flagged,
    question: {
      id: p.question.id,
      qid: p.question.qid,
      questionText: p.question.questionText,
      explanation: p.question.explanation,
      acceptableAnswers: p.question.acceptableAnswers,
      tags: p.question.tags,
      media: p.question.media,
      options: (p.question.options as any[]).map(opt => ({
        ...opt,
        isCorrect: opt.id === p.question.correctAnswer
      })),
    }
  }));

  const qbank = testSession.qbank;

  const totalQuestions = mappedQuestions.length;
  const answeredQuestions = mappedQuestions.filter((q) => q.selectedOptionId).length;
  const correctQuestions = mappedQuestions.filter((q) => q.isCorrect).length;
  
  const scorePercentage = totalQuestions > 0 ? Math.round((correctQuestions / totalQuestions) * 100) : 0;
  
  const timeTakenTotal = mappedQuestions.reduce((sum, q) => sum + q.timeTakenSec, 0);
  const timeTakenMinutes = Math.floor(timeTakenTotal / 60);
  const timeTakenSeconds = timeTakenTotal % 60;

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href={`/dashboard/${qbank.slug}`} className="text-sm text-blue-600 hover:underline mb-2 inline-block">
            &larr; Back to {qbank.title} Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Block Results</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white border rounded-xl p-6 shadow-sm text-center">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Score</h3>
          <div className="text-4xl font-bold text-gray-900">{scorePercentage}%</div>
        </div>
        
        <div className="bg-white border rounded-xl p-6 shadow-sm text-center">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Correct</h3>
          <div className="text-3xl font-bold text-green-600">{correctQuestions} <span className="text-xl text-gray-400">/ {totalQuestions}</span></div>
        </div>

        <div className="bg-white border rounded-xl p-6 shadow-sm text-center">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Answered</h3>
          <div className="text-3xl font-bold text-blue-600">{answeredQuestions} <span className="text-xl text-gray-400">/ {totalQuestions}</span></div>
        </div>

        <div className="bg-white border rounded-xl p-6 shadow-sm text-center">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Time Spent</h3>
          <div className="text-3xl font-bold text-gray-900">
            {timeTakenMinutes}:{timeTakenSeconds.toString().padStart(2, '0')}
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6">Review Questions</h2>
      
      <div className="space-y-6">
        {testSession.progress.map((q, i) => {
          let borderClass = 'border-gray-200';
          let badge = null;
          
          if (!q.selectedAnswer) {
            borderClass = 'border-yellow-300';
            badge = <span className="inline-flex items-center rounded-full bg-yellow-50 px-2.5 py-0.5 text-xs font-semibold text-yellow-800 border border-yellow-200">Omitted</span>;
          } else if (q.isCorrect) {
            borderClass = 'border-green-300';
            badge = <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700 border border-green-200">Correct</span>;
          } else {
            borderClass = 'border-red-300';
            badge = <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700 border border-red-200">Incorrect</span>;
          }

          const options = (q.question.options as { id: string; text: string; isCorrect?: boolean; explanation?: string | null }[]).map(opt => ({
            ...opt,
            isCorrect: opt.id === q.question.correctAnswer
          }));

          return (
            <div key={q.id} className={`bg-white border-2 rounded-xl p-6 shadow-sm ${borderClass}`}>
              <div className="flex justify-between items-start mb-4 border-b pb-4">
                <h3 className="font-bold text-lg flex items-center gap-3">
                  Question {i + 1}
                  <span className="text-sm font-mono text-gray-500 font-normal">[{q.question.qid}]</span>
                  {badge}
                  {q.flagged && (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700 border border-gray-200">
                      Flagged
                    </span>
                  )}
                </h3>
                <div className="text-sm text-gray-500">
                  Time: {Math.floor((q.timeTakenSec || 0) / 60)}:{(q.timeTakenSec || 0) % 60 < 10 ? '0' : ''}{(q.timeTakenSec || 0) % 60}
                </div>
              </div>

              {q.question.tags && q.question.tags.length > 0 && (
                <div className="flex gap-2 mb-4">
                  {q.question.tags.map((tag: string) => (
                    <span key={tag} className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full uppercase tracking-wide font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div 
                className="text-lg font-medium text-gray-800 mb-6 whitespace-pre-wrap leading-relaxed prose prose-slate max-w-none"
                dangerouslySetInnerHTML={{ __html: q.question.questionText }}
              />

              <div className="space-y-2 mb-6">
                {options.map((opt, optIdx) => {
                  const isSelected = q.selectedAnswer === opt.id;
                  const isCorrect = opt.isCorrect;
                  
                  let optStyle = 'border-gray-200 bg-gray-50';
                  let label = isSelected ? <span className="ml-auto text-xs font-bold uppercase tracking-wider opacity-60">Your Answer</span> : null;

                  if (isCorrect) {
                    optStyle = 'border-green-500 bg-green-50 text-green-900 font-medium';
                    if (isSelected) {
                      optStyle = 'border-green-500 bg-green-100 text-green-900 font-medium';
                    }
                  } else if (isSelected) {
                    if (q.question.acceptableAnswers && q.question.acceptableAnswers.includes(opt.id)) {
                      optStyle = 'border-yellow-500 bg-yellow-50 text-yellow-900 font-medium';
                      label = <span className="ml-auto text-xs font-bold uppercase tracking-wider text-yellow-700 bg-yellow-200/50 px-2 py-1 rounded">Close Answer</span>;
                    } else {
                      optStyle = 'border-red-500 bg-red-50 text-red-900 font-medium';
                    }
                  }

                  return (
                    <div key={opt.id} className={`p-3 border rounded-lg flex items-center ${optStyle}`}>
                      <span className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center mr-3 shrink-0 text-sm font-medium text-gray-500 bg-white">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{opt.text}</span>
                      {label}
                    </div>
                  );
                })}
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-lg p-5">
                {/* TOP MEDIA */}
                {q.question.media && q.question.media.filter((m: any) => m.placement === 'TOP').length > 0 && (
                  <div className="mb-6 flex flex-col gap-6 items-center">
                    {q.question.media.filter((m: any) => m.placement === 'TOP').map((m: any) => (
                      <MediaRenderer key={m.id} media={m} />
                    ))}
                  </div>
                )}
                
                <h4 className="font-bold text-blue-900 mb-2">Explanation</h4>
                <div 
                  className="text-blue-800 prose max-w-none text-sm whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: q.question.explanation || '' }}
                />
                
                {/* BOTTOM MEDIA */}
                {q.question.media && q.question.media.filter((m: any) => m.placement === 'BOTTOM').length > 0 && (
                  <div className="mt-6 flex flex-col gap-6 items-center">
                    {q.question.media.filter((m: any) => m.placement === 'BOTTOM').map((m: any) => (
                      <MediaRenderer key={m.id} media={m} />
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-4">
                <h4 className="font-bold text-gray-900 mb-2 border-b pb-2">Choice Details</h4>
                {options.map((opt, idx) => (
                  opt.explanation ? (
                    <div key={opt.id} className="text-[15px] p-4 bg-white border border-gray-200 shadow-sm rounded-sm text-gray-700 leading-relaxed">
                      <span className="font-extrabold text-gray-900 mr-2 bg-gray-100 px-2 py-1 rounded text-sm">
                        Choice {String.fromCharCode(65 + idx)}
                      </span>
                      {opt.explanation}
                    </div>
                  ) : null
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
