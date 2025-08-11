import { createMocks } from 'node-mocks-http'
import { GET } from '@/app/api/user/[username]/route'
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

describe('/api/user/[username]', () => {
  beforeAll(async () => {
    await connectTestDB()
  })

  afterAll(async () => {
    await disconnectTestDB()
  })

  beforeEach(async () => {
    await clearTestDB()
  })

  test('should return 404 for non-existent user', async () => {
    const { req } = createMocks({
      method: 'GET',
      url: 'http://localhost:3000/api/user/nonexistent'
    })

    const response = await GET(req, { params: { username: 'nonexistent' } })
    const data = await response.json()

    expect(data.success).toBe(false)
    expect(data.error).toContain('User not found')
  })

  test('should return user profile with stats', async () => {
    const user = await createTestUser({
      username: 'testuser',
      rankScore: 75,
      totalUpvotes: 40,
      totalDownvotes: 10
    })

    const { req } = createMocks({
      method: 'GET',
      url: 'http://localhost:3000/api/user/testuser'
    })

    const response = await GET(req, { params: { username: 'testuser' } })
    const data = await response.json()

    expect(data.success).toBe(true)
    expect(data.data.profile.username).toBe('testuser')
    expect(data.data.profile.rankScore).toBe(75)
    expect(data.data.profile.badge).toBe('Silver')
    expect(data.data.profile.successRate).toBe(80)
    expect(data.data.profile.totalVotes).toBe(50)
  })

  test('should return user coupons with pagination', async () => {
    const user = await createTestUser({ username: 'testuser' })
    await createTestCoupon({ brand: 'Amazon', code: 'SAVE20' }, user._id)
    await createTestCoupon({ brand: 'Walmart', code: 'SAVE10' }, user._id)

    const { req } = createMocks({
      method: 'GET',
      url: 'http://localhost:3000/api/user/testuser?page=1&limit=1'
    })

    const response = await GET(req, { params: { username: 'testuser' } })
    const data = await response.json()

    expect(data.success).toBe(true)
    expect(data.data.coupons).toHaveLength(1)
    expect(data.data.pagination.total).toBe(2)
    expect(data.data.pagination.pages).toBe(2)
  })

  test('should calculate user rank position', async () => {
    const user1 = await createTestUser({ 
      username: 'user1', 
      email: 'user1@example.com',
      rankScore: 50 
    })
    
    const user2 = await createTestUser({ 
      username: 'user2', 
      email: 'user2@example.com',
      rankScore: 100 
    })

    const { req } = createMocks({
      method: 'GET',
      url: 'http://localhost:3000/api/user/user1'
    })

    const response = await GET(req, { params: { username: 'user1' } })
    const data = await response.json()

    expect(data.success).toBe(true)
    expect(data.data.profile.rank).toBe(2) // user1 has lower rank score
  })

  test('should return user stats correctly', async () => {
    const user = await createTestUser({
      username: 'testuser',
      totalUpvotes: 30,
      totalDownvotes: 10
    })
    await createTestCoupon({ brand: 'Amazon' }, user._id)

    const { req } = createMocks({
      method: 'GET',
      url: 'http://localhost:3000/api/user/testuser'
    })

    const response = await GET(req, { params: { username: 'testuser' } })
    const data = await response.json()

    expect(data.success).toBe(true)
    expect(data.data.profile.successRate).toBe(75) // (30/40) * 100
    expect(data.data.profile.totalVotes).toBe(40)
    expect(data.data.profile.stats.totalCoupons).toBe(1)
  })

  test('should handle users with no coupons', async () => {
    const user = await createTestUser({ username: 'testuser' })

    const { req } = createMocks({
      method: 'GET',
      url: 'http://localhost:3000/api/user/testuser'
    })

    const response = await GET(req, { params: { username: 'testuser' } })
    const data = await response.json()

    expect(data.success).toBe(true)
    expect(data.data.coupons).toHaveLength(0)
    expect(data.data.pagination.total).toBe(0)
  })
})
