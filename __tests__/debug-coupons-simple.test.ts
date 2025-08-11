import { GET } from '@/app/api/coupons/route'
import { connectTestDB, disconnectTestDB, clearTestDB } from '@/lib/test-utils'

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

describe('Debug Coupons API - Simple', () => {
  beforeAll(async () => {
    await connectTestDB()
  })

  afterAll(async () => {
    await disconnectTestDB()
  })

  beforeEach(async () => {
    await clearTestDB()
  })

  test('should debug API response', async () => {
    // Create a simple mock request
    const req = {
      method: 'GET',
      url: '/api/coupons',
      nextUrl: {
        searchParams: new URLSearchParams()
      }
    } as any

    console.log('Calling GET endpoint...')
    try {
      const response = await GET(req)
      console.log('Response status:', response.status)
      
      const data = await response.json()
      console.log('Response data:', JSON.stringify(data, null, 2))
      
      expect(response).toBeDefined()
      expect(data).toBeDefined()
    } catch (error) {
      console.error('Error calling API:', error)
      throw error
    }
  })
}) 