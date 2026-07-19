'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createAdminUser } from './actions';
import { ShieldCheck, UserPlus, ArrowLeft } from 'lucide-react';

export default function NewAdminUserPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await createAdminUser(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else if (result?.success) {
      router.push('/admin/users');
      router.refresh();
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Link href="/admin/users" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors mb-6">
        <ArrowLeft size={16} />
        Back to User Directory
      </Link>

      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
            <UserPlus size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Create Admin User</h1>
            <p className="text-sm text-slate-500 mt-1">Add a new employee to manage the QBank platform.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md text-sm font-medium mb-6 border border-red-100 flex items-start gap-2">
            <ShieldCheck size={18} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
            <input 
              type="text" 
              name="name" 
              required
              placeholder="e.g., Jane Doe"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-medium text-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
            <input 
              type="email" 
              name="email" 
              required
              placeholder="jane@microqbank.com"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-medium text-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Temporary Password</label>
            <input 
              type="password" 
              name="password" 
              required
              minLength={6}
              placeholder="Minimum 6 characters"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-medium text-slate-900"
            />
            <p className="text-xs text-slate-500 mt-2 font-medium">The employee can reset this later.</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Role Level</label>
            <select 
              name="role" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-bold text-slate-900"
            >
              <option value="ADMIN">Admin (Content Manager)</option>
              <option value="SUPERADMIN">Superadmin (Full Access)</option>
            </select>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Employee Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
