import { describe, it, expect, beforeAll, afterAll } from 'bun:test'
import { UserService } from '../src/services/userService'
import { initDatabase } from '../src/db/init'

describe('User Authentication', () => {
  beforeAll(async () => {
    await initDatabase()
  })

  it('should register a new user', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User'
    }

    const result = await UserService.register(userData)

    expect(result.user.email).toBe(userData.email)
    expect(result.user.name).toBe(userData.name)
    expect(result.token).toBeDefined()
    expect(typeof result.token).toBe('string')
  })

  it('should not register user with existing email', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User 2'
    }

    expect(async () => {
      await UserService.register(userData)
    }).toThrow('User already exists')
  })

  it('should login with valid credentials', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    }

    const result = await UserService.login(loginData)

    expect(result.user.email).toBe(loginData.email)
    expect(result.token).toBeDefined()
  })

  it('should not login with invalid credentials', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'wrongpassword'
    }

    expect(async () => {
      await UserService.login(loginData)
    }).toThrow('Invalid credentials')
  })

  it('should verify valid JWT token', () => {
    const userId = 'test-user-id'
    const token = require('jsonwebtoken').sign({ userId }, 'your-secret-key')

    const result = UserService.verifyToken(token)
    expect(result.userId).toBe(userId)
  })

  it('should reject invalid JWT token', () => {
    const invalidToken = 'invalid.token.here'

    expect(() => {
      UserService.verifyToken(invalidToken)
    }).toThrow('Invalid token')
  })
})