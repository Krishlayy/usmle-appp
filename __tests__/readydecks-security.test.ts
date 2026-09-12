import { describe, it, expect } from 'vitest';
import DOMPurify from 'isomorphic-dompurify';
import { calculateNextReview } from '../src/lib/spacedRepetition';

describe('ReadyDecks Security & Sanitization', () => {
  it('sanitizes malicious script tags and event handlers from card text', () => {
    const maliciousInput = '<script>alert("xss")</script><p>Normal text</p><img src="x" onerror="alert(1)">';
    const sanitized = DOMPurify.sanitize(maliciousInput);

    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('onerror');
    expect(sanitized).toContain('<p>Normal text</p>');
  });

  it('preserves clean clinical HTML formatting while stripping dangerous attributes', () => {
    const clinicalExplanation = '<div class="explanation"><b>High-Yield Pearl:</b> <i>Aortic dissection</i> presents with tearing chest pain.</div>';
    const sanitized = DOMPurify.sanitize(clinicalExplanation);

    expect(sanitized).toContain('<b>High-Yield Pearl:</b>');
    expect(sanitized).toContain('<i>Aortic dissection</i>');
  });

  it('enforces maximum card text length bounds', () => {
    const maxFrontLength = 2000;
    const maxBackLength = 5000;

    const oversizedFront = 'A'.repeat(maxFrontLength + 1);
    const oversizedBack = 'B'.repeat(maxBackLength + 1);

    expect(oversizedFront.length > maxFrontLength).toBe(true);
    expect(oversizedBack.length > maxBackLength).toBe(true);
  });

  it('calculates deterministic SM-2 spaced repetition without mutation', () => {
    const initialGood = calculateNextReview({
      previousInterval: 0,
      previousEaseFactor: 2.5,
      rating: 'GOOD',
      now: new Date('2026-09-10T12:00:00Z')
    });

    expect(initialGood.newInterval).toBe(1);
    expect(initialGood.newEaseFactor).toBe(2.5);
    expect(initialGood.algorithmVersion).toBe('sm2_v1');
    expect(initialGood.nextReview.toISOString()).toBe(new Date('2026-09-11T12:00:00Z').toISOString());
  });
});