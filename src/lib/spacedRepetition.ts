export type FlashcardRating = 'AGAIN' | 'GOOD' | 'EASY';

export interface ReviewCalculationInput {
  previousInterval: number; // in days
  previousEaseFactor: number;
  rating: FlashcardRating;
  now?: Date;
}

export interface ReviewCalculationResult {
  newInterval: number; // in days
  newEaseFactor: number;
  nextReview: Date;
  algorithmVersion: string;
}

export const ALGORITHM_VERSION = 'sm2_v1';

export const SM2_CONSTANTS = {
  MIN_EASE_FACTOR: 1.3,
  DEFAULT_EASE_FACTOR: 2.5,
  MAX_EASE_FACTOR: 3.0,
};

/**
 * Deterministic spaced-repetition calculation (SM-2 variant).
 * Server-side authoritative scheduling.
 */
export function calculateNextReview({
  previousInterval,
  previousEaseFactor,
  rating,
  now = new Date(),
}: ReviewCalculationInput): ReviewCalculationResult {
  // Clamp previous ease factor to reasonable bounds
  const currentEase = Math.max(1.3, Math.min(3.0, previousEaseFactor || 2.5));
  const currentInterval = Math.max(0, previousInterval || 0);

  let newInterval: number;
  let newEaseFactor: number;

  switch (rating) {
    case 'AGAIN':
      // Lapse: reset interval to 1 day and penalize ease factor
      newInterval = 1;
      newEaseFactor = Math.max(1.3, Number((currentEase - 0.2).toFixed(2)));
      break;

    case 'GOOD':
      if (currentInterval === 0) {
        newInterval = 1;
      } else if (currentInterval === 1) {
        newInterval = 3;
      } else {
        newInterval = Math.max(currentInterval + 1, Math.round(currentInterval * currentEase));
      }
      newEaseFactor = currentEase;
      break;

    case 'EASY':
      if (currentInterval === 0) {
        newInterval = 2;
      } else if (currentInterval === 1) {
        newInterval = 4;
      } else {
        newInterval = Math.max(currentInterval + 2, Math.round(currentInterval * currentEase * 1.3));
      }
      newEaseFactor = Math.min(3.0, Number((currentEase + 0.15).toFixed(2)));
      break;

    default:
      throw new Error(`Invalid rating "${rating}". Must be AGAIN, GOOD, or EASY.`);
  }

  // Calculate nextReview timestamp
  const nextReview = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000);

  return {
    newInterval,
    newEaseFactor,
    nextReview,
    algorithmVersion: ALGORITHM_VERSION,
  };
}
