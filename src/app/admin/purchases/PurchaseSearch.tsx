'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';

export default function PurchaseSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'date_desc';

  const [searchValue, setSearchValue] = useState(currentSearch);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchValue) {
      params.set('search', searchValue);
    } else {
      params.delete('search');
    }
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  const handleSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', e.target.value);
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-4 mb-6">
      <input
        type="text"
        placeholder="Search by student name or email..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        className="px-4 py-2 border rounded-md shadow-sm w-80 text-sm"
      />
      <select 
        value={currentSort} 
        onChange={handleSort}
        className="px-4 py-2 border rounded-md shadow-sm text-sm bg-white"
      >
        <option value="date_desc">Date (Newest First)</option>
        <option value="date_asc">Date (Oldest First)</option>
        <option value="name_asc">Name (A-Z)</option>
        <option value="name_desc">Name (Z-A)</option>
      </select>
      <button 
        type="submit" 
        className="bg-slate-800 text-white px-4 py-2 rounded-md hover:bg-slate-700 transition-colors text-sm"
        disabled={isPending}
      >
        {isPending ? 'Searching...' : 'Search'}
      </button>
    </form>
  );
}
