'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowRight, 
  Play, 
  Eye, 
  Sparkles,
  ShieldCheck,
  ChevronLeft
} from 'lucide-react';

interface PresetQBank {
  name: string;
  slug: string;
  code: string;
  specialty: string;
}

const PRESETS: PresetQBank[] = [
  {
    name: 'Autoimmune Diseases Q-Bank',
    slug: 'autoimmune-diseases',
    code: 'AUTO',
    specialty: 'Rheumatology & Immunology',
  },
  {
    name: 'Biologics & Targeted Therapeutics',
    slug: 'biologics-and-their-targets',
    code: 'BIOL',
    specialty: 'Pharmacology & Oncology',
  },
  {
    name: 'Immunodeficiency Disorders Q-Bank',
    slug: 'immunodeficiency-disorders',
    code: 'IMMU',
    specialty: 'Immunology & Pediatrics',
  },
  {
    name: 'Approach to Histology Q-Bank',
    slug: 'approach-to-histology',
    code: 'HIST',
    specialty: 'Pathology & Histology',
  },
];

export default function AdminQBankImportPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const [title, setTitle] = useState(PRESETS[0].name);
  const [slug, setSlug] = useState(PRESETS[0].slug);
  const [qbankCode, setQbankCode] = useState(PRESETS[0].code);
  const [specialtyTag, setSpecialtyTag] = useState(PRESETS[0].specialty);
  const [price, setPrice] = useState('49.00');
  const [replaceExisting, setReplaceExisting] = useState(true);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<any | null>(null);

  const handleSelectPreset = (p: PresetQBank) => {
    setTitle(p.name);
    setSlug(p.slug);
    setQbankCode(p.code);
    setSpecialtyTag(p.specialty);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.docx')) {
        setFile(droppedFile);
        setError(null);
      } else {
        setError('Please drop a Microsoft Word (.docx) file.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select or drop a Microsoft Word (.docx) file to ingest.');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('slug', slug);
      formData.append('qbankCode', qbankCode);
      formData.append('specialtyTag', specialtyTag);
      formData.append('price', String(Math.round(parseFloat(price || '49') * 100)));
      formData.append('replaceExisting', String(replaceExisting));

      const res = await fetch('/api/admin/qbanks/upload-docx', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to process document');
      }

      setUploadResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred during ingestion.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 font-sans">
      
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/qbanks" className="text-xs font-bold text-teal-700 hover:text-teal-900 mb-3 inline-flex items-center gap-1.5 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Manage QBanks</span>
        </Link>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-serif">
          Question Bank Document Ingestor
        </h1>
        <p className="text-slate-600 mt-2 text-sm leading-relaxed">
          Upload Microsoft Word (.docx) question bank files. The ingestor extracts all 50 questions, Green accurate answers, Yellow distractor rationales, HTML comparison tables, and clinical exhibits, publishing directly to the database.
        </p>
      </div>

      {/* Preset System Selector */}
      <div className="mb-8 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal-600" />
          <span>Quick System Presets</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          {PRESETS.map((p) => {
            const isSelected = slug === p.slug;
            return (
              <button
                key={p.slug}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected 
                    ? 'border-teal-500 bg-teal-50/80 text-teal-950 font-bold shadow-xs' 
                    : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <div className="text-xs font-bold truncate">{p.name.replace(' Q-Bank', '')}</div>
                <div className="text-[10px] font-mono text-slate-500 mt-1">{p.code} • {p.specialty.split('&')[0]}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold">Ingestion Error</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Success Report */}
      {uploadResult && (
        <div className="mb-8 p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 shadow-sm animate-fade-in">
          <div className="flex items-start gap-4">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-emerald-900">Ingestion Succeeded!</h3>
              <p className="text-sm text-emerald-800 mt-1">
                {uploadResult.message}
              </p>

              <div className="mt-4 p-4 rounded-xl bg-white/95 border border-emerald-200 text-xs text-slate-700 space-y-1.5">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-500">QBank Title:</span>
                  <span className="font-bold text-slate-900">{uploadResult.qbank?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-500">Slug:</span>
                  <span className="font-mono text-slate-900">{uploadResult.qbank?.slug}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-500">Questions Ingested:</span>
                  <span className="font-bold text-emerald-700">{uploadResult.parsedCount} Questions</span>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/simulator?qbank=${uploadResult.qbank?.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-500 transition-all shadow-xs"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Test in Simulator</span>
                </Link>
                <Link
                  href={`/dashboard/${uploadResult.qbank?.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View in Dashboard</span>
                </Link>
                <Link
                  href="/admin/qbanks"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all"
                >
                  <span>Manage QBanks</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        
        {/* Drag-and-Drop Dropzone */}
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-2">Word Document (.docx)</label>
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
              isDragging 
                ? 'border-teal-500 bg-teal-50/50 scale-[1.01]' 
                : 'border-slate-300 hover:border-teal-500 bg-slate-50/50 hover:bg-teal-50/20'
            }`}
          >
            <input
              type="file"
              id="docxFileInput"
              accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="docxFileInput" className="cursor-pointer flex flex-col items-center">
              <UploadCloud className="w-12 h-12 text-teal-600 mb-3" />
              <span className="text-base font-bold text-slate-800">
                {file ? file.name : 'Click to select or drag and drop your .docx file'}
              </span>
              <span className="text-xs text-slate-500 mt-1">
                {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : 'Accepts official Question Bank Word documents'}
              </span>
            </label>
          </div>
        </div>

        {/* QBank Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 font-mono">
              QBank Display Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 font-mono">
              Slug (URL Identifier)
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 font-mono">
              Specialty Category
            </label>
            <input
              type="text"
              value={specialtyTag}
              onChange={(e) => setSpecialtyTag(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 font-mono">
              QBank Code (e.g. AUTO, BIOL, HIST)
            </label>
            <input
              type="text"
              value={qbankCode}
              onChange={(e) => setQbankCode(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Replace Existing Checkbox */}
        <div className="pt-2">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={replaceExisting}
              onChange={(e) => setReplaceExisting(e.target.checked)}
              className="w-4 h-4 accent-teal-600 cursor-pointer rounded"
            />
            <span className="text-xs font-bold text-slate-700">
              Replace existing questions if QBank already exists (Recommended for clean re-ingestion)
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={uploading || !file}
            className="px-8 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-sm shadow-md shadow-teal-700/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Extracting &amp; Ingesting Questions...</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                <span>Ingest Question Bank (.docx)</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
