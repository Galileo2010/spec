import { Database } from 'bun:sqlite'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

const dataDir = join(process.cwd(), 'data')
const dbPath = join(dataDir, 'database.sqlite')

// Ensure data directory exists
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true })
  console.log('📁 Created data directory')
}

let db: Database

export function getDatabase() {
  if (!db) {
    db = new Database(dbPath)
    console.log('📊 Database connection established')
  }
  return db
}

export async function initDatabase() {
  try {
    const database = getDatabase()
    
    // Enable foreign keys
    database.run('PRAGMA foreign_keys = ON')
    
    // Create users table
    database.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create projects table
    database.run(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        user_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)

    // Create indexes
    database.run('CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id)')
    database.run('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)')

    console.log('✅ Database initialized successfully')
    return database
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    throw error
  }
}

export { db }