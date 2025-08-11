import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { User } from './models/User'
import { Coupon } from './models/Coupon'
import { Vote } from './models/Vote'

let mongod: MongoMemoryServer

export const connectTestDB = async () => {
  if (mongoose.connection.readyState === 0) {
    mongod = await MongoMemoryServer.create()
    const uri = mongod.getUri()
    await mongoose.connect(uri)
  }
}

export const disconnectTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close()
  }
  if (mongod) {
    await mongod.stop()
  }
}

export const clearTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await User.deleteMany({})
    await Coupon.deleteMany({})
    await Vote.deleteMany({})
  }
}

export const createTestUser = async (userData = {}) => {
  return await User.create({
    username: `testuser_${Date.now()}`, // Make unique
    email: `test_${Date.now()}@example.com`, // Make unique
    name: 'Test User',
    image: 'https://example.com/avatar.jpg',
    rankScore: 0,
    totalUpvotes: 0,
    totalDownvotes: 0,
    ...userData
  })
}

export const createTestCoupon = async (couponData: any = {}, userId?: string) => {
  const user = userId || (await createTestUser())._id
  return await Coupon.create({
    ...couponData,
    brand: couponData.brand || 'Test Brand',
    code: couponData.code || `TEST_${Date.now()}`, // Make unique
    description: couponData.description || 'Test coupon',
    submitterId: user,  // Fixed: use submitterId instead of submitter
    upvotes: couponData.upvotes || 0,
    downvotes: couponData.downvotes || 0
  })
}

export const createTestVote = async (voteData = {}) => {
  return await Vote.create({
    couponId: new mongoose.Types.ObjectId(),
    userId: new mongoose.Types.ObjectId(),
    worked: true,  // Fixed: use worked instead of value
    userAgent: 'test-agent',
    ipAddress: '127.0.0.1',
    ...voteData
  })
} 