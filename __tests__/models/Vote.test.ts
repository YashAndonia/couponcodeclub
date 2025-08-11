import mongoose from 'mongoose'
import { Vote } from '@/lib/models/Vote'
import { User } from '@/lib/models/User'
import { Coupon } from '@/lib/models/Coupon'
import { connectTestDB, disconnectTestDB, clearTestDB } from '@/lib/test-utils'

describe('Vote Model', () => {
  beforeAll(async () => {
    await connectTestDB()
  })

  afterAll(async () => {
    await disconnectTestDB()
  })

  beforeEach(async () => {
    await clearTestDB()
  })

  test('should create vote with userId', async () => {
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      name: 'Test User'
    })

    const coupon = await Coupon.create({
      brand: 'Test Brand',
      code: 'TEST123',
      description: 'Test coupon',
      submitterId: user._id
    })

    const vote = await Vote.create({
      couponId: coupon._id,
      userId: user._id,
      worked: true  // Fixed: use worked instead of value
    })

    expect(vote.couponId.toString()).toBe(coupon._id.toString())
    expect(vote.userId.toString()).toBe(user._id.toString())
    expect(vote.worked).toBe(true)
  })

  test('should create vote with deviceHash', async () => {
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      name: 'Test User'
    })

    const coupon = await Coupon.create({
      brand: 'Test Brand',
      code: 'TEST123',
      description: 'Test coupon',
      submitterId: user._id
    })

    const vote = await Vote.create({
      couponId: coupon._id,
      deviceHash: 'test-device-hash',
      worked: false  // Fixed: use worked instead of value
    })

    expect(vote.deviceHash).toBe('test-device-hash')
    expect(vote.worked).toBe(false)
  })

  test('should enforce unique constraint for userId', async () => {
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      name: 'Test User'
    })

    const coupon = await Coupon.create({
      brand: 'Test Brand',
      code: 'TEST123',
      description: 'Test coupon',
      submitterId: user._id
    })

    const voteData = {
      couponId: coupon._id,
      userId: user._id,
      worked: true  // Fixed: use worked instead of value
    }

    await Vote.create(voteData)

    await expect(Vote.create(voteData)).rejects.toThrow()
  })

  test('should enforce unique constraint for deviceHash', async () => {
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      name: 'Test User'
    })

    const coupon = await Coupon.create({
      brand: 'Test Brand',
      code: 'TEST123',
      description: 'Test coupon',
      submitterId: user._id
    })

    const voteData = {
      couponId: coupon._id,
      deviceHash: 'test-device-hash',
      worked: true  // Fixed: use worked instead of value
    }

    await Vote.create(voteData)

    await expect(Vote.create(voteData)).rejects.toThrow()
  })

  test('should require either userId or deviceHash', async () => {
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      name: 'Test User'
    })

    const coupon = await Coupon.create({
      brand: 'Test Brand',
      code: 'TEST123',
      description: 'Test coupon',
      submitterId: user._id
    })

    await expect(Vote.create({
      couponId: coupon._id,
      worked: true  // Fixed: use worked instead of value
    })).rejects.toThrow()
  })
}) 