import { createMocks } from 'node-mocks-http'
import { GET } from '@/app/api/search/route'
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

describe('/api/search', () => {
  beforeAll(async () => {
    await connectTestDB()
  })

  afterAll(async () => {
    await disconnectTestDB()
  })

  beforeEach(async () => {
    await clearTestDB()
  })

  test('should require search query', async () => {
    const { req } = createMocks({
      method: 'GET',
      url: 'http://localhost:3000/api/search'
    })

    const response = await GET(req)
    const data = await response.json()

    expect(data.success).toBe(false)
    expect(data.error).toContain('Search query is required')
  })

  test('should search by brand name', async () => {
    const user = await createTestUser()
    await createTestCoupon({ brand: 'Amazon', code: 'SAVE20' }, user._id)
    await createTestCoupon({ brand: 'Walmart', code: 'SAVE10' }, user._id)

    const { req } = createMocks({
      method: 'GET',
      url: 'http://localhost:3000/api/search?q=amazon'
    })

    const response = await GET(req)
    const data = await response.json()

    expect(data.success).toBe(true)
    expect(data.data.coupons).toHaveLength(1)
    expect(data.data.coupons[0].brand).toBe('Amazon')
    expect(data.data.query).toBe('amazon')
  })

  test('should search by description', async () => {
    const user = await createTestUser()
    await createTestCoupon({ 
      brand: 'Amazon', 
      code: 'SAVE20', 
      description: '20% off electronics' 
    }, user._id)
    await createTestCoupon({ 
      brand: 'Walmart', 
      code: 'SAVE10', 
      description: '10% off clothing' 
    }, user._id)

    const { req } = createMocks({
      method: 'GET',
      url: 'http://localhost:3000/api/search?q=electronics'
    })

    const response = await GET(req)
    const data = await response.json()

    expect(data.success).toBe(true)
    expect(data.data.coupons).toHaveLength(1)
    expect(data.data.coupons[0].brand).toBe('Amazon')
  })

  test('should search by tags', async () => {
    const user = await createTestUser()
    await createTestCoupon({ 
      brand: 'Amazon', 
      code: 'SAVE20', 
      tags: ['electronics', 'sale'] 
    }, user._id)
    await createTestCoupon({ 
      brand: 'Walmart', 
      code: 'SAVE10', 
      tags: ['clothing', 'fashion'] 
    }, user._id)

    const { req } = createMocks({
      method: 'GET',
      url: 'http://localhost:3000/api/search?q=electronics'
    })

    const response = await GET(req)
    const data = await response.json()

    expect(data.success).toBe(true)
    expect(data.data.coupons).toHaveLength(1)
    expect(data.data.coupons[0].brand).toBe('Amazon')
  })

  test('should return pagination info', async () => {
    const user = await createTestUser()
    await createTestCoupon({ brand: 'Amazon', code: 'SAVE20' }, user._id)
    await createTestCoupon({ brand: 'Amazon', code: 'SAVE10' }, user._id)

    const { req } = createMocks({
      method: 'GET',
      url: 'http://localhost:3000/api/search?q=amazon&page=1&limit=1'
    })

    const response = await GET(req)
    const data = await response.json()

    expect(data.success).toBe(true)
    expect(data.data.coupons).toHaveLength(1)
    expect(data.data.pagination.total).toBe(2)
    expect(data.data.pagination.pages).toBe(2)
  })

  test('should be case insensitive', async () => {
    const user = await createTestUser()
    await createTestCoupon({ brand: 'Amazon', code: 'SAVE20' }, user._id)

    const { req } = createMocks({
      method: 'GET',
      url: 'http://localhost:3000/api/search?q=AMAZON'
    })

    const response = await GET(req)
    const data = await response.json()

    expect(data.success).toBe(true)
    expect(data.data.coupons).toHaveLength(1)
    expect(data.data.coupons[0].brand).toBe('Amazon')
  })
}) 