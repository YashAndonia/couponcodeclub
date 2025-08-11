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

// Mock the API utilities to see what's happening
jest.mock('@/lib/utils/appApi', () => ({
  sendSuccessResponse: jest.fn((data) => {
    console.log('sendSuccessResponse called with:', data)
    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }),
  sendErrorResponse: jest.fn((error, statusCode) => {
    console.log('sendErrorResponse called with:', error, statusCode)
    return new Response(JSON.stringify({ success: false, error }), {
      status: statusCode || 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }),
  handleApiError: jest.fn((error) => {
    console.log('handleApiError called with:', error)
    return { message: error.message || 'An unexpected error occurred', statusCode: 500 }
  }),
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
  }
}))

describe('Debug API - Detailed', () => {
  beforeAll(async () => {
    await connectTestDB()
  })

  afterAll(async () => {
    await disconnectTestDB()
  })

  beforeEach(async () => {
    await clearTestDB()
  })

  test('should debug API with detailed logging', async () => {
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