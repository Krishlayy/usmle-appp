import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { updateQBank } from '@/app/admin/actions';
import { DeleteQuestionButton } from '@/app/admin/components/DeleteQuestionButton';
import { DeleteQBankButton } from '@/app/admin/components/DeleteQBankButton';
import { TagInput } from '@/app/admin/components/TagInput';
import { AdminImageZoom } from '@/components/AdminImageZoom';

export default async function EditQBankPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const qbank = await prisma.qBank.findUnique({
    where: { id: params.id },
    include: {
      questions: {
        select: {
          id: true,
          youtubeId: true,
          questionText: true,
          status: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!qbank) {
    notFound();
  }

  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/qbanks" className="text-blue-600 hover:underline text-sm mb-4 inline-block">&larr; Back to QBanks</Link>
        <h1 className="text-3xl font-bold text-slate-900">Manage: {qbank.title}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Edit Details */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-xl font-bold mb-6 text-slate-800 border-b pb-4">QBank Details</h2>
            <form action={updateQBank} className="space-y-4">
              <input type="hidden" name="id" value={qbank.id} />
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input type="text" name="title" defaultValue={qbank.title} required className="w-full border rounded-md px-3 py-2" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
                <input type="text" name="slug" defaultValue={qbank.slug} required className="w-full border rounded-md px-3 py-2 bg-slate-50 text-slate-500" readOnly />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">QBank Code</label>
                <input type="text" name="qbankCode" defaultValue={qbank.qbankCode} required className="w-full border rounded-md px-3 py-2 bg-slate-50 text-slate-500" readOnly />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Price</label>
                <input type="number" step="0.01" name="price" defaultValue={(qbank.price / 100).toFixed(2)} required className="w-full border rounded-md px-3 py-2" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bibliography / Index Tags</label>
                <p className="text-xs text-slate-500 mb-2">These tags will be used to automatically tag new questions.</p>
                <TagInput name="bibliographyTags" initialTags={qbank.bibliographyTags} />
              </div>

              <div className="flex items-center">
                <input type="checkbox" name="isActive" id="isActive" defaultChecked={qbank.isActive} className="rounded border-slate-300 text-blue-600" />
                <label htmlFor="isActive" className="ml-2 text-sm text-slate-700">Active (Visible)</label>
              </div>

              <button type="submit" className="w-full bg-slate-900 text-white rounded-md py-2 font-medium hover:bg-slate-800">
                Update Details
              </button>
            </form>
            
            <hr className="my-6 border-slate-200" />
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500 font-medium">Danger Zone</span>
              <DeleteQBankButton qbankId={qbank.id} title={qbank.title} />
            </div>
          </div>
        </div>

        {/* Right Column: Questions List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex justify-between items-center border-b pb-4 mb-6">
              <h2 className="text-xl font-bold text-slate-800">Questions ({qbank.questions.length})</h2>
              <Link href={`/admin/qbanks/${qbank.id}/questions/new`} className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-700">
                + Add Question
              </Link>
            </div>

            <div className="space-y-4">
              <AdminImageZoom>
                {qbank.questions.map((q) => (
                  <div key={q.id} className="border border-slate-200 rounded-lg p-4 flex justify-between items-start hover:border-blue-300 transition-colors mb-4">
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded font-mono">ID: {q.id.slice(-6)}</span>
                        {q.status === 'DRAFT' && <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded font-medium">DRAFT</span>}
                        {q.status === 'PUBLISHED' && <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded font-medium">PUBLISHED</span>}
                        {q.status === 'ARCHIVED' && <span className="bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded font-medium">ARCHIVED</span>}
                        {q.youtubeId && <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded flex items-center gap-1">📺 Video</span>}
                      </div>
                      <div 
                        className="text-slate-800 text-sm line-clamp-2 prose prose-sm max-w-none" 
                        dangerouslySetInnerHTML={{ __html: q.questionText }} 
                      />
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Link href={`/admin/qbanks/${qbank.id}/questions/${q.id}/edit`} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded text-sm font-medium hover:bg-slate-200">
                        Edit
                      </Link>
                      <DeleteQuestionButton questionId={q.id} />
                    </div>
                  </div>
                ))}
              </AdminImageZoom>
              
              {qbank.questions.length === 0 && (
                <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                  No questions in this bank yet.<br/>
                  <Link href={`/admin/qbanks/${qbank.id}/questions/new`} className="text-blue-600 hover:underline mt-2 inline-block">Create the first one</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
