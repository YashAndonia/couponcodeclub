import { createMocks } from 'node-mocks-http'
import { GET } from '@/app/api/leaderboard/route'
import { connectTestDB, disconnectTestDB, clearTestDB, createTestUser } from '@/lib/test-utils'

describe('/api/leaderboard', () => {
  beforeAll(async () => {
    await connectTestDB()
  })

  afterAll(async () => {
    await disconnectTestDB()
  })

  beforeEach(async () => {
    await clearTestDB()
  })

  test('should return empty leaderboard when no users exist', async () => {
    const { req } = createMocks({
      method: 'GET',
      url: '/api/leaderboard'
    })

    const response = await GET(req)
    const data = await response.json()

    expect(data.success).toBe(true)
    expect(data.data.leaderboard).toHaveLength(0)
    expect(data.data.totalUsers).toBe(0)
  })

  test('should return users sorted by rank score', async () => {
    const user1 = await createTestUser({ 
      username: 'user1', 
      email: 'user1@example.com',
      rankScore: 50,
      totalUpvotes: 25,
      totalDownvotes: 5
    })
    
    const user2 = await createTestUser({ 
      username: 'user2', 
      email: 'user2@example.com',
      rankScore: 100,
      totalUpvotes: 50,
      totalDownvotes: 10
    })

    const { req } = createMocks({
      method: 'GET',
      url: '/api/leaderboard'
    })

    const response = await GET(req)
    const data = await response.json()

    expect(data.success).toBe(true)
    expect(data.data.leaderboard).toHaveLength(2)
    expect(data.data.leade 