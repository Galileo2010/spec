import bcrypt from 'bcryptjs'
import { db } from './src/db/init.js'

const email = 'demo@example.com'
const password = 'demo123'

console.log('Testing login for:', email)

// Get user from database
const stmt = db.prepare('SELECT * FROM users WHERE email = ?')
const user = stmt.get(email)

console.log('User found:', user ? 'Yes' : 'No')
if (user) {
  console.log('User data:', {
    id: user.id,
    email: user.email,
    name: user.name,
    created_at: user.created_at
  })
  
  // Test password
  const isValidPassword = await bcrypt.compare(password, user.password_hash)
  console.log('Password valid:', isValidPassword)
} else {
  console.log('No user found with email:', email)
}