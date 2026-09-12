'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import CountrySelect from '@/components/ui/CountrySelect';
import { Globe, ArrowRight } from 'lucide-react';

export default function CompleteProfilePage() {
  const router = useRouter();
  const [countryCode, setCountryCode] = useState('');
  const [countryName, setCountryName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!countryCode || !countryName) {
      setError('Please select your country to complete your registration.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/user/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ countryCode, countryName }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to update profile');
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center mx-auto border border-cyan-100">
            <Globe className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Complete Your Profile</h2>
          <p className="text-sm text-slate-500">
            To customize your clinical exam environment, please select your country of study or residence.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block" htmlFor="onboarding-country">
              Country of Study / Residence
            </label>
            <CountrySelect
              id="onboarding-country"
              value={countryCode}
              onChange={(c) => {
                setCountryCode(c.code);
                setCountryName(c.name);
              }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !countryCode}
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
          >
            {loading ? 'Saving...' : (
              <>
                Continue to Dashboard <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}