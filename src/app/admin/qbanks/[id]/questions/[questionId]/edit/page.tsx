import { QuestionForm } from '@/app/admin/components/QuestionForm';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function EditQuestionPage(props: { params: Promise<{ id: string, questionId: string }> }) {
  const params = await props.params;
  const question = await prisma.question.findUnique({
    where: { id: params.questionId },
    include: { media: { orderBy: { order: 'asc' } } }
  });

  if (!question || question.qbankId !== params.id) {
    notFound();
  }

  // Parse options since they are stored as JSON
  const initialData = {
    ...question,
    options: typeof question.options === 'string' ? JSON.parse(question.options) : question.options,
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link href={`/admin/qbanks/${params.id}/edit`} className="text-blue-600 hover:underline text-sm mb-4 inline-block">
          &larr; Back to QBank
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Edit Question</h1>
        <p className="text-slate-500 mt-2 font-mono text-sm">ID: {question.id}</p>
      </div>

      <QuestionForm qbankId={params.id} initialData={initialData} />
    </div>
  );
}
