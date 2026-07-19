import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

const isMock = process.env.CI === 'true' || !process.env.UPSTASH_REDIS_REST_URL;

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || 'http://localhost:8079', // Fallback for dev if needed
  token: process.env.UPSTASH_REDIS_REST_TOKEN || 'dummy',
})

// Create a new ratelimiter, that allows 10 requests per 10 seconds per IP/User
export const testSubmitRateLimiter = isMock ? { limit: async () => ({ success: true }) } as any : new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
});

export const webhookRateLimiter = isMock ? { limit: async () => ({ success: true }) } as any : new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, "10 s"),
  analytics: true,
});

/**
 * Generic caching utility to check Redis first, and if miss, fetch and cache.
 * @param key Redis cache key
 * @param fetcher Function to fetch data from DB if cache miss
 * @param ttlSeconds Time to live in seconds (default 1 hour = 3600)
 */
export async function getCachedOrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 3600
): Promise<T> {
  if (isMock) {
    return fetcher();
  }

  try {
    const cached = await redis.get<T>(key);
    if (cached !== null) {
      return cached;
    }
  } catch (error) {
    console.error(`[Redis] Error getting key ${key}:`, error);
  }

  // Cache miss or Redis error, fetch fresh data
  const freshData = await fetcher();

  // Don't await the set, let it happen in background
  redis.set(key, freshData, { ex: ttlSeconds }).catch((err) => {
    console.error(`[Redis] Error setting key ${key}:`, err);
  });

  return freshData;
}
