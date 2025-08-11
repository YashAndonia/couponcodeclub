import { RateLimiter, rateLimiters, getClientIdentifier } from '@/lib/utils/rateLimit'

// Mock Redis
jest.mock('@/lib/redis', () => ({
  __esModule: true,
  default: {
    zrangebyscore: jest.fn(),
    zadd: jest.fn(),
    expire: jest.fn(),
    zrange: jest.fn()
  }
}))

describe('Rate Limiting', () => {
  let mockRedis: any

  beforeEach(() => {
    mockRedis = require('@/lib/redis').default
    jest.clearAllMocks()
  })

  describe('RateLimiter', () => {
    test('should allow requests within limit', async () => {
      mockRedis.zrangebyscore.mockResolvedValue([])
      mockRedis.zadd.mockResolvedValue(1)
      mockRedis.expire.mockResolvedValue(1)

      const limiter = new RateLimiter({
        windowMs: 60000,
        maxRequests: 10
      })

      const result = await limiter.checkLimit('test-ip')
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(9)
    })

    test('should reject requests over limit', async () => {
      mockRedis.zrangebyscore.mockResolvedValue(['1', '2', '3', '4', '5'])
      mockRedis.zrange.mockResolvedValue([{ score: Date.now() - 30000 }])

      const limiter = new RateLimiter({
        windowMs: 60000,
        maxRequests: 5
      })

      const result = await limiter.checkLimit('test-ip')
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
    })

    test('should throw error when limit exceeded', async () => {
      mockRedis.zrangebyscore.mockResolvedValue(['1', '2', '3', '4', '5'])
      mockRedis.zrange.mockResolvedValue([{ score: Date.now() - 30000 }])

      const limiter = new RateLimiter({
        windowMs: 60000,
        maxRequests: 5
      })

      await expect(limiter.enforceLimit('test-ip')).rejects.toThrow('Rate limit exceeded')
    })
  })

  describe('Pre-configured limiters', () => {
    test('should have correct general limiter config', () => {
      expect(rateLimiters.general).toBeInstanceOf(RateLimiter)
    })

    test('should have correct coupon submission limiter config', () => {
      expect(rateLimiters.couponSubmission).toBeInstanceOf(RateLimiter)
    })

    test('should have correct voting limiter config', () => {
      expect(rateLimiters.voting).toBeInstanceOf(RateLimiter)
    })
  })

  describe('getClientIdentifier', () => {
    test('should extract IP from x-forwarded-for', () => {
      const request = {
        headers: {
          get: jest.fn((header) => {
            if (header === 'x-forwarded-for') return '192.168.1.1, 10.0.0.1'
            return null
          })
        }
      } as any

      const identifier = getClientIdentifier(request)
      expect(identifier).toBe('192.168.1.1')
    })

    test('should use x-real-ip as fallback', () => {
      const request = {
        headers: {
          get: jest.fn((header) => {
            if (header === 'x-real-ip') return '192.168.1.2'
            return null
          })
        }
      } as any

      const identifier = getClientIdentifier(request)
      expect(identifier).toBe('192.168.1.2')
    })

    test('should return unknown if no IP found', () => {
      const request = {
        headers: {
          get: jest.fn(() => null)
        }
      } as any

      const identifier = getClientIdentifier(request)
      expect(identifier).toBe('unknown')
    })
  })
}) 