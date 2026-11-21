import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { CheckoutButton } from '@/components/CheckoutButton';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { VideoBackdrop } from '@/components/ui/VideoBackdrop';
import { Reveal } from '@/components/ui/Reveal';

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

  const checkIcon = (
    <svg className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
    </svg>
  );

  const includes = [
    { title: `${qbank.totalQuestions} High-Yield Questions`, body: 'Carefully crafted by experts to match USMLE difficulty.' },
    { title: 'In-Depth Explanations', body: 'Detailed breakdown of both correct and incorrect choices.' },
    { title: 'Tutor & Timed Modes', body: 'Practice under real test conditions or learn as you go.' },
    { title: 'Performance Analytics', body: 'Track your weaknesses across specific micro-topics.' },
  ];

  const goToDashboard = (
    <Link
      href={`/dashboard/${qbank.slug}`}
      className="flex h-11 w-full items-center justify-center rounded-md bg-white px-6 text-sm font-semibold text-slate-950 transition-colors hover:bg-teal-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300"
    >
      Go to Dashboard
    </Link>
  );

  return (
    <div className="relative min-h-screen text-slate-100">
      <VideoBackdrop />
      <div className="mx-auto max-w-6xl px-5 py-12 md:px-10 md:py-16">
        <Link href="/store" className="mb-10 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Store
        </Link>
        <div className="flex flex-col gap-12 lg:flex-row">
          <div className="flex-1 space-y-12">
            <Reveal>
              <p className="mb-4 font-mono text-[11px] uppercase tracking-wider text-teal-300/80">{qbank.specialtyTag}</p>
              <h1 className="mb-6 font-serif text-4xl font-medium leading-[1.1] tracking-tight text-white md:text-5xl">{qbank.title}</h1>
              <p className="max-w-3xl text-lg leading-relaxed text-slate-400">
                {qbank.description}
              </p>
            </Reveal>

            <Reveal>
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl">
                <h2 className="mb-6 border-b border-white/10 pb-4 font-serif text-xl font-medium text-white">What&apos;s included in this module</h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {includes.map((item) => (
                    <div key={item.title} className="flex items-start gap-3">
                      {checkIcon}
                      <div>
                        <h3 className="text-sm font-medium text-slate-100">{item.title}</h3>
                        <p className="mt-1 text-sm text-slate-400">{item.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            {sampleQuestion && (
              <Reveal>
                <div className="relative rounded-lg border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl">
                  <span className="absolute right-4 top-4 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">Sample</span>
                  <h2 className="mb-6 font-serif text-xl font-medium text-white">Experience the Interface</h2>
                  <div
                    className="prose prose-invert mb-8 max-w-none font-medium leading-relaxed text-slate-200"
                    dangerouslySetInnerHTML={{ __html: sampleQuestion.questionText }}
                  />
                  <div className="relative space-y-3">
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-lg bg-[#070a0f]/80 backdrop-blur-[2px]">
                      <div className="mx-4 w-full max-w-sm rounded-lg border border-white/15 bg-[#0d1219] p-6 text-center">
                        <h3 className="mb-2 font-serif text-lg font-medium text-white">
                          {isOwned ? "You own this module!" : "Unlock Full Access"}
                        </h3>
                        <p className="mb-6 text-sm text-slate-400">
                          {isOwned
                            ? "Head over to your dashboard to start practicing."
                            : `Purchase this module to reveal answers, detailed explanations, and ${qbank.totalQuestions - 1} more questions.`}
                        </p>
                        {isOwned ? goToDashboard : <CheckoutButton qbankId={qbank.id} />}
                      </div>
                    </div>
                    {['Option A', 'Option B', 'Option C', 'Option D', 'Option E'].map((opt, i) => (
                      <div key={i} className="flex items-center rounded-md border border-white/10 p-4 text-slate-500">
                        <div className="mr-4 h-5 w-5 shrink-0 rounded-full border border-white/20"></div>
                        {opt}
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            )}
          </div>

          <div className="shrink-0 lg:w-96">
            <Reveal delay={0.1}>
              <div className="sticky top-24 rounded-lg border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl">
                <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-400">Lifetime Access</p>
                <div className="mb-8 font-mono text-5xl font-medium tabular-nums text-white">
                  ${(qbank.price / 100).toFixed(2)}
                </div>

                <div className="mb-6 w-full">
                  {isOwned ? goToDashboard : <CheckoutButton qbankId={qbank.id} />}
                </div>

                <p className="text-center text-sm leading-relaxed text-slate-400">
                  Secure, one-time payment. <br />Includes all future updates and errata for this topic bank.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  );
}