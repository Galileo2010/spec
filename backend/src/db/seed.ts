import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'
import { db } from './init'

async function seed() {
  console.log('🌱 Seeding database...')
  
  try {
    // Create demo user
    const userId = nanoid()
    const passwordHash = await bcrypt.hash('demo123', 12)
    
    const userStmt = db.prepare(`
      INSERT OR IGNORE INTO users (id, email, name, password_hash)
      VALUES (?, ?, ?, ?)
    `)
    
    userStmt.run(userId, 'demo@example.com', 'Demo User', passwordHash)
    
    // Create demo project
    const projectId = nanoid()
    const projectStmt = db.prepare(`
      INSERT OR IGNORE INTO projects (id, name, description, user_id)
      VALUES (?, ?, ?, ?)
    `)
    
    projectStmt.run(
      projectId, 
      'Demo Project', 
      'A sample project to demonstrate the platform capabilities',
      userId
    )
    
    console.log('✅ Database seeded successfully')
    console.log('📧 Demo user: demo@example.com')
    console.log('🔑 Demo password: demo123')
  } catch (error) {
    console.error('❌ Database seeding failed:', error)
    process.exit(1)
  }
}

// Run seeding if this file is executed directly
if (import.meta.main) {
  seed()
}