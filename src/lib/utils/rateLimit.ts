import { Redis } from '@upstash/redis';
import redis from '@/lib/redis'; // Changed from { redis }
import { ApiError, HTTP_STATUS } from './appApi';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (identifier: string) => string;
}

export class RateLimiter {
  private redis: Redis;
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.redis = redis;
    this.config = config;
  }

  async checkLimit(identifier: string): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const key = this.config.keyGenerator 
      ? this.config.keyGenerator(identifier)
      : `rate_limit:${identifier}`;

    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Get current requests in window
    const requests = await this.redis.zrangebyscore(key, windowStart, '+inf');
    
    if (requests.length >= this.config.maxRequests) {
      const oldestRequest = await this.redis.zrange(key, 0, 0, { withScores: true });
      const resetTime = oldestRequest[0] ? oldestRequest[0].score + this.config.windowMs : now + this.config.windowMs;
      
      return {
        allowed: false,
        remaining: 0,
        resetTime
      };
    }

    // Add current request
    await this.redis.zadd(key, { score: now, member: now.toString() });
    await this.redis.expire(key, Math.ceil(this.config.windowMs / 1000));

    return {
      allowed: true,
      remaining: this.config.maxRequests - requests.length - 1,
      resetTime: now + this.config.windowMs
    };
  }

  async enforceLimit(identifier: string): Promise<void> {
    const result = await this.checkLimit(identifier);
    
    if (!result.allowed) {
      throw new ApiError(
        `Rate limit exceeded. Try again in ${Math.ceil((result.resetTime - Date.now()) / 1000)} seconds.`,
        HTTP_STATUS.TOO_MANY_REQUESTS
      );
    }
  }
}

// Pre-configured rate limiters
export const rateLimiters = {
  // 10 requests per minute for general API
  general: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10
  }),
  
  // 5 coupon submissions per hour
  couponSubmission: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5,
    keyGenerator: (identifier: string) => `rate_limit:coupon_submission:${identifier}`
  }),
  
  // 20 votes per hour
  voting: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20,
    keyGenerator: (identifier: string) => `rate_limit:voting:${identifier}`
  })
};

// Helper function to get client identifier
export const getClientIdentifier = (request: Request): string => {
  // In production, use proper IP detection
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';
  
  return ip;
}; 