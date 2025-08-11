import { 
  validateCouponInput, 
  validateUsername, 
  validateEmail,
  sanitizeString,
  validateBrand,
  validateCouponCode,
  validateDescription
} from '@/lib/utils/validation'

describe('Validation Utils', () => {
  describe('validateCouponInput', () => {
    test('should validate required fields', () => {
      const validData = {
        brand: 'Amazon',
        code: 'SAVE20',
        description: '20% off electronics'
      }

      const result = validateCouponInput(validData)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should catch missing brand', () => {
      const invalidData = {
        code: 'SAVE20',
        description: '20% off electronics'
      }

      const result = validateCouponInput(invalidData)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Brand is required')
    })

    test('should catch missing code', () => {
      const invalidData = {
        brand: 'Amazon',
        description: '20% off electronics'
      }

      const result = validateCouponInput(invalidData)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Coupon code is required')
    })

    test('should catch missing description', () => {
      const invalidData = {
        brand: 'Amazon',
        code: 'SAVE20'
      }

      const result = validateCouponInput(invalidData)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Description is required')
    })

    test('should validate optional fields', () => {
      const validData = {
        brand: 'Amazon',
        code: 'SAVE20',
        description: '20% off electronics',
        link: 'https://amazon.com',
        expiresAt: '2024-12-31',
        tags: ['electronics', 'sale']
      }

      const result = validateCouponInput(validData)
      expect(result.isValid).toBe(true)
    })
  })

  describe('validateUsername', () => {
    test('should validate valid usernames', () => {
      expect(validateUsername('valid_user')).toBe('valid_user')
      expect(validateUsername('user123')).toBe('user123')
      expect(validateUsername('user-name')).toBe('user-name')
    })

    test('should reject short usernames', () => {
      expect(() => validateUsername('ab')).toThrow('Username must be at least 3 characters long')
    })

    test('should reject long usernames', () => {
      expect(() => validateUsername('a'.repeat(31))).toThrow('Username must be less than 30 characters')
    })

    test('should reject invalid characters', () => {
      expect(() => validateUsername('user@name')).toThrow('Username can only contain letters, numbers, underscores, and hyphens')
    })
  })

  describe('validateEmail', () => {
    test('should validate valid emails', () => {
      expect(validateEmail('test@example.com')).toBe('test@example.com')
      expect(validateEmail('TEST@EXAMPLE.COM')).toBe('test@example.com')
    })

    test('should reject invalid emails', () => {
      expect(() => validateEmail('invalid-email')).toThrow('Invalid email format')
      expect(() => validateEmail('test@')).toThrow('Invalid email format')
      expect(() => validateEmail('@example.com')).toThrow('Invalid email format')
    })
  })

  describe('sanitizeString', () => {
    test('should remove HTML tags', () => {
      expect(sanitizeString('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script')
    })

    test('should trim whitespace', () => {
      expect(sanitizeString('  test  ')).toBe('test')
    })
  })
}) 