import { describe, it, expect, beforeAll } from 'bun:test'
import { AIService } from '../src/services/aiService'

describe('AI Service', () => {
  let aiService: AIService

  beforeAll(async () => {
    aiService = AIService.getInstance()
    await aiService.initialize()
  })

  it('should initialize AI service', async () => {
    expect(aiService).toBeDefined()
  })

  it('should generate requirements content', async () => {
    const request = {
      input: 'Build a todo application',
      specType: 'requirements' as const,
    }

    const content = await aiService.generateSpec(request)

    expect(Array.isArray(content)).toBe(true)
    expect(content.length).toBeGreaterThan(0)
    
    // Check if it contains heading elements
    const hasHeading = content.some(item => item.type === 'heading')
    expect(hasHeading).toBe(true)
  })

  it('should generate design content', async () => {
    const request = {
      input: 'Build a todo application',
      specType: 'design' as const,
    }

    const content = await aiService.generateSpec(request)

    expect(Array.isArray(content)).toBe(true)
    expect(content.length).toBeGreaterThan(0)
    
    // Check if it contains technical content
    const hasCodeBlock = content.some(item => item.type === 'code-block')
    expect(hasCodeBlock).toBe(true)
  })

  it('should generate tasks content', async () => {
    const request = {
      input: 'Build a todo application',
      specType: 'tasks' as const,
    }

    const content = await aiService.generateSpec(request)

    expect(Array.isArray(content)).toBe(true)
    expect(content.length).toBeGreaterThan(0)
    
    // Check if it contains task lists
    const hasList = content.some(item => item.type === 'list')
    expect(hasList).toBe(true)
  })

  it('should analyze requirements content', async () => {
    const content = [
      {
        type: 'heading',
        level: 1,
        children: [{ text: '需求文档' }]
      },
      {
        type: 'paragraph',
        children: [{ text: '这是一个测试需求文档' }]
      }
    ]

    const analysis = await aiService.analyzeContent(content, 'requirements')

    expect(analysis).toBeDefined()
    expect(typeof analysis.completeness).toBe('number')
    expect(typeof analysis.clarity).toBe('number')
    expect(Array.isArray(analysis.suggestions)).toBe(true)
  })

  it('should analyze design content', async () => {
    const content = [
      {
        type: 'heading',
        level: 1,
        children: [{ text: '设计文档' }]
      },
      {
        type: 'code-block',
        language: 'typescript',
        children: [{ text: 'interface User { id: string; name: string; }' }]
      }
    ]

    const analysis = await aiService.analyzeContent(content, 'design')

    expect(analysis).toBeDefined()
    expect(typeof analysis.completeness).toBe('number')
    expect(typeof analysis.consistency).toBe('number')
    expect(Array.isArray(analysis.suggestions)).toBe(true)
  })

  it('should validate spec consistency', async () => {
    const specs = {
      requirements: [
        {
          type: 'heading',
          level: 1,
          children: [{ text: '需求文档' }]
        }
      ],
      design: [
        {
          type: 'heading',
          level: 1,
          children: [{ text: '设计文档' }]
        }
      ],
      tasks: [
        {
          type: 'heading',
          level: 1,
          children: [{ text: '任务文档' }]
        }
      ]
    }

    const validation = await aiService.validateConsistency(specs)

    expect(validation).toBeDefined()
    expect(typeof validation.isConsistent).toBe('boolean')
    expect(typeof validation.completeness).toBe('number')
    expect(Array.isArray(validation.suggestions)).toBe(true)
  })

  it('should handle empty content gracefully', async () => {
    const analysis = await aiService.analyzeContent([], 'requirements')

    expect(analysis).toBeDefined()
    expect(analysis.completeness).toBeLessThan(1)
  })

  it('should handle invalid spec type', async () => {
    const request = {
      input: 'Test input',
      specType: 'invalid' as any,
    }

    const content = await aiService.generateSpec(request)

    expect(Array.isArray(content)).toBe(true)
    // Should return default content for invalid types
  })

  it('should provide different analysis for different content lengths', async () => {
    const shortContent = [
      {
        type: 'paragraph',
        children: [{ text: 'Short content' }]
      }
    ]

    const longContent = [
      {
        type: 'heading',
        level: 1,
        children: [{ text: '详细文档' }]
      },
      {
        type: 'paragraph',
        children: [{ text: '这是一个详细的文档内容' }]
      },
      {
        type: 'list',
        listType: 'unordered',
        children: [
          {
            type: 'list-item',
            children: [{ text: '项目1' }]
          }
        ]
      },
      {
        type: 'code-block',
        language: 'typescript',
        children: [{ text: 'const example = "code";' }]
      }
    ]

    const shortAnalysis = await aiService.analyzeContent(shortContent, 'requirements')
    const longAnalysis = await aiService.analyzeContent(longContent, 'requirements')

    expect(longAnalysis.completeness).toBeGreaterThan(shortAnalysis.completeness)
  })
})