import { ApiError, HTTP_STATUS } from './appApi';

export const sanitizeString = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const validateUsername = (username: string): string => {
  const sanitized = sanitizeString(username);
  
  if (sanitized.length < 3) {
    throw new ApiError('Username must be at least 3 characters long', HTTP_STATUS.BAD_REQUEST);
  }
  
  if (sanitized.length > 30) {
    throw new ApiError('Username must be less than 30 characters', HTTP_STATUS.BAD_REQUEST);
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(sanitized)) {
    throw new ApiError('Username can only contain letters, numbers, underscores, and hyphens', HTTP_STATUS.BAD_REQUEST);
  }
  
  return sanitized;
};

export const validateEmail = (email: string): string => {
  const sanitized = sanitizeString(email).toLowerCase();
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    throw new ApiError('Invalid email format', HTTP_STATUS.BAD_REQUEST);
  }
  
  return sanitized;
};

export const validateCouponCode = (code: string): string => {
  const sanitized = sanitizeString(code);
  
  if (sanitized.length < 1) {
    throw new ApiError('Coupon code cannot be empty', HTTP_STATUS.BAD_REQUEST);
  }
  
  if (sanitized.length > 50) {
    throw new ApiError('Coupon code must be less than 50 characters', HTTP_STATUS.BAD_REQUEST);
  }
  
  return sanitized;
};

export const validateBrand = (brand: string): string => {
  const sanitized = sanitizeString(brand);
  
  if (sanitized.length < 1) {
    throw new ApiError('Brand name cannot be empty', HTTP_STATUS.BAD_REQUEST);
  }
  
  if (sanitized.length > 100) {
    throw new ApiError('Brand name must be less than 100 characters', HTTP_STATUS.BAD_REQUEST);
  }
  
  return sanitized;
};

export const validateDescription = (description: string): string => {
  const sanitized = sanitizeString(description);
  
  if (sanitized.length < 1) {
    throw new ApiError('Description cannot be empty', HTTP_STATUS.BAD_REQUEST);
  }
  
  if (sanitized.length > 500) {
    throw new ApiError('Description must be less than 500 characters', HTTP_STATUS.BAD_REQUEST);
  }
  
  return sanitized;
};

export const validateTags = (tags: string[]): string[] => {
  if (!Array.isArray(tags)) {
    return [];
  }
  
  return tags
    .map(tag => sanitizeString(tag).toLowerCase())
    .filter(tag => tag.length > 0 && tag.length <= 20)
    .slice(0, 10); // Limit to 10 tags
};

export const validateUrl = (url: string): string | null => {
  if (!url) return null;
  
  const sanitized = sanitizeString(url);
  
  try {
    new URL(sanitized);
    return sanitized;
  } catch {
    throw new ApiError('Invalid URL format', HTTP_STATUS.BAD_REQUEST);
  }
};

export const validateDate = (date: string | Date): Date | null => {
  if (!date) return null;
  
  const parsedDate = new Date(date);
  
  if (isNaN(parsedDate.getTime())) {
    throw new ApiError('Invalid date format', HTTP_STATUS.BAD_REQUEST);
  }
  
  return parsedDate;
};

export const generateDeviceHash = (userAgent: string, ip: string): string => {
  // Simple hash for anonymous voting - in production, use a more robust method
  const combined = `${userAgent}-${ip}`;
  let hash = 0;
  
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36);
}; 

export const validateCouponInput = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  try {
    // Validate brand
    if (!data.brand || typeof data.brand !== 'string') {
      errors.push('Brand is required');
    } else {
      validateBrand(data.brand);
    }

    // Validate code
    if (!data.code || typeof data.code !== 'string') {
      errors.push('Coupon code is required');
    } else {
      validateCouponCode(data.code);
    }

    // Validate description
    if (!data.description || typeof data.description !== 'string') {
      errors.push('Description is required');
    } else {
      validateDescription(data.description);
    }

    // Validate optional fields
    if (data.link) {
      validateUrl(data.link);
    }

    if (data.expiresAt) {
      validateDate(data.expiresAt);
    }

    if (data.tags) {
      validateTags(data.tags);
    }

  } catch (error) {
    if (error instanceof ApiError) {
      errors.push(error.message);
    } else {
      errors.push('Validation error occurred');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}; 