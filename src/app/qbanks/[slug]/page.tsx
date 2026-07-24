import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { CheckoutButton } from '@/components/CheckoutButton';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { ChevronLeft, CheckCircle2, Lock, Zap, BookOpen, Activity, Play } from 'lucide-react';

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
  const isOwned = session?.user?.id && qbank.purchases && qbank.purchases.length > 0;

  return (
    <div className="min-h-screen bg-[var(--background)] animate-page-enter">
      
      {/* Top Nav Bar */}
      <div className="bg-white border-b border-[var(--color-border-subtle)] sticky top-0 z-20">
        <div className="container mx-auto px-4 md:px-8 h-16 flex items-center max-w-7xl">
          <Link href="/store" className="inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:text-primary transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to Curriculum Store
          </Link>
        </div>
      </div>

      <div className="container mx-auto py-12 px-4 md:px-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* Main Content Pane */}
          <div className="flex-1 space-y-12">
            
            {/* Header Area */}
            <div>
              <span className="inline-block bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-widest py-1.5 px-3 rounded-md mb-4 border border-blue-100">
                {qbank.specialtyTag}
              </span>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary mb-6 leading-tight">
                {qbank.title}
              </h1>
              <p className="text-lg text-secondary font-medium leading-relaxed max-w-3xl">
                {qbank.description}
              </p>
            </div>

            {/* Features Grid */}
            <div className="bg-white border border-[var(--color-border-subtle)] rounded-xl p-8 shadow-sm">
              <h3 className="font-bold text-xl mb-8 text-primary flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-blue-600" /> What's Included
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary mb-1">{qbank.totalQuestions} High-Yield Questions</h4>
                    <p className="text-sm text-secondary font-medium leading-relaxed">Carefully crafted by top-scorers to match USMLE and NBME difficulty. No fluff.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                    <Zap className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary mb-1">In-Depth Explanations</h4>
                    <p className="text-sm text-secondary font-medium leading-relaxed">Detailed breakdown of both correct and incorrect choices, with vivid educational images.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                    <Activity className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary mb-1">Performance Analytics</h4>
                    <p className="text-sm text-secondary font-medium leading-relaxed">Track your weaknesses across specific micro-topics and optimize your study schedule.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                    <Play className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary mb-1">Tutor & Timed Modes</h4>
                    <p className="text-sm text-secondary font-medium leading-relaxed">Practice under real test conditions or learn as you go with immediate feedback.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sample Question Preview */}
            {sampleQuestion && (
              <div className="bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)] rounded-xl relative overflow-hidden">
                
                <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1.5 rounded-bl-xl font-bold text-xs tracking-wider uppercase z-10 shadow-sm">
                  Interface Preview
                </div>
                
                <div className="p-10 relative">
                  <div 
                    className="text-primary mb-8 font-medium leading-relaxed prose prose-slate max-w-none prose-p:text-[15px]"
                    dangerouslySetInnerHTML={{ __html: sampleQuestion.questionText }}
                  />
                  
                  <div className="space-y-3 relative z-0">
                    {/* Overlay for locked state */}
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[3px] z-10 flex flex-col items-center justify-center rounded-xl border border-white/50">
                      <div className="bg-white p-8 rounded-xl shadow-lg border border-[var(--color-border-subtle)] text-center max-w-md w-full mx-4">
                        <div className="w-14 h-14 bg-blue-50 border border-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-5">
                          <Lock className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold text-primary text-xl mb-3">
                          {isOwned ? "Module Unlocked" : "Unlock Full Access"}
                        </h4>
                        <p className="text-sm text-secondary font-medium mb-8 leading-relaxed">
                          {isOwned 
                            ? "You have full access to this content. Head over to your dashboard to start practicing."
                            : `Purchase this module to reveal answers, read detailed explanations, and access the remaining ${qbank.totalQuestions - 1} questions.`}
                        </p>
                        {isOwned ? (
                          <Link 
                            href={`/dashboard/${qbank.slug}`}
                            className="flex w-full items-center justify-center rounded-md text-sm font-bold transition-all bg-blue-600 text-white shadow-sm hover:shadow-md hover:bg-blue-700 h-12 px-8"
                          >
                            Go to Dashboard
                          </Link>
                        ) : (
                          <CheckoutButton qbankId={qbank.id} />
                        )}
                      </div>
                    </div>

                    {['Option A', 'Option B', 'Option C', 'Option D', 'Option E'].map((opt, i) => (
                      <div key={i} className="p-4 border border-[var(--color-border-subtle)] rounded-lg text-secondary font-medium bg-white flex items-center shadow-sm">
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 mr-4 flex-shrink-0"></div>
                        {opt}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Purchase Pane */}
          <div className="lg:w-[400px] shrink-0">
            <div className="sticky top-24 border border-[var(--color-border-subtle)] rounded-2xl p-8 bg-white shadow-xl shadow-slate-200/40">
              
              <div className="mb-4">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                  Lifetime Access
                </span>
              </div>
              
              <div className="flex items-end gap-1 mb-8">
                <span className="text-6xl font-extrabold tracking-tighter text-primary">${(qbank.price / 100).toFixed(0)}</span>
                <span className="text-xl font-bold text-secondary mb-1">.00</span>
              </div>
              
              <div className="w-full mb-8">
                {isOwned ? (
                  <Link 
                    href={`/dashboard/${qbank.slug}`}
                    className="flex w-full items-center justify-center rounded-md text-[15px] font-bold transition-all bg-blue-600 text-white shadow-sm hover:shadow-md hover:bg-blue-700 h-14 px-8"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <CheckoutButton qbankId={qbank.id} />
                )}
              </div>
              
              <div className="space-y-4 pt-6 border-t border-[var(--color-border-subtle)]">
                <div className="flex items-center justify-center gap-2 text-sm text-secondary font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Secure one-time payment
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-secondary font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Instant account access
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-secondary font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Includes all future updates
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
