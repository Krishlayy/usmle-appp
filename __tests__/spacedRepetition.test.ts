import { describe, it, expect } from 'vitest';
import { calculateNextReview, ALGORITHM_VERSION } from '@/lib/spacedRepetition';

describe('Spaced Repetition Algorithm (SM-2 variant)', () => {
  const baseDate = new Date('2026-09-01T12:00:00Z');

  it('handles first review with AGAIN rating', () => {
    const res = calculateNextReview({
      previousInterval: 0,
      previousEaseFactor: 2.5,
      rating: 'AGAIN',
      now: baseDate,
    });

    expect(res.newInterval).toBe(1);
    expect(res.newEaseFactor).toBe(2.3);
    expect(res.algorithmVersion).toBe(ALGORITHM_VERSION);
    expect(res.nextReview.getTime()).toBe(baseDate.getTime() + 1 * 24 * 60 * 60 * 1000);
  });

  it('handles first review with GOOD rating', () => {
    const res = calculateNextReview({
      previousInterval: 0,
      previousEaseFactor: 2.5,
      rating: 'GOOD',
      now: baseDate,
    });

    expect(res.newInterval).toBe(1);
    expect(res.newEaseFactor).toBe(2.5);
    expect(res.nextReview.getTime()).toBe(baseDate.getTime() + 1 * 24 * 60 * 60 * 1000);
  });

  it('handles first review with EASY rating', () => {
    const res = calculateNextReview({
      previousInterval: 0,
      previousEaseFactor: 2.5,
      rating: 'EASY',
      now: baseDate,
    });

    expect(res.newInterval).toBe(2);
    expect(res.newEaseFactor).toBe(2.65);
  });

  it('advances interval appropriately on second review with GOOD rating', () => {
    const res = calculateNextReview({
      previousInterval: 1,
      previousEaseFactor: 2.5,
      rating: 'GOOD',
      now: baseDate,
    });

    expect(res.newInterval).toBe(3);
    expect(res.newEaseFactor).toBe(2.5);
  });

  it('scales interval geometrically on repeated reviews', () => {
    const res = calculateNextReview({
      previousInterval: 10,
      previousEaseFactor: 2.5,
      rating: 'GOOD',
      now: baseDate,
    });

    // 10 * 2.5 = 25 days
    expect(res.newInterval).toBe(25);
  });

  it('enforces ease factor floor of 1.3 on repeated lapses', () => {
    let ease = 1.4;
    const res = calculateNextReview({
      previousInterval: 14,
      previousEaseFactor: ease,
      rating: 'AGAIN',
      now: baseDate,
    });

    expect(res.newInterval).toBe(1);
    expect(res.newEaseFactor).toBe(1.3);
  });

  it('handles very large/long intervals without overflow', () => {
    const res = calculateNextReview({
      previousInterval: 180,
      previousEaseFactor: 2.8,
      rating: 'EASY',
      now: baseDate,
    });

    expect(res.newInterval).toBeGreaterThan(180);
    expect(res.newEaseFactor).toBeLessThanOrEqual(3.0);
  });

  it('throws an error for invalid rating', () => {
    expect(() => {
      calculateNextReview({
        previousInterval: 0,
        previousEaseFactor: 2.5,
        rating: 'SUPER_EASY' as any,
        now: baseDate,
      });
    }).toThrow(/Invalid rating/);
  });
});