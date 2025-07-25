import { initDatabase } from './init'

async function migrate() {
  console.log('🔄 Running database migrations...')
  
  try {
    await initDatabase()
    console.log('✅ Database migrations completed successfully')
  } catch (error) {
    console.error('❌ Database migration failed:', error)
    process.exit(1)
  }
}

// Run migrations if this file is executed directly
if (import.meta.main) {
  migrate()
}