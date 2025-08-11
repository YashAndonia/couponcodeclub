require('@testing-library/jest-dom')

// Mock environment variables
process.env.MONGODB_URI = 'mongodb://localhost:27017/test'
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.GOOGLE_CLIENT_ID = 'test-client-id'
process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret'
process.env.UPSTASH_REDIS_URL = 'redis://localhost:6379'
process.env.UPSTASH_REDIS_TOKEN = 'test-token'

// Mock NextAuth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(() => Promise.resolve(null))
}))

// Mock Redis
jest.mock('@/lib/redis', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn()
  }
}))

// Global test timeout
jest.setTimeout(30000)

// Clean up after all tests
afterAll(async () => {
  // Force close any remaining connections
  if (global.mongoose && global.mongoose.connection) {
    await global.mongoose.connection.close()
  }
}) 