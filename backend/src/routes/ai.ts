import { Hono } from 'hono'
import { z } from 'zod'
import { GenerateSpecSchema } from '@shared/types'
import { AIService } from '../services/aiService'

export const aiRoutes = new Hono()

// Generate spec content using AI
aiRoutes.post('/generate', async (c) => {
  try {
    const body = await c.req.json()
    const request = GenerateSpecSchema.parse(body)
    
    const aiService = AIService.getInstance()
    const content = await aiService.generateSpec(request)
    
    return c.json({ content })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid input', details: error.errors }, 400)
    }
    console.error('AI generation error:', error)
    return c.json({ error: 'Failed to generate content' }, 500)
  }
})

// Analyze spec content
aiRoutes.post('/analyze', async (c) => {
  try {
    const body = await c.req.json()
    const { content, specType } = body
    
    if (!Array.isArray(content)) {
      return c.json({ error: 'Content must be an array' }, 400)
    }
    
    const aiService = AIService.getInstance()
    const analysis = await aiService.analyzeContent(content, specType)
    
    return c.json(analysis)
  } catch (error) {
    console.error('AI analysis error:', error)
    return c.json({ error: 'Failed to analyze content' }, 500)
  }
})

// Validate spec consistency
aiRoutes.post('/validate', async (c) => {
  try {
    const body = await c.req.json()
    const specs = body
    
    const aiService = AIService.getInstance()
    const validation = await aiService.validateConsistency(specs)
    
    return c.json(validation)
  } catch (error) {
    console.error('AI validation error:', error)
    return c.json({ error: 'Failed to validate consistency' }, 500)
  }
})

