import { prisma } from '@/lib/db';

export const FEATURE_FLAGS = {
  READY_DECKS_V2: 'READY_DECKS_V2',
  MEDICAL_LIBRARY: 'MEDICAL_LIBRARY',
  UNIFIED_SEARCH: 'UNIFIED_SEARCH',
  VIDEO_LEARNING: 'VIDEO_LEARNING',
  STUDY_PLANNER: 'STUDY_PLANNER',
} as const;

export type FeatureFlagKey = keyof typeof FEATURE_FLAGS;

// Memory cache for DB flag queries to prevent DB thrashing
interface CacheEntry {
  value: boolean;
  expiry: number;
}

const flagCache: Map<string, CacheEntry> = new Map();
export const DEFAULT_FLAG_STATE: Record<FeatureFlagKey, boolean> = {
  READY_DECKS_V2: true,
  MEDICAL_LIBRARY: true,
  UNIFIED_SEARCH: true,
  VIDEO_LEARNING: true,
  STUDY_PLANNER: true,
};

const CACHE_TTL_MS = 30 * 1000; // 30 seconds

/**
 * Checks whether a feature flag is enabled.
 * Evaluation order:
 * 1. Environment variable override: FF_<KEY> or <KEY> (e.g. FF_READY_DECKS_V2=true)
 * 2. Database FeatureFlag table record
 * 3. Default flag state (true for upgrade modules)
 */
export async function isFeatureEnabled(key: FeatureFlagKey): Promise<boolean> {
  // 1. Environment variable check
  const envVal = process.env[`FF_${key}`] ?? process.env[key];
  if (envVal !== undefined) {
    return envVal === 'true' || envVal === '1';
  }

  // 2. Cache check
  const cached = flagCache.get(key);
  if (cached && cached.expiry > Date.now()) {
    return cached.value;
  }

  // 3. Database check with safe fallback
  try {
    const flag = await prisma.featureFlag.findUnique({
      where: { key },
      select: { enabled: true }
    });

    const isEnabled = flag !== null ? flag.enabled : (DEFAULT_FLAG_STATE[key] ?? true);
    flagCache.set(key, { value: isEnabled, expiry: Date.now() + CACHE_TTL_MS });
    return isEnabled;
  } catch (error) {
    console.warn(`[FeatureFlags] Error checking flag "${key}", falling back to default:`, error);
    return DEFAULT_FLAG_STATE[key] ?? false;
  }
}

/**
 * Returns the status of all known feature flags.
 * Fails safely and returns all false if any error occurs.
 */
export async function getAllFeatureFlags(): Promise<Record<FeatureFlagKey, boolean>> {
  const result: Record<string, boolean> = {};

  for (const key of Object.keys(FEATURE_FLAGS) as FeatureFlagKey[]) {
    result[key] = await isFeatureEnabled(key);
  }

  return result as Record<FeatureFlagKey, boolean>;
}

/**
 * Upserts a feature flag in the database (admin / runtime control).
 */
export async function setFeatureFlag(
  key: FeatureFlagKey,
  enabled: boolean,
  description?: string
): Promise<void> {
  try {
    await prisma.featureFlag.upsert({
      where: { key },
      create: {
        key,
        enabled,
        description: description || `Feature flag for ${key}`,
      },
      update: {
        enabled,
        ...(description ? { description } : {}),
      },
    });

    // Invalidate local cache
    flagCache.delete(key);
  } catch (error) {
    console.error(`[FeatureFlags] Failed to update feature flag "${key}":`, error);
    throw error;
  }
}
