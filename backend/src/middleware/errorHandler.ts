import { Context } from 'hono'
import { nanoid } from 'nanoid'

export function errorHandler(err: Error, c: Context) {
  const requestId = nanoid()
  
  console.error(`[${requestId}] Error:`, err)

  // Handle different types of errors
  if (err.name === 'ValidationError') {
    return c.json({
      error: {
        code: 'VALIDATION_ERROR',
        message: err.message,
        requestId,
        timestamp: new Date().toISOString(),
      }
    }, 400)
  }

  if (err.name === 'UnauthorizedError') {
    return c.json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
        requestId,
        timestamp: new Date().toISOString(),
      }
    }, 401)
  }

  // Default server error
  return c.json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      requestId,
      timestamp: new Date().toISOString(),
    }
  }, 500)
}