import 'dotenv/config';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || 'http://localhost:8079',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || 'dummy',
});

async function clearCache() {
  await redis.del('qbanks:active');
  await redis.del('qbanks:storefront:active');
  console.log('Cache cleared successfully!');
}

clearCache();
