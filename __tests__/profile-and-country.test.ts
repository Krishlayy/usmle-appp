import { describe, it, expect } from 'vitest';
import { findCountryByCode, searchCountries, COUNTRIES } from '../src/lib/countries';
import { setUserCountry, getUserCountry } from '../src/lib/userCountryStore';

describe('Country Data & Profile Store', () => {
  it('contains valid ISO 3166-1 alpha-2 countries', () => {
    expect(COUNTRIES.length).toBeGreaterThan(50);
    const us = findCountryByCode('US');
    expect(us).toBeDefined();
    expect(us?.name).toBe('United States');
  });

  it('performs case-insensitive country code lookup', () => {
    const ca = findCountryByCode('ca');
    expect(ca).toBeDefined();
    expect(ca?.name).toBe('Canada');
    expect(ca?.code).toBe('CA');
  });

  it('returns undefined for invalid country codes', () => {
    expect(findCountryByCode('ZZ')).toBeUndefined();
    expect(findCountryByCode('')).toBeUndefined();
  });

  it('filters countries using search query', () => {
    const results = searchCountries('united');
    expect(results.length).toBeGreaterThanOrEqual(2);
    expect(results.some(c => c.name === 'United States')).toBe(true);
    expect(results.some(c => c.name === 'United Kingdom')).toBe(true);
  });

  it('stores and retrieves student country reliably without database schema mutations', () => {
    const testUserId = 'student_test_' + Math.random().toString(36).substring(2, 9);
    
    expect(getUserCountry(testUserId)).toBeNull();

    setUserCountry(testUserId, {
      countryCode: 'gb',
      countryName: 'United Kingdom'
    });

    const stored = getUserCountry(testUserId);
    expect(stored).not.toBeNull();
    expect(stored?.countryCode).toBe('GB');
    expect(stored?.countryName).toBe('United Kingdom');
  });
});