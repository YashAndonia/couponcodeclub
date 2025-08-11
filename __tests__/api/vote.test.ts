import { POST } from '@/app/api/coupons/[id]/vote/route'
import { connectTestDB, disconnectTestDB, clearTestDB, createTestUser, createTestCoupon } from '@/lib/test-utils'
import { getServerSession } from 'next-auth'
import { Vote } from '@/lib/models/Vote'

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

describe('/api/coupons/[id]/vote', () => {
  beforeAll(async () => {
    await connectTestDB()
  })

  afterAll(async () => {
    await disconnectTestDB()
  })

  beforeEach(async () => {
    await clearTestDB()
  })

  test('should allow authenticated user to vote', async () => {
    const user = await createTestUser()
    const coupon = await createTestCoupon({}, user._id)

    const req = {
      method: 'POST',
      url: 'http://localhost:3000/api/coupons/123/vote',
      json: jest.fn().mockResolvedValue({ worked: true }),
      headers: {
        get: jest.fn().mockReturnValue('test-agent')
      }
    } as any

    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: user.email }
    })

    const response = await POST(req, { params: { id: coupon._id.toString() } })
    const data = await response.json()

    expect(data.success).toBe(true)

    // Verify vote was recorded
    const vote = await Vote.findOne({ couponId: coupon._id })
    expect(vote).toBeTruthy()
    expect(vote.worked).toBe(true)
    expect(vote.userId.toString()).toBe(user._id.toString())

    // Verify coupon stats updated
    const updatedCoupon = await coupon.constructor.findById(coupon._id)
    expect(updatedCoupon.upvotes).toBe(1)
    expect(updatedCoupon.downvotes).toBe(0)
  })

  test('should allow anonymous user to vote', async () => {
    const user = await createTestUser()
    const coupon = await createTestCoupon({}, user._id)

    const req = {
      method: 'POST',
      url: 'http://localhost:3000/api/coupons/123/vote',
      json: jest.fn().mockResolvedValue({ worked: false }),
      headers: {
        get: jest.fn().mockReturnValue('test-device-hash')
      }
    } as any

    (getServerSession as jest.Mock).mockResolvedValue(null)

    const response = await POST(req, { params: { id: coupon._id.toString() } })
    const data = await response.json()

    expect(data.success).toBe(true)

    // Verify vote was recorded
    const vote = await Vote.findOne({ couponId: coupon._id })
    expect(vote).toBeTruthy()
    expect(vote.worked).toBe(false)
    expect(vote.deviceHash).toBe('test-device-hash')
    expect(vote.userId).toBeNull()
  })

  test('should prevent duplicate votes from same user', async () => {
    const user = await createTestUser()
    const coupon = await createTestCoupon({}, user._id)

    // Create first vote
    await Vote.create({
      couponId: coupon._id,
      userId: user._id,
      worked: true
    })

    const req = {
      method: 'POST',
      url: 'http://localhost:3000/api/coupons/123/vote',
      json: jest.fn().mockResolvedValue({ worked: false }),
      headers: {
        get: jest.fn().mockReturnValue('test-agent')
      }
    } as any

    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: user.email }
    })

    const response = await POST(req, { params: { id: coupon._id.toString() } })
    const data = await response.json()

    expect(data.success).toBe(false)
    expect(data.error).toContain('Already voted')
  })

  test('should prevent duplicate votes from same device', async () => {
    const user = await createTestUser()
    const coupon = await createTestCoupon({}, user._id)

    // Create first vote
    await Vote.create({
      couponId: coupon._id,
      deviceHash: 'test-device-hash',
      worked: true
    })

    const req = {
      method: 'POST',
      url: 'http://localhost:3000/api/coupons/123/vote',
      json: jest.fn().mockResolvedValue({ worked: false }),
      headers: {
        get: jest.fn().mockReturnValue('test-device-hash')
      }
    } as any

    (getServerSession as jest.Mock).mockResolvedValue(null)

    const response = await POST(req, { params: { id: coupon._id.toString() } })
    const data = await response.json()

    expect(data.success).toBe(false)
    expect(data.error).toContain('Already voted')
  })

  test('should reject invalid vote value', async () => {
    const user = await createTestUser()
    const coupon = await createTestCoupon({}, user._id)

    const req = {
      method: 'POST',
      url: 'http://localhost:3000/api/coupons/123/vote',
      json: jest.fn().mockResolvedValue({ worked: 'invalid' }),
      headers: {
        get: jest.fn().mockReturnValue('test-agent')
      }
    } as any

    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: user.email }
    })

    const response = await POST(req, { params: { id: coupon._id.toString() } })
    const data = await response.json()

    expect(data.success).toBe(false)
    expect(data.error).toContain('Invalid vote value')
  })

  test('should reject non-existent coupon', async () => {
    const user = await createTestUser()
    
    const req = {
      method: 'POST',
      url: 'http://localhost:3000/api/coupons/123/vote',
      json: jest.fn().mockResolvedValue({ worked: true }),
      headers: {
        get: jest.fn().mockReturnValue('test-agent')
      }
    } as any

    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: user.email }
    })

    const response = await POST(req, { params: { id: '507f1f77bcf86cd799439011' } })
    const data = await response.json()

    expect(data.success).toBe(false)
    expect(data.error).toContain('Coupon not found')
  })
}) 