import { createMocks } from 'node-mocks-http'
import { GET } from '@/app/api/brands/[brandName]/route'
import { connectTestDB, disconnectTestDB, clearTestDB, createTestUser, createTestCoupon } from '@/lib/test-utils'

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

describe('/api/brands/[brandName]', () => {
  beforeAll(async () => {
    await connectTestDB()
  })

  afterAll(async () => {
    await disconnectTestDB()
  })

  beforeEach(async () => {
    await clearTestDB()
  })

  test('should return brand coupons with stats', async () => {
    const user = await createTestUser()
    await createTestCoupon({ 
      brand: 'Amazon', 
      code: 'SAVE20',
      upvotes: 10,
      downvotes: 2
    }, user._id)
    await createTestCoupon({ 
      brand: 'Amazon', 
      code: 'SAVE10',
      upvotes: 5,
      downvotes: 1
    }, user._id)
    await createTestCoupon({ 
      brand: 'Walmart', 
      code: 'SAVE15',
      upvotes: 8,
      downvotes: 3
    }, user._id)

    const { req } = createMocks({
      method: 'GET',
      url: 'http://localhost:3000/api/brands/amazon'
    })

    const response = await GET(req, { params: { brandName: 'amazon' } })
    const data = await response.json()

    expect(data.success).toBe(true)
    expect(data.data.brand).toBe('amazon')
    expect(data.data.coupons).toHaveLength(2)
    expect(data.data.stats.totalCoupons).toBe(2)
    expect(data.data.stats.totalUpvotes).toBe(15)
    expect(data.data.stats.totalDownvotes).toBe(3)
    expect(data.data.stats.avgSuccessRate).toBe(83) // (15/18) * 100 rounded
  })

  test('should handle brand with no coupons', async () => {
    const { req } = createMocks({
      method: 'GET',
      url: 'http://localhost:3000/api/brands/nonexistent'
    })

    const response = await GET(req, { params: { brandName: 'nonexistent' } })
    const data = await response.json()

    expect(data.success).toBe(true)
    expect(data.data.brand).toBe('nonexistent')
    expect(data.data.coupons).toHaveLength(0)
    expect(data.data.stats.totalCoupons).toBe(0)
    expect(data.data.stats.totalUpvotes).toBe(0)
    expect(data.data.stats.totalDownvotes).toBe(0)
    expect(data.data.stats.avgSuccessRate).toBe(0)
  })

  test('should be case insensitive', async () => {
    const user = await createTestUser()
    await createTestCoupon({ brand: 'Amazon', code: 'SAVE20' }, user._id)

    const { req } = createMocks({
      method: 'GET',
      url: 'http://localhost:3000/api/brands/AMAZON'
    })

    const response = await GET(req, { params: { brandName: 'AMAZON' } })
    const data = await response.json()

    expect(data.success).toBe(true)
    expect(data.data.coupons).toHaveLength(1)
    expect(data.data.coupons[0].brand).toBe('Amazon')
  })

  test('should handle URL encoded brand names', async () => {
    const user = await createTestUser()
    await createTestCoupon({ brand: 'Best Buy', code: 'SAVE20' }, user._id)

    const { req } = createMocks({
      method: 'GET',
      url: 'http://localhost:3000/api/brands/Best%20Buy'
    })

    const response = await GET(req, { params: { brandName: 'Best%20Buy' } })
    const data = await response.json()

    expect(data.success).toBe(true)
    expect(data.data.brand).toBe('Best Buy')
    expect(data.data.coupons).toHaveLength(1)
  })

  test('should sort coupons correctly', async () => {
    const user = await createTestUser()
    const coupon1 = await createTestCoupon({ 
      brand: 'Amazon', 
      code: 'SAVE20',
      upvotes: 5 
    }, user._id)
    const coupon2 = await createTestCoupon({ 
      brand: 'Amazon', 
      code: 'SAVE10',
      upvotes: 10 
    }, user._id)

    const { req } = createMocks({
      method: 'GET',
      url: 'http://localhost:3000/api/brands/amazon?sort=popular'
    })

    const response = await GET(req, { params: { brandName: 'amazon' } })
    const data = await response.json()

    expect(data.success).toBe(true)
    expect(data.data.coupons[0]._id).toBe(coupon2._id.toString()) // Higher upvotes first
    expect(data.data.coupons[1]._id).toBe(coupon1._id.toString())
  })

  test('should return pagination info', async () => {
    const user = await createTestUser()
    await createTestCoupon({ brand: 'Amazon', code: 'SAVE20' }, user._id)
    await createTestCoupon({ brand: 'Amazon', code: 'SAVE10' }, user._id)

    const { req } = createMocks({
      method: 'GET',
      url: 'http://localhost:3000/api/brands/amazon?page=1&limit=1'
    })

    const response = await GET(req, { params: { brandName: 'amazon' } })
    const data = await response.json()

    expect(data.success).toBe(true)
    expect(data.data.coupons).toHaveLength(1)
    expect(data.data.pagination.total).toBe(2)
    expect(data.data.pagination.pages).toBe(2)
  })
}) 