import { describe, it, expect } from 'vitest';
import { gradeAnswer, getOptionIds } from '../src/lib/grading';

const q = {
  correctAnswer: 'B',
  options: [{ id: 'A' }, { id: 'B' }, { id: 'C', isCorrect: true }],
};

describe('gradeAnswer', () => {
  it('grades the keyed answer correct', () => expect(gradeAnswer(q, 'B')).toBe(true));
  it('grades a wrong answer incorrect', () => expect(gradeAnswer(q, 'A')).toBe(false));
  it('honours option-level isCorrect (multi-key)', () => expect(gradeAnswer(q, 'C')).toBe(true));
  it('returns null when unanswered', () => {
    expect(gradeAnswer(q, null)).toBeNull();
    expect(gradeAnswer(q, undefined)).toBeNull();
  });
  it('treats an unknown id as incorrect', () => expect(gradeAnswer(q, 'Z')).toBe(false));
});

describe('getOptionIds', () => {
  it('lists option ids', () => expect(getOptionIds(q.options)).toEqual(['A', 'B', 'C']));
  it('tolerates malformed JSON', () => expect(getOptionIds(null)).toEqual([]));
});
