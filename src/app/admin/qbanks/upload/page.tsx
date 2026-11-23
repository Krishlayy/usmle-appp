'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, ArrowRight, Play, Eye } from 'lucide-react';

export default function UploadQBankDocxPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('Approach to Histology');
  const [slug, setSlug] = useState('approach-to-histology');
  const [qbankCode, setQbankCode] = useState('HIST');
  const [specialtyTag, setSpecialtyTag] = useState('Pathology & Histology');
  const [price, setPrice] = useState('49.00');
  const [replaceExisting, setReplaceExisting] = useState(true);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<any | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setError(null);

      // Auto-detect QBank metadata from uploaded filename
      const fname = selected.name.toLowerCase();
      if (fname.includes('autoimmune')) {
        setTitle('Autoimmune Diseases Q-Bank');
        setSlug('autoimmune-diseases');
        setQbankCode('AUTO');
        setSpecialtyTag('Immunology / Rheumatology');
      } else if (fname.includes('biologic')) {
        setTitle('Biologics & Targeted Therapeutics');
        setSlug('biologics-and-their-targets');
        setQbankCode('BIO');
        setSpecialtyTag('Pharmacology / Oncology');
      } else if (fname.includes('immunodef')) {
        setTitle('Immunodeficiency Disorders Q-Bank');
        setSlug('immunodeficiency-disorders');
        setQbankCode('IMMUNO');
        setSpecialtyTag('Immunology / Genetics');
      } else if (fname.includes('histolog')) {
        setTitle('Approach to Histology');
        setSlug('approach-to-histology');
        setQbankCode('HIST');
        setSpecialtyTag('Pathology & Histology');
      }
    }
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    const autoSlug = val
      .trim()
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    setSlug(autoSlug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a Microsoft Word (.docx) file to upload.');
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
      setError(err.message || 'An unexpected error occurred during upload.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-8">
        <Link href="/admin/qbanks" className="text-sm font-semibold text-teal-700 hover:text-teal-900 mb-3 inline-flex items-center gap-1">
          &larr; Back to Manage QBanks
        </Link>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Upload Question Bank (.docx)</h1>
        <p className="text-slate-500 mt-1.5 text-sm leading-relaxed">
          Upload an official authoring Word document. The system automatically parses all questions, extracts embedded clinical microscopy exhibits and figures, generates clean simple text, formats options, and publishes to the database.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold">Upload Error</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {uploadResult && (
        <div className="mb-8 p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 shadow-sm animate-fade-in">
          <div className="flex items-start gap-4">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-emerald-900">Upload & Ingestion Complete!</h3>
              <p className="text-sm text-emerald-800 mt-1">
                {uploadResult.message}
              </p>

              <div className="mt-4 p-4 rounded-xl bg-white/90 border border-emerald-200/80 text-xs text-slate-700 space-y-1.5">
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
                {uploadResult.sampleQuestion && (
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-500">Sample Item:</span>
                    <span className="text-slate-800">Q{uploadResult.sampleQuestion.num}: {uploadResult.sampleQuestion.title}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/simulator?qbank=${uploadResult.qbank?.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-500 transition-all shadow-xs"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Launch in USMLE Test Player</span>
                </Link>
                <Link
                  href={`/dashboard/${uploadResult.qbank?.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View in Student Dashboard</span>
                </Link>
                <Link
                  href="/admin/qbanks"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all"
                >
                  <span>Manage QBanks List</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        
        {/* File Dropzone */}
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-2">Word Document (.docx)</label>
          <div className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-2xl p-6 text-center transition-colors bg-slate-50/50 hover:bg-teal-50/20">
            <input
              type="file"
              id="docxFile"
              accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="docxFile" className="cursor-pointer flex flex-col items-center">
              <UploadCloud className="w-10 h-10 text-teal-600 mb-2" />
              <span className="text-sm font-bold text-slate-800">
                {file ? file.name : 'Click to select or drag and drop your .docx file'}
              </span>
              <span className="text-xs text-slate-400 mt-1">
                {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload` : 'Supports Microsoft Word (.docx) with embedded images and tables'}
              </span>
            </label>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">QBank Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="e.g. Approach to Histology"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Slug (URL identifier)</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="e.g. approach-to-histology"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Specialty / Category Tag</label>
            <input
              type="text"
              value={specialtyTag}
              onChange={(e) => setSpecialtyTag(e.target.value)}
              required
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="e.g. Pathology & Histology"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">QID Code Prefix</label>
            <input
              type="text"
              value={qbankCode}
              onChange={(e) => setQbankCode(e.target.value.toUpperCase())}
              required
              maxLength={8}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-mono uppercase text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="e.g. HIST"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Price (USD)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">$</span>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="w-full border border-slate-300 rounded-xl pl-8 pr-3.5 py-2.5 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="49.00"
              />
            </div>
          </div>

          <div className="flex items-center pt-6">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={replaceExisting}
                onChange={(e) => setReplaceExisting(e.target.checked)}
                className="w-4 h-4 accent-teal-600 rounded"
              />
              <span className="text-xs font-bold text-slate-800">
                Replace existing questions if QBank already exists
              </span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Extracts all questions, options, exhibits, figures, and embeds clean readable text.
          </span>
          <button
            type="submit"
            disabled={uploading || !file}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-md shadow-teal-700/20 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Processing &amp; Uploading Questions...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4 text-white" />
                <span>Upload &amp; Ingest QBank</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
