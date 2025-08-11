import { createTestUser, connectTestDB, disconnectTestDB, clearTestDB } from '@/lib/test-utils'

describe('Debug Test', () => {
  beforeAll(async () => {
    await connectTestDB()
  })

  afterAll(async () => {
    await disconnectTestDB()
  })

  beforeEach(async () => {
    await clearTestDB()
  })

  test('should create test user', async () => {
    console.log('About to create test user...')
    const user = await createTestUser()
    console.log('User created:', user)
    
    expect(user).toBeDefined()
    expect(user.username).toContain('testuser_')
    expect(user.email).toContain('test_')
    expect(user.name).toBe('Test User')
  })
}) 