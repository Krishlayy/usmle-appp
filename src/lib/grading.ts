type StoredOption = { id: string; isCorrect?: boolean };

export function getOptionIds(options: unknown): string[] {
  return Array.isArray(options) ? (options as StoredOption[]).map(o => o.id) : [];
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
  const opt = Array.isArray(question.options)
    ? (question.options as StoredOption[]).find(o => o.id === selected)
    : undefined;
  return Boolean(opt?.isCorrect);
}
