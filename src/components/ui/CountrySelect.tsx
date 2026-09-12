'use client';

import React, { useState, useRef, useEffect } from 'react';
import { COUNTRIES, Country } from '@/lib/countries';
import { ChevronDown, Search, Check } from 'lucide-react';

interface CountrySelectProps {
  value: string; // country code
  onChange: (country: Country) => void;
  required?: boolean;
  id?: string;
  className?: string;
}

export default function CountrySelect({
  value,
  onChange,
  required = false,
  id = 'country-select',
  className = ''
}: CountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCountry = COUNTRIES.find(c => c.code === value);

  const filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-md border border-slate-200 bg-white text-left text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
      >
        <span className={selectedCountry ? 'text-slate-900 font-medium' : 'text-slate-400'}>
          {selectedCountry ? `${selectedCountry.name} (${selectedCountry.code})` : 'Select your country...'}
        </span>
        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-lg border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="p-2 border-b border-slate-100 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search countries..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              autoFocus
            />
          </div>

          <ul
            role="listbox"
            className="max-h-56 overflow-y-auto divide-y divide-slate-50 text-xs py-1"
          >
            {filteredCountries.length === 0 ? (
              <li className="px-4 py-3 text-center text-slate-400">No countries found</li>
            ) : (
              filteredCountries.map((c) => {
                const isSelected = c.code === value;
                return (
                  <li
                    key={c.code}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(c);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`px-3 py-2 cursor-pointer flex items-center justify-between transition-colors ${
                      isSelected ? 'bg-cyan-50 text-cyan-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>{c.name} <span className="text-slate-400 font-normal">({c.code})</span></span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-cyan-600 shrink-0" />}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}