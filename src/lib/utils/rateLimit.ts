import { ApiError, HTTP_STATUS } from './appApi';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (identifier: string) => string;
}

// Simple in-memory rate limiter for development
class MockRateLimiter {
  private config: RateLimitConfig;
  private requests: Map<string, number[]> = new Map();

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  async checkLimit(identifier: string): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const key = this.config.keyGenerator 
      ? this.config.keyGenerator(identifier)
      : `rate_limit:${identifier}`;

    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Get current requests for this identifier
    const userRequests = this.requests.get(key) || [];
    
    // Filter out old requests outside the window
    const recentRequests = userRequests.filter(timestamp => timestamp > windowStart);
    
    if (recentRequests.length >= this.config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: now + this.config.windowMs
      };
    }

    // Add current request
    recentRequests.push(now);
    this.requests.set(key, recentRequests);

    // Clean up old entries periodically
    if (Math.random() < 0.1) { // 10% chance to clean up
      this.cleanup();
    }

    return {
      allowed: true,
      remaining: this.config.maxRequests - recentRequests.length,
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

  private cleanup() {
    const now = Date.now();
    const entries = Array.from(this.requests.entries());
    
    for (const [key, timestamps] of entries) {
      const windowStart = now - this.config.windowMs;
      const recentRequests = timestamps.filter((timestamp: number) => timestamp > windowStart);
      
      if (recentRequests.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, recentRequests);
      }
    }
  }
}

// Pre-configured rate limiters using in-memory storage
export const rateLimiters = {
  // 100 requests per 15 minutes for general API
  general: new MockRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100
  }),
  
  // 5 coupon submissions per hour
  couponSubmission: new MockRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5,
    keyGenerator: (identifier: string) => `submission:${identifier}`
  }),
  
  // 20 votes per hour
  voting: new MockRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20,
    keyGenerator: (identifier: string) => `voting:${identifier}`
  })
};

// Helper function to get client identifier
export const getClientIdentifier = (request: Request): string => {
  // In production, use proper IP detection
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'development-user';
  
  return ip;
}; 