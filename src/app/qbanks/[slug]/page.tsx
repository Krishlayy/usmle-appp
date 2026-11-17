import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { CheckoutButton } from '@/components/CheckoutButton';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';

export const revalidate = 60;

export default async function QBankDetailPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);

  const qbank = await prisma.qBank.findUnique({
    where: { slug: params.slug },
    include: {
      questions: {
        take: 1,
      },
      purchases: session?.user?.id ? {
        where: { userId: session.user.id }
      } : false,
    },
  });

  if (!qbank || !qbank.isActive) {
    notFound();
  }

  const sampleQuestion = qbank.questions[0];
  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPERADMIN';
  const isOwned = Boolean(isAdmin || (session?.user?.id && qbank.purchases && qbank.purchases.length > 0));

  return (
    <div className="container mx-auto py-12 px-4 md:px-6 max-w-6xl">
      <Link href="/store" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-8 transition-colors">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        Back to Store
      </Link>
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1 space-y-10">
          <div>
            <div className="inline-flex items-center rounded-md bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10 mb-4">
              {qbank.specialtyTag}
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-6">{qbank.title}</h1>
            
            <p className="text-xl text-slate-600 leading-relaxed max-w-3xl">
              {qbank.description}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <h3 className="font-bold text-xl mb-6 text-slate-900 border-b border-slate-100 pb-4">What&apos;s included in this module</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">{qbank.totalQuestions} High-Yield Questions</h4>
                  <p className="text-sm text-slate-500 mt-1">Carefully crafted by experts to match USMLE difficulty.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">In-Depth Explanations</h4>
                  <p className="text-sm text-slate-500 mt-1">Detailed breakdown of both correct and incorrect choices.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Tutor & Timed Modes</h4>
                  <p className="text-sm text-slate-500 mt-1">Practice under real test conditions or learn as you go.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Performance Analytics</h4>
                  <p className="text-sm text-slate-500 mt-1">Track your weaknesses across specific micro-topics.</p>
                </div>
              </div>
            </div>
          </div>

          {sampleQuestion && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-slate-200 text-slate-600 px-4 py-1 rounded-bl-lg font-medium text-xs tracking-wider uppercase">Sample</div>
              <h3 className="font-bold text-xl mb-6 flex items-center text-slate-900">
                <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                Experience the Interface
              </h3>
              <div 
                className="text-slate-800 mb-8 font-medium leading-relaxed prose prose-slate max-w-none"
                dangerouslySetInnerHTML={{ __html: sampleQuestion.questionText }}
              />
              <div className="space-y-4 relative">
                <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center rounded-xl border border-white/50 shadow-sm">
                  <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 text-center max-w-sm w-full mx-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    </div>
                    <h4 className="font-bold text-slate-900 text-lg mb-2">
                      {isOwned ? "You own this module!" : "Unlock Full Access"}
                    </h4>
                    <p className="text-sm text-slate-500 mb-6">
                      {isOwned 
                        ? "Head over to your dashboard to start practicing."
                        : `Purchase this module to reveal answers, detailed explanations, and ${qbank.totalQuestions - 1} more questions.`}
                    </p>
                    {isOwned ? (
                      <Link 
                        href={`/dashboard/${qbank.slug}`}
                        className="flex w-full items-center justify-center rounded-md text-base font-medium transition-colors bg-blue-600 text-white shadow hover:bg-blue-700 h-12 px-8 mb-4"
                      >
                        Go to Dashboard
                      </Link>
                    ) : (
                      <CheckoutButton qbankId={qbank.id} />
                    )}
                  </div>
                </div>
                {['Option A', 'Option B', 'Option C', 'Option D', 'Option E'].map((opt, i) => (
                  <div key={i} className="p-4 border border-slate-200 rounded-lg text-slate-500 bg-white flex items-center">
                    <div className="w-6 h-6 rounded-full border-2 border-slate-300 mr-4 flex-shrink-0"></div>
                    {opt}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:w-96 shrink-0">
          <div className="sticky top-24 border border-blue-100 rounded-2xl p-8 shadow-xl bg-white shadow-blue-900/5">
            <div className="mb-2">
              <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Lifetime Access</span>
            </div>
            <div className="text-5xl font-extrabold mb-8 text-slate-900">
              ${(qbank.price / 100).toFixed(2)}
            </div>
            
            <div className="w-full mb-6">
              {isOwned ? (
                <Link 
                  href={`/dashboard/${qbank.slug}`}
                  className="flex w-full items-center justify-center rounded-md text-base font-medium transition-colors bg-blue-600 text-white shadow hover:bg-blue-700 h-12 px-8 mb-4"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <CheckoutButton qbankId={qbank.id} />
              )}
            </div>
            
            <p className="text-sm text-center text-slate-500 leading-relaxed">
              Secure, one-time payment. <br/>Includes all future updates and errata for this topic bank.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
