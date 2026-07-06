import { QuestionForm } from '@/app/admin/components/QuestionForm';
import Link from 'next/link';

export default function NewQuestionPage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link href={`/admin/qbanks/${params.id}/edit`} className="text-blue-600 hover:underline text-sm mb-4 inline-block">
          &larr; Back to QBank
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Create New Question</h1>
        <p className="text-slate-500 mt-2">Build a new clinical scenario with multiple-choice options.</p>
      </div>

      <QuestionForm qbankId={params.id} />
    </div>
  );
}
