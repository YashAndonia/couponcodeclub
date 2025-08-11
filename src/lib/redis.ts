import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export default redis;

// Rate limiting utility
export async function rateLimit(identifier: string, limit: number, window: number) {
  const key = `rate_limit:${identifier}`;
  const current = await redis.incr(key);
  
  if (current === 1) {
    await redis.expire(key, window);
  }
  
  if (current > limit) {
    return { success: false, remaining: 0 };
  }
  
  return { success: true, remaining: limit - current };
}

// Cache utility
export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const cached = await redis.get(key);
    return cached as T;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
}

export async function setCached(key: string, value: any, ttl: number = 3600) {
  try {
    await redis.setex(key, ttl, value);
  } catch (error) {
    console.error('Redis set error:', error);
  }
} 