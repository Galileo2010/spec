import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { nanoid } from 'nanoid'
import { db } from '../db/init'
import { User, LoginRequest, RegisterRequest } from '@shared/types'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export class UserService {
  static async register(data: RegisterRequest): Promise<{ user: User; token: string }> {
    const { email, password, name } = data

    // Check if user already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
    if (existingUser) {
      throw new Error('User already exists')
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
    const user: User = {
      id: userId,
      email,
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    return { user, token }
  }

  static async login(data: LoginRequest): Promise<{ user: User; token: string }> {
    const { email, password } = data

    // Get user from database
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?')
    const dbUser = stmt.get(email) as any

    if (!dbUser) {
      throw new Error('Invalid credentials')
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, dbUser.password_hash)
    if (!isValidPassword) {
      throw new Error('Invalid credentials')
    }

    // Generate JWT token
    const token = jwt.sign({ userId: dbUser.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })

    // Return user and token (without password hash)
    const user: User = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      createdAt: new Date(dbUser.created_at),
      updatedAt: new Date(dbUser.updated_at),
    }

    return { user, token }
  }

  static async getUserById(userId: string): Promise<User | null> {
    const stmt = db.prepare('SELECT id, email, name, created_at, updated_at FROM users WHERE id = ?')
    const dbUser = stmt.get(userId) as any

    if (!dbUser) {
      return null
    }

    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      createdAt: new Date(dbUser.created_at),
      updatedAt: new Date(dbUser.updated_at),
    }
  }

  static verifyToken(token: string): { userId: string } {
    try {
      return jwt.verify(token, JWT_SECRET) as { userId: string }
    } catch (error) {
      throw new Error('Invalid token')
    }
  }
}