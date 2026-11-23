export type StoredOption = {
  id: string;
  text: string;
  isCorrect?: boolean;
  isYellowDistractor?: boolean;
  explanation?: string | null;
};

export function parseOptions(options: unknown): StoredOption[] {
  let list: unknown[] = [];
  if (Array.isArray(options)) {
    list = options;
  } else if (typeof options === 'string') {
    try {
      const parsed = JSON.parse(options);
      if (Array.isArray(parsed)) list = parsed;
    } catch {
      return [];
    }
  }
  return list.map(item => {
    const o = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>;
    return {
      id: String(o.id || ''),
      text: typeof o.text === 'string' ? o.text : '',
      isCorrect: Boolean(o.isCorrect),
      isYellowDistractor: Boolean(o.isYellowDistractor),
      explanation: typeof o.explanation === 'string' ? o.explanation : null,
    };
  });
}

export function getOptionIds(options: unknown): string[] {
  return parseOptions(options).map(o => o.id);
}

/**
 * Server-side grading. The client must never be trusted for correctness.
 * Returns null when nothing is selected.
 */
export function gradeAnswer(
  question: { correctAnswer: string; options: unknown },
  selected: string | null | undefined
): boolean | null {
  if (!selected) return null;
  if (selected === question.correctAnswer) return true;
  const options = parseOptions(question.options);
  const opt = options.find(o => o.id === selected);
  return Boolean(opt?.isCorrect);
}
