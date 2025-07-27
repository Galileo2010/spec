import { describe, it, expect, beforeAll } from 'bun:test'
import { DesignService } from '../src/services/designService'

describe('Design Service', () => {
  let designService: DesignService

  beforeAll(() => {
    designService = new DesignService()
  })

  it('should generate design from requirements', async () => {
    const requirements = [
      {
        type: 'heading',
        level: 1,
        children: [{ text: '需求文档' }]
      },
      {
        type: 'paragraph',
        children: [{ text: '构建一个高并发的电商平台，支持百万用户同时访问' }]
      },
      {
        type: 'paragraph',
        children: [{ text: '**用户故事:** 作为用户，我希望能够快速浏览商品并下单购买。' }]
      }
    ]

    const design = await designService.generateDesign(requirements)

    expect(Array.isArray(design)).toBe(true)
    expect(design.length).toBeGreaterThan(0)
    
    // Check for required sections
    const hasArchitectureHeading = design.some(item => 
      item.type === 'heading' && 
      item.children && 
      item.children[0]?.text?.includes('架构')
    )
    expect(hasArchitectureHeading).toBe(true)
  })

  it('should validate design structure', async () => {
    const validDesign = [
      {
        type: 'heading',
        level: 1,
        children: [{ text: '设计文档' }]
      },
      {
        type: 'heading',
        level: 2,
        children: [{ text: '系统架构' }]
      },
      {
        type: 'heading',
        level: 3,
        children: [{ text: '技术栈' }]
      },
      {
        type: 'list',
        listType: 'unordered',
        children: [
          {
            type: 'list-item',
            children: [{ text: '前端: React + TypeScript' }]
          }
        ]
      },
      {
        type: 'heading',
        level: 3,
        children: [{ text: '组件设计' }]
      },
      {
        type: 'code-block',
        language: 'mermaid',
        children: [{ text: 'graph TD\n  A[Frontend] --> B[Backend]' }]
      }
    ]

    const validation = await designService.validateDesign(validDesign)

    expect(validation.isValid).toBe(true)
    expect(validation.completeness).toBeGreaterThan(0)
    expect(Array.isArray(validation.suggestions)).toBe(true)
  })

  it('should identify missing architecture sections', async () => {
    const incompleteDesign = [
      {
        type: 'heading',
        level: 1,
        children: [{ text: '设计文档' }]
      },
      {
        type: 'paragraph',
        children: [{ text: '这是一个不完整的设计文档' }]
      }
    ]

    const validation = await designService.validateDesign(incompleteDesign)

    expect(validation.isValid).toBe(false)
    expect(validation.issues).toContain('缺少系统架构设计')
    expect(validation.issues).toContain('缺少技术栈说明')
    expect(validation.issues).toContain('缺少组件设计')
  })

  it('should return architecture patterns', () => {
    const patterns = designService.getArchitecturePatterns()

    expect(Array.isArray(patterns)).toBe(true)
    expect(patterns.length).toBeGreaterThan(0)
    
    // Check pattern structure
    const microservicesPattern = patterns.find(p => p.name.includes('Microservices'))
    expect(microservicesPattern).toBeDefined()
    expect(Array.isArray(microservicesPattern?.benefits)).toBe(true)
    expect(Array.isArray(microservicesPattern?.drawbacks)).toBe(true)
    expect(Array.isArray(microservicesPattern?.useCases)).toBe(true)
  })

  it('should return tech stack recommendations', () => {
    const recommendations = designService.getTechStackRecommendations()

    expect(typeof recommendations).toBe('object')
    expect(recommendations['web-app']).toBeDefined()
    expect(Array.isArray(recommendations['web-app'].frontend)).toBe(true)
    expect(Array.isArray(recommendations['web-app'].backend)).toBe(true)
    expect(Array.isArray(recommendations['web-app'].database)).toBe(true)
  })

  it('should recommend appropriate tech stack for mobile app', async () => {
    const mobileRequirements = [
      {
        type: 'paragraph',
        children: [{ text: '构建一个移动应用程序，支持 iOS 和 Android 平台' }]
      }
    ]

    const design = await designService.generateDesign(mobileRequirements)

    expect(Array.isArray(design)).toBe(true)
    // Should generate design appropriate for mobile apps
  })

  it('should recommend microservices for high scalability needs', async () => {
    const highScaleRequirements = [
      {
        type: 'paragraph',
        children: [{ text: '构建一个分布式系统，需要支持百万级用户并发访问，具有高可扩展性' }]
      }
    ]

    const design = await designService.generateDesign(highScaleRequirements)

    expect(Array.isArray(design)).toBe(true)
    
    // Check if microservices architecture is mentioned
    const designText = design.map(item => JSON.stringify(item)).join(' ')
    expect(designText.toLowerCase()).toContain('microservices')
  })

  it('should handle API service requirements', async () => {
    const apiRequirements = [
      {
        type: 'paragraph',
        children: [{ text: '开发一个 RESTful API 服务，提供用户管理和数据处理功能' }]
      }
    ]

    const design = await designService.generateDesign(apiRequirements, 'api-service')

    expect(Array.isArray(design)).toBe(true)
    expect(design.length).toBeGreaterThan(0)
  })

  it('should handle data platform requirements', async () => {
    const dataRequirements = [
      {
        type: 'paragraph',
        children: [{ text: '构建一个数据分析平台，支持大数据处理和实时分析' }]
      }
    ]

    const design = await designService.generateDesign(dataRequirements, 'data-platform')

    expect(Array.isArray(design)).toBe(true)
    expect(design.length).toBeGreaterThan(0)
  })

  it('should validate design with mermaid diagrams', async () => {
    const designWithDiagrams = [
      {
        type: 'heading',
        level: 2,
        children: [{ text: '系统架构' }]
      },
      {
        type: 'heading',
        level: 3,
        children: [{ text: '技术栈' }]
      },
      {
        type: 'heading',
        level: 3,
        children: [{ text: '组件设计' }]
      },
      {
        type: 'code-block',
        language: 'mermaid',
        children: [{ text: 'graph TD\n  A[User] --> B[Frontend]\n  B --> C[Backend]\n  C --> D[Database]' }]
      }
    ]

    const validation = await designService.validateDesign(designWithDiagrams)

    expect(validation.isValid).toBe(true)
    expect(validation.issues.length).toBe(0)
  })

  it('should suggest adding diagrams when missing', async () => {
    const designWithoutDiagrams = [
      {
        type: 'heading',
        level: 2,
        children: [{ text: '系统架构' }]
      },
      {
        type: 'heading',
        level: 3,
        children: [{ text: '技术栈' }]
      },
      {
        type: 'heading',
        level: 3,
        children: [{ text: '组件设计' }]
      }
    ]

    const validation = await designService.validateDesign(designWithoutDiagrams)

    expect(validation.issues).toContain('建议添加架构图表')
  })

  it('should handle empty requirements gracefully', async () => {
    const design = await designService.generateDesign([])

    expect(Array.isArray(design)).toBe(true)
    // Should still generate some basic structure
  })

  it('should provide meaningful validation suggestions', async () => {
    const basicDesign = [
      {
        type: 'heading',
        level: 1,
        children: [{ text: '设计文档' }]
      },
      {
        type: 'paragraph',
        children: [{ text: '基本的设计描述' }]
      }
    ]

    const validation = await designService.validateDesign(basicDesign)

    expect(Array.isArray(validation.suggestions)).toBe(true)
    expect(validation.suggestions.length).toBeGreaterThan(0)
  })
})