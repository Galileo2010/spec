import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { authRoutes } from './routes/auth'
import { projectRoutes } from './routes/projects'
import { specRoutes } from './routes/specs'
import { aiRoutes } from './routes/ai'
import { errorHandler } from './middleware/errorHandler'
import { authMiddleware } from './middleware/auth'
import { initDatabase } from './db/init'

const app = new Hono()

// Initialize database
await initDatabase()

// Middleware
app.use('*', logger())
app.use('*', prettyJSON())
app.use('*', cors({
  origin: ['http://localhost:3000'],
  credentials: true,
}))

// Error handling
app.onError(errorHandler)

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Public routes
app.route('/api/auth', authRoutes)

// Protected routes
app.use('/api/*', authMiddleware)
app.route('/api/projects', projectRoutes)
app.route('/api', specRoutes)
app.route('/api/ai', aiRoutes)

const port = process.env.PORT || 3001
console.log(`🚀 Server running on http://localhost:${port}`)

export default {
  port,
  fetch: app.fetch,
}