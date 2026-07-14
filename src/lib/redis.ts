import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || 'http://localhost:8079', // Fallback for dev if needed
  token: process.env.UPSTASH_REDIS_REST_TOKEN || 'dummy',
})

// Create a new ratelimiter, that allows 10 requests per 10 seconds per IP/User
export const testSubmitRateLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
});

export const webhookRateLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, "10 s"),
  analytics: true,
});
