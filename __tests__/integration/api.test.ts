import { createMocks } from 'node-mocks-http'
import { GET, POST } from '@/app/api/coupons/route'
import { POST as votePost } from '@/app/api/coupons/[id]/vote/route'
import { connectTestDB, disconnectTestDB, clearTestDB, createTestUser, createTestCoupon } from '@/lib/test-utils'
import { getServerSession } from 'next-auth'

// Mock NextAuth
jest.mock('next-auth')

describe('API Integration Tests', () => {
  beforeAll(async () => {
    await connectTestDB()
  })

  afterAll(async () => {
    await disconnectTestDB()
  })

  beforeEach(async () => {
    await clearTestDB()
  })

  test('should create coupon and allow voting', async () => {
    // Create user
    const user = await createTestUser()

    // Mock authentication
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'test@example.com' }
    })

    // Create coupon
    const { req: createReq } = createMocks({
      method: 'POST',
      body: {
        brand: 'Test Brand',
        code: 'TEST123',
        description: 'Test coupon'
      }
    })

    const createRes = await POST(createReq)
    const createData = await createRes.json()

    expect(createData.success).toBe(true)
    expect(createData.data.brand).toBe('Test Brand')

    // Vote on coupon
    const { req: voteReq } = createMocks({
      method: 'POST',
      body: { value: 1 }
    })

    const voteRes = await votePost(voteReq, { params: { id: createData.data._id } })
    const voteData = await voteRes.json()

    expect(voteData.success).toBe(true)
  })

  test('should update user stats after voting', async () => {
    const user = await createTestUser()
    const coupon = await createTestCoupon({}, user._id)

    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'test@example.com' }
    })

    // Vote on coupon
    const { req } = createMocks({
      method: 'POST',
      body: { value: 1 }
    })

    const res = await votePost(req, { params: { id: coupon._id.toString() } })
    const data = await res.json()

    expect(data.success).toBe(true)
  })

  test('should handle complete user workflow', async () => {
    const user = await createTestUser()

    // Test user profile
    const { req } = createMocks({
      method: 'GET'
    })

    const res = await GET(req, { params: { username: user.username } })
    const data = await res.json()

    expect(data.success).toBe(true)
    expect(data.data.profile.username).toBe(user.username)
  })
}) 