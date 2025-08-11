import { createMocks } from 'node-mocks-http'
import { DELETE } from '@/app/api/coupons/[id]/route'
import { connectTestDB, disconnectTestDB, clearTestDB, createTestUser, createTestCoupon } from '@/lib/test-utils'
import { getServerSession } from 'next-auth'
import { Vote } from '@/lib/models/Vote'

// Mock NextAuth
jest.mock('next-auth')

describe('/api/coupons/[id] DELETE', () => {
  beforeAll(async () => {
    await connectTestDB()
  })

  afterAll(async () => {
    await disconnectTestDB()
  })

  beforeEach(async () => {
    await clearTestDB()
  })

  test('should delete coupon by owner', async () => {
    const user = await createTestUser()
    const coupon = await createTestCoupon(user, { upvotes: 5, downvotes: 2 })

    const { req } = createMocks({
      method: 'DELETE'
    })

    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'test@example.com' }
    })

    const response = await DELETE(req, { params: { id: coupon._id.toString() } })
    const data = await response.json()

    expect(data.success).toBe(true)

    // Verify coupon was deleted
    const deletedCoupon = await coupon.constructor.findById(coupon._id)
    expect(deletedCoupon).toBeNull()

    // Verify user stats were updated
    const updatedUser = await user.constructor.findById(user._id)
    expect(updatedUser.totalUpvotes).toBe(-5)
    expect(updatedUser.totalDownvotes).toBe(-2)
    expect(updatedUser.rankScore).toBe(-8) // (5*2 - 2) * -1
  })

  test('should reject unauthenticated requests', async () => {
    const user = await createTestUser()
    const coupon = await createTestCoupon(user)

    const { req } = createMocks({
      method: 'DELETE'
    })

    (getServerSession as jest.Mock).mockResolvedValue(null)

    const response = await DELETE(req, { params: { id: coupon._id.toString() } })
    const data = await response.json()

    expect(data.success).toBe(false)
    expect(data.error).toContain('Authentication required')
  })

  test('should reject deletion by non-owner', async () => {
    const owner = await createTestUser({ username: 'owner', email: 'owner@example.com' })
    const nonOwner = await createTestUser({ username: 'nonowner', email: 'nonowner@example.com' })
    const coupon = await createTestCoupon(owner)

    const { req } = createMocks({
      method: 'DELETE'
    })

    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'nonowner@example.com' }
    })

    const response = await DELETE(req, { params: { id: coupon._id.toString() } })
    const data = await response.json()

    expect(data.success).toBe(false)
    expect(data.error).toContain('Not authorized to delete this coupon')
  })

  test('should return 404 for non-existent coupon', async () => {
    const { req } = createMocks({
      method: 'DELETE'
    })

    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'test@example.com' }
    })

    const response = await DELETE(req, { params: { id: '507f1f77bcf86cd799439011' } })
    const data = await response.json()

    expect(data.success).toBe(false)
    expect(data.error).toContain('Coupon not found')
  })

  test('should delete associated votes', async () => {
    const user = await createTestUser()
    const coupon = await createTestCoupon(user)

    // Create some votes
    await Vote.create([
      { couponId: coupon._id, userId: user._id, worked: true },
      { couponId: coupon._id, deviceHash: 'test-device', worked: false }
    ])

    const { req } = createMocks({
      method: 'DELETE'
    })

    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'test@example.com' }
    })

    const response = await DELETE(req, { params: { id: coupon._id.toString() } })
    const data = await response.json()

    expect(data.success).toBe(true)

    // Verify votes were deleted
    const votes = await Vote.find({ couponId: coupon._id })
    expect(votes).toHaveLength(0)
  })
}) 