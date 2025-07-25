import { Context, Next } from 'hono'
import jwt from 'jsonwebtoken'
import { db } from '../db/init'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface AuthContext extends Context {
  user: {
    id: string
    email: string
    name: string
  }
}

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const token = authHeader.substring(7)

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    
    // Get user from database
    const stmt = db.prepare('SELECT id, email, name FROM users WHERE id = ?')
    const user = stmt.get(decoded.userId) as any
    
    if (!user) {
      return c.json({ error: 'User not found' }, 401)
    }

    // Add user to context
    c.set('user', user)
    
    await next()
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401)
  }
}