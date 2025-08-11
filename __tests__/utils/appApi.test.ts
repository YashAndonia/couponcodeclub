import { sendSuccessResponse, sendErrorResponse, handleApiError, ApiError } from '@/lib/utils/appApi'

describe('API Utilities', () => {
  test('sendSuccessResponse should return correct format', async () => {
    const data = { test: 'data' }
    const response = sendSuccessResponse(data, 201, 'Created')
    
    expect(response.status).toBe(201)
    const responseData = await response.json()
    expect(responseData).toEqual({
      success: true,
      data: { test: 'data' },
      message: 'Created'
    })
  })

  test('sendSuccessResponse should use default status code', async () => {
    const data = { test: 'data' }
    const response = sendSuccessResponse(data)
    
    expect(response.status).toBe(200)
    const responseData = await response.json()
    expect(responseData.success).toBe(true)
  })

  test('sendErrorResponse should return correct format', async () => {
    const error = 'Something went wrong'
    const response = sendErrorResponse(error, 400)
    
    expect(response.status).toBe(400)
    const responseData = await response.json()
    expect(responseData).toEqual({
      success: false,
      error: 'Something went wrong'
    })
  })

  test('sendErrorResponse should handle Error objects', async () => {
    const error = new Error('Test error')
    const response = sendErrorResponse(error, 500)
    
    expect(response.status).toBe(500)
    const responseData = await response.json()
    expect(responseData.error).toBe('Test error')
  })

  test('handleApiError should return ApiError for ApiError input', () => {
    const apiError = new ApiError('Test error', 400)
    const result = handleApiError(apiError)
    
    expect(result).toBeInstanceOf(ApiError)
    expect(result.statusCode).toBe(400)
    expect(result.message).toBe('Test error')
  })

  test('handleApiError should wrap regular Error', () => {
    const error = new Error('Regular error')
    const result = handleApiError(error)
    
    expect(result).toBeInstanceOf(ApiError)
    expect(result.message).toBe('Regular error')
    expect(result.statusCode).toBe(500)
  })

  test('handleApiError should handle unknown errors', () => {
    const result = handleApiError('string error')
    
    expect(result).toBeInstanceOf(ApiError)
    expect(result.message).toBe('An unexpected error occurred')
    expect(result.statusCode).toBe(500)
  })
}) 