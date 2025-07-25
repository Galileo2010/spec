import { Hono } from 'hono'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { nanoid } from 'nanoid'
import { z } from 'zod'
import { db } from '../db/init'
import { LoginSchema, RegisterSchema } from '@shared/types'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export const authRoutes = new Hono()

// Register
authRoutes.post('/register', async (c) => {
  try {
    const body = await c.req.json()
    const { email, password, name } = RegisterSchema.parse(body)

    // Check if user already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
    if (existingUser) {
      return c.json({ error: 'User already exists' }, 400)
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user
    const userId = nanoid()
    const stmt = db.prepare(`
      INSERT INTO users (id, email, name, password_hash)
      VALUES (?, ?, ?, ?)
    `)
    
    stmt.run(userId, email, name, passwordHash)

    // Generate JWT token
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })

    // Return user and token
    const user = {
      id: userId,
      email,
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    return c.json({ user, token }, 201)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid input', details: error.errors }, 400)
    }
    throw error
  }
})

// Login
authRoutes.post('/login', async (c) => {
  try {
    const body = await c.req.json()
    const { email, password } = LoginSchema.parse(body)

    // Get user from database
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?')
    const user = stmt.get(email) as any

    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })

    // Return user and token (without password hash)
    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: new Date(user.created_at),
      updatedAt: new Date(user.updated_at),
    }

    return c.json({ user: userResponse, token })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid input', details: error.errors }, 400)
    }
    throw error
  }
})

// Get profile
authRoutes.get('/profile', async (c) => {
  const user = c.get('user')
  return c.json(user)
})