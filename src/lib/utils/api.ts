import { NextApiResponse } from 'next';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export const sendSuccessResponse = <T>(
  res: NextApiResponse,
  data: T,
  statusCode: number = 200,
  message?: string
) => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message
  };
  
  return res.status(statusCode).json(response);
};

export const sendErrorResponse = (
  res: NextApiResponse,
  error: string | Error,
  statusCode: number = 500
) => {
  const message = error instanceof Error ? error.message : error;
  
  const response: ApiResponse = {
    success: false,
    error: message
  };
  
  return res.status(statusCode).json(response);
};

export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }
  
  if (error instanceof Error) {
    return new ApiError(error.message);
  }
  
  return new ApiError('An unexpected error occurred');
};

// Common HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const; 