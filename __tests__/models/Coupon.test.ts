import mongoose from 'mongoose'
import { Coupon } from '@/lib/models/Coupon'
import { User } from '@/lib/models/User'
import { connectTestDB, disconnectTestDB, clearTestDB } from '@/lib/test-utils'

describe('Coupon Model', () => {
  beforeAll(async () => {
    await connectTestDB()
  })

  afterAll(async () => {
    await disconnectTestDB()
  })

  beforeEach(async () => {
    await clearTestDB()
  })

  test('should create coupon with valid data', async () => {
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      name: 'Test User'
    })

    const couponData = {
      brand: 'Test Brand',
      code: 'TEST123',
      description: 'Test coupon',
      submitterId: user._id  // Fixed: use submitterId instead of submitter
    }

    const coupon = await Coupon.create(couponData)

    expect(coupon.brand).toBe(couponData.brand)
    expect(coupon.code).toBe(couponData.code)
    expect(coupon.submitterId.toString()).toBe(user._id.toString())  // Fixed: use submitterId
    expect(coupon.upvotes).toBe(0)
    expect(coupon.downvotes).toBe(0)
  })

  test('should calculate success rate correctly', async () => {
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      name: 'Test User'
    })

    const coupon = await Coupon.create({
      brand: 'Test Brand',
      code: 'TEST123',
      description: 'Test coupon',
      submitterId: user._id,  // Fixed: use submitterId
      upvotes: 10,
      downvotes: 2
    })

    const totalVotes = coupon.upvotes + coupon.downvotes
    const successRate = (coupon.upvotes / totalVotes) * 100

    expect(totalVotes).toBe(12)
    expect(successRate).toBeCloseTo(83.33, 2)
  })

  test('should handle expiration dates', async () => {
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      name: 'Test User'
    })

    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 30)

    const coupon = await Coupon.create({
      brand: 'Test Brand',
      code: 'TEST123',
      description: 'Test coupon',
      submitterId: user._id,  // Fixed: use submitterId
      expiresAt: futureDate  // Fixed: use expiresAt instead of expirationDate
    })

    expect(coupon.expiresAt).toEqual(futureDate)
  })
}) 