import { describe, it, expect, beforeAll } from 'bun:test'
import { RequirementsService } from '../src/services/requirementsService'

describe('Requirements Service', () => {
  let requirementsService: RequirementsService

  beforeAll(() => {
    requirementsService = new RequirementsService()
  })

  it('should generate requirements from input', async () => {
    const input = 'Build a todo application with user authentication and task management'
    
    const requirements = await requirementsService.generateRequirements(input)

    expect(Array.isArray(requirements)).toBe(true)
    expect(requirements.length).toBeGreaterThan(0)
    
    // Check for required sections
    const hasHeading = requirements.some(item => item.type === 'heading')
    expect(hasHeading).toBe(true)
  })

  it('should validate requirements structure', async () => {
    const validRequirements = [
      {
        type: 'heading',
        level: 1,
        children: [{ text: '需求文档' }]
      },
      {
        type: 'paragraph',
        children: [{ text: '**用户故事:** 作为用户，我希望能够管理任务。' }]
      },
      {
        type: 'list',
        listType: 'ordered',
        children: [
          {
            type: 'list-item',
            children: [{ text: 'WHEN 用户创建任务 THEN 系统 SHALL 保存任务信息' }]
          }
        ]
      }
    ]

    const validation = await requirementsService.validateRequirements(validRequirements)

    expect(validation.isValid).toBe(true)
    expect(validation.completeness).toBeGreaterThan(0)
    expect(Array.isArray(validation.suggestions)).toBe(true)
  })

  it('should identify missing user stories', async () => {
    const incompleteRequirements = [
      {
        type: 'heading',
        level: 1,
        children: [{ text: '需求文档' }]
      },
      {
        type: 'paragraph',
        children: [{ text: '这是一个不完整的需求文档' }]
      }
    ]

    const validation = await requirementsService.validateRequirements(incompleteRequirements)

    expect(validation.isValid).toBe(false)
    expect(validation.issues).toContain('缺少用户故事定义')
    expect(validation.issues).toContain('缺少验收标准')
  })

  it('should identify non-EARS format acceptance criteria', async () => {
    const nonEARSRequirements = [
      {
        type: 'paragraph',
        children: [{ text: '**用户故事:** 作为用户，我希望登录系统。' }]
      },
      {
        type: 'list',
        listType: 'ordered',
        children: [
          {
            type: 'list-item',
            children: [{ text: '用户可以登录' }] // 不符合 EARS 格式
          }
        ]
      }
    ]

    const validation = await requirementsService.validateRequirements(nonEARSRequirements)

    expect(validation.issues.some(issue => issue.includes('EARS 格式'))).toBe(true)
  })

  it('should return requirement templates', () => {
    const templates = requirementsService.getRequirementTemplates()

    expect(Array.isArray(templates)).toBe(true)
    expect(templates.length).toBeGreaterThan(0)
    
    // Check template structure
    const webAppTemplate = templates.find(t => t.id === 'web-app')
    expect(webAppTemplate).toBeDefined()
    expect(webAppTemplate?.name).toBe('Web 应用程序')
    expect(Array.isArray(webAppTemplate?.template)).toBe(true)
  })

  it('should parse input to identify project type', async () => {
    const mobileInput = 'Build a mobile app for iOS and Android'
    const apiInput = 'Create a REST API service for user management'
    const dataInput = 'Develop a data analytics platform'

    const mobileRequirements = await requirementsService.generateRequirements(mobileInput)
    const apiRequirements = await requirementsService.generateRequirements(apiInput)
    const dataRequirements = await requirementsService.generateRequirements(dataInput)

    // All should generate valid requirements arrays
    expect(Array.isArray(mobileRequirements)).toBe(true)
    expect(Array.isArray(apiRequirements)).toBe(true)
    expect(Array.isArray(dataRequirements)).toBe(true)
  })

  it('should handle empty input gracefully', async () => {
    const requirements = await requirementsService.generateRequirements('')

    expect(Array.isArray(requirements)).toBe(true)
    // Should still generate some basic structure
    expect(requirements.length).toBeGreaterThan(0)
  })

  it('should generate requirements with context', async () => {
    const input = 'Build a task management system'
    const context = {
      existingRequirements: [
        {
          type: 'paragraph',
          children: [{ text: '现有需求：用户认证系统' }]
        }
      ]
    }

    const requirements = await requirementsService.generateRequirements(input, context)

    expect(Array.isArray(requirements)).toBe(true)
    expect(requirements.length).toBeGreaterThan(0)
  })

  it('should validate EARS format correctly', async () => {
    const correctEARSRequirements = [
      {
        type: 'paragraph',
        children: [{ text: '**用户故事:** 作为管理员，我希望管理用户账户。' }]
      },
      {
        type: 'list',
        listType: 'ordered',
        children: [
          {
            type: 'list-item',
            children: [{ text: 'WHEN 管理员删除用户 THEN 系统 SHALL 移除用户数据' }]
          },
          {
            type: 'list-item',
            children: [{ text: 'IF 用户正在使用系统 THEN 系统 SHALL 显示警告信息' }]
          }
        ]
      }
    ]

    const validation = await requirementsService.validateRequirements(correctEARSRequirements)

    expect(validation.isValid).toBe(true)
    expect(validation.issues.length).toBe(0)
  })

  it('should provide meaningful suggestions', async () => {
    const basicRequirements = [
      {
        type: 'heading',
        level: 1,
        children: [{ text: '需求文档' }]
      },
      {
        type: 'paragraph',
        children: [{ text: '**用户故事:** 作为用户，我希望使用系统。' }]
      }
    ]

    const validation = await requirementsService.validateRequirements(basicRequirements)

    expect(Array.isArray(validation.suggestions)).toBe(true)
    expect(validation.suggestions.length).toBeGreaterThan(0)
  })
})