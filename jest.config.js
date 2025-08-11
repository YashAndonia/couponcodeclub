const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/api/auth/**'
  ],
  testTimeout: 30000,
  maxWorkers: 1, // Run tests sequentially
  forceExit: true,
  detectOpenHandles: true,
  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true
}

module.exports = createJestConfig(customJestConfig) 