import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

const app = new Hono()

// Middleware
app.use('*', logger())
app.use('*', cors({
  origin: ['http://localhost:3000'],
  credentials: true,
}))

// Health check
app.get('/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Test server is running'
  })
})

// Mock API endpoints for testing
app.get('/api/test', (c) => {
  return c.json({
    message: 'API is working',
    features: [
      'Plate.js Editor',
      'Document Management',
      'Export Functions',
      'Share Features'
    ]
  })
})

// Mock project endpoint
app.get('/api/projects', (c) => {
  return c.json({
    projects: [
      {
        id: 'test-project-1',
        name: '测试项目',
        description: '用于验证功能的测试项目',
        createdAt: new Date().toISOString()
      }
    ]
  })
})

// Mock specs endpoint
app.get('/api/projects/:id/specs', (c) => {
  const projectId = c.req.param('id')
  return c.json({
    projectId,
    specs: {
      requirements: [
        {
          type: 'h1',
          children: [{ text: '需求文档测试' }]
        },
        {
          type: 'p',
          children: [{ text: '这是一个测试需求文档。' }]
        }
      ],
      design: [
        {
          type: 'h1',
          children: [{ text: '设计文档测试' }]
        },
        {
          type: 'p',
          children: [{ text: '这是一个测试设计文档。' }]
        }
      ],
      tasks: [
        {
          type: 'h1',
          children: [{ text: '任务文档测试' }]
        },
        {
          type: 'p',
          children: [{ text: '这是一个测试任务文档。' }]
        }
      ]
    }
  })
})

const port = process.env.PORT || 3001
console.log(`🚀 Test server running on http://localhost:${port}`)

export default {
  port,
  fetch: app.fetch,
}