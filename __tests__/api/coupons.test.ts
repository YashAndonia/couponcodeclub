const httpMocks = require('node-mocks-http')
import { GET, POST } from '@/app/api/coupons/route'
import { connectTestDB, disconnectTestDB, clearTestDB, createTestUser, createTestCoupon } from '@/lib/test-utils'
import { getServerSession } from 'next-auth'

// Mock NextAuth
jest.mock('next-auth')

// Mock the auth module to avoid MongoDB connection issues
jest.mock('@/lib/auth', () => ({
  authOptions: {
    providers: [],
    adapter: null,
    session: { strategy: 'jwt' },
    callbacks: {},
    pages: {}
  }
}))

// Mock the MongoDB adapter
jest.mock('@/lib/mongodb-adapter', () => ({
  __esModule: true,
  default: Promise.resolve({})
}))

// Mock the dbConnect function to prevent connection conflicts
jest.mock('@/lib/mongodb', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(undefined)
}))

// Mock Redis to prevent rate limiting issues
jest.mock('@/lib/redis', () => ({
  __esModule: true,
  default: {
    zrangebyscore: jest.fn().mockResolvedValue([]),
    zadd: jest.fn().mockResolvedValue(1),
    expire: jest.fn().mockResolvedValue(1),
    zrange: jest.fn().mockResolvedValue([])
  }
}))

describe('/api/coupons', () => {
  beforeAll(async () => {
    await connectTestDB()
  })

  afterAll(async () => {
    await disconnectTestDB()
  })

  beforeEach(async () => {
    await clearTestDB()
  })

  describe('GET /api/coupons', () => {
    test('should return empty array when no coupons exist', async () => {
      const { req } = httpMocks.createMocks({
        method: 'GET',
        url: 'http://localhost:3000/api/coupons'
      })

      const response = await GET(req)
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.data.coupons).toHaveLength(0)
      expect(data.data.pagination.total).toBe(0)
    })

    test('should return coupons with pagination', async () => {
      const user = await createTestUser()
      await createTestCoupon({ brand: 'Amazon' }, user._id)
      await createTestCoupon({ brand: 'Walmart' }, user._id)

      const { req } = httpMocks.createMocks({
        method: 'GET',
        url: 'http://localhost:3000/api/coupons?page=1&limit=10'
      })

      const response = await GET(req)
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.data.coupons).toHaveLength(2)
      expect(data.data.pagination.total).toBe(2)
    })

    test('should filter by brand', async () => {
      const user = await createTestUser()
      await createTestCoupon({ brand: 'Amazon' }, user._id)
      await createTestCoupon({ brand: 'Walmart' }, user._id)

      const { req } = httpMocks.createMocks({
        method: 'GET',
        url: 'http://localhost:3000/api/coupons?brand=Amazon'
      })

      const response = await GET(req)
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.data.coupons).toHaveLength(1)
      expect(data.data.coupons[0].brand).toBe('Amazon')
    })

    test('should filter by submitter', async () => {
      const user1 = await createTestUser({ username: 'user1' })
      const user2 = await createTestUser({ username: 'user2' })
      await createTestCoupon({ brand: 'Amazon' }, user1._id)
      await createTestCoupon({ brand: 'Walmart' }, user2._id)

      const { req } = httpMocks.createMocks({
        method: 'GET',
        url: `http://localhost:3000/api/coupons?submitter=${user1.username}`
      })

      const response = await GET(req)
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.data.coupons).toHaveLength(1)
    })

    test('should sort by recent (default)', async () => {
      const user = await createTestUser()
      await createTestCoupon({ brand: 'Amazon' }, user._id)
      await createTestCoupon({ brand: 'Walmart' }, user._id)

      const { req } = httpMocks.createMocks({
        method: 'GET',
        url: 'http://localhost:3000/api/coupons?sort=recent'
      })

      const response = await GET(req)
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.data.coupons).toHaveLength(2)
    })

    test('should sort by popular', async () => {
      const user = await createTestUser()
      await createTestCoupon({ brand: 'Amazon', upvotes: 10 }, user._id)
      await createTestCoupon({ brand: 'Walmart', upvotes: 5 }, user._id)

      const { req } = httpMocks.createMocks({
        method: 'GET',
        url: 'http://localhost:3000/api/coupons?sort=popular'
      })

      const response = await GET(req)
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.data.coupons).toHaveLength(2)
    })
  })

  describe('POST /api/coupons', () => {
    test('should create coupon with valid data', async () => {
      // Create a proper mock request that matches NextRequest interface
      const req = {
        method: 'POST',
        url: 'http://localhost:3000/api/coupons',
        json: jest.fn().mockResolvedValue({
          brand: 'Amazon',
          code: 'SAVE20',
          description: '20% off everything'
        }),
        headers: {
          get: jest.fn().mockReturnValue('application/json')
        }
      } as any

      // Mock authentication
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { email: 'test@example.com' }
      })

      const response = await POST(req)
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.data.brand).toBe('Amazon')
      expect(data.data.code).toBe('SAVE20')
    })

    test('should reject unauthenticated requests', async () => {
      const req = {
        method: 'POST',
        url: 'http://localhost:3000/api/coupons',
        json: jest.fn().mockResolvedValue({
          brand: 'Amazon',
          code: 'SAVE20',
          description: '20% off'
        }),
        headers: {
          get: jest.fn().mockReturnValue('application/json')
        }
      } as any

      (getServerSession as jest.Mock).mockResolvedValue(null)

      const response = await POST(req)
      const data = await response.json()

      expect(data.success).toBe(false)
      expect(data.error).toContain('Authentication required')
    })

    test('should validate required fields', async () => {
      const req = {
        method: 'POST',
        url: 'http://localhost:3000/api/coupons',
        json: jest.fn().mockResolvedValue({
          brand: 'Amazon' // Missing code and description
        }),
        headers: {
          get: jest.fn().mockReturnValue('application/json')
        }
      } as any

      (getServerSession as jest.Mock).mockResolvedValue({
        user: { email: 'test@example.com' }
      })

      const response = await POST(req)
      const data = await response.json()

      expect(data.success).toBe(false)
      expect(data.error).toContain('Coupon code is required')
      expect(data.error).toContain('Description is required')
    })
  })
}) 