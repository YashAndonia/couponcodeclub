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

// Mock the dbConnect function to prevent connection conflicts
jest.mock('@/lib/mongodb', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(undefined)
}))

describe('Debug Coupons API - Fixed', () => {
  beforeAll(async () => {
    await connectTestDB()
  })

  afterAll(async () => {
    await disconnectTestDB()
  })

  beforeEach(async () => {
    await clearTestDB()
  })

  test('should return success response', async () => {
    const req = {
      method: 'GET',
      url: '/api/coupons',
      nextUrl: {
        searchParams: new URLSearchParams()
      }
    } as any

    const response = await GET(req)
    const data = await response.json()

    console.log('Response data:', JSON.stringify(data, null, 2))
    
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.coupons).toHaveLength(0)
  })
}) 