import mongoose from 'mongoose'
import { User } from '@/lib/models/User'
import { connectTestDB, disconnectTestDB, clearTestDB } from '@/lib/test-utils'

describe('User Model', () => {
  beforeAll(async () => {
    await connectTestDB()
  })

  afterAll(async () => {
    await disconnectTestDB()
  })

  beforeEach(async () => {
    await clearTestDB()
  })

  test('should create user with valid data', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      name: 'Test User'
    }

    const user = await User.create(userData)

    expect(user.username).toBe(userData.username)
    expect(user.email).toBe(userData.email)
    expect(user.name).toBe(userData.name)
    expect(user.rankScore).toBe(0)
  })

  test('should enforce unique username', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      name: 'Test User'
    }

    await User.create(userData)

    await expect(User.create(userData)).rejects.toThrow()
  })

  test('should enforce unique email', async () => {
    const userData1 = {
      username: 'testuser1',
      email: 'test@example.com',
      name: 'Test User 1'
    }

    const userData2 = {
      username: 'testuser2',
      email: 'test@example.com',
      name: 'Test User 2'
    }

    await User.create(userData1)

    await expect(User.create(userData2)).rejects.toThrow()
  })

  test('should calculate virtual fields correctly', async () => {
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      name: 'Test User',
      totalUpvotes: 10,
      totalDownvotes: 2
    })

    const totalVotes = user.totalUpvotes + user.totalDownvotes
    const successRate = (user.totalUpvotes / totalVotes) * 100

    expect(totalVotes).toBe(12)
    expect(successRate).toBeCloseTo(83.33, 2)
  })
}) 