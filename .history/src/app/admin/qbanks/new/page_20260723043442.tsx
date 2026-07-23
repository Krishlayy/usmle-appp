"use client"
import { createQBank } from '@/app/admin/actions';
import { useState } from 'react';

export default function NewQBankPage() {
  const [slugT, setSlugT] = useState()
  function createSlug(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-")     // Replace spaces with -
    .replace(/-+/g, "-");     // Replace multiple - with single -
}
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Create New QBank</h1>
        <p className="text-slate-500 mt-2">Set up a new question bank module for the store.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-2xl">
        <form action={createQBank} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input 
              type="text" 
              id="title" 
              name="title" 
              onChange={(e) => createSlug}
              required 
              className="w-full border border-slate-300 rounded-md px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. Cardiology QBank"
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-slate-700 mb-1">Slug (URL)</label>
            <input 
              type="text" 
              id="slug" 
              name="slug" 
              required 
              className="w-full border border-slate-300 rounded-md px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. cardiology"
            />
          </div>

          <div>
            <label htmlFor="qbankCode" className="block text-sm font-medium text-slate-700 mb-1">QBank Code (Unique prefix for QIDs, e.g. CARD)</label>
            <input 
              type="text" 
              id="qbankCode" 
              name="qbankCode" 
              required 
              maxLength={10}
              className="w-full border border-slate-300 rounded-md px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. CARD"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea 
              id="description" 
              name="description" 
              rows={4}
              className="w-full border border-slate-300 rounded-md px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Detailed description of what is included..."
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-slate-700 mb-1">Price (in USD)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-500">$</span>
                </div>
                <input 
                  type="number" 
                  step="0.01"
                  id="price" 
                  name="price" 
                  required 
                  className="w-full border border-slate-300 rounded-md pl-8 pr-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="29.99"
                />
              </div>
            </div>
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
              <select 
                id="currency" 
                name="currency" 
                className="w-full border border-slate-300 rounded-md px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>



          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="isActive" 
              name="isActive" 
              defaultChecked
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-slate-700">
              Active (Visible in Store)
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button 
              type="submit" 
              className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 transition shadow-sm"
            >
              Save and Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
